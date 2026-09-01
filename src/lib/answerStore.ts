import { config } from '@/content/config'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ANSWER STORAGE                                                      ║
 * ║                                                                      ║
 * ║  The guarantee: if he answers a question, that answer survives.      ║
 * ║  Even if he closes the tab, loses signal, or never reaches the end.  ║
 * ║                                                                      ║
 * ║    1. Written to localStorage the instant he sends it.               ║
 * ║    2. Pushed to the server immediately, per answer — never batched   ║
 * ║       up and sent at the end, because the end may never come.        ║
 * ║    3. Failed pushes sit in a queue and retry on reconnect, on tab    ║
 * ║       focus, on a timer, and on the next page load.                  ║
 * ║    4. On tab close, the queue goes out via sendBeacon, which         ║
 * ║       survives page unload. A normal fetch does not.                 ║
 * ║    5. Every write carries sessionId + questionId, so a retry         ║
 * ║       overwrites its row instead of creating a duplicate.            ║
 * ║    6. Two independent channels (Apps Script + backup form). If       ║
 * ║       either lands, she has the answer.                              ║
 * ║    7. If everything above fails, the finale still offers a           ║
 * ║       prefilled WhatsApp message containing every answer.            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const KEY_SESSION = 'bd.session'
const KEY_ANSWERS = 'bd.answers'
const KEY_QUEUE = 'bd.queue'

export type Answer = {
  /** Stable per browser, so all his answers group into one conversation. */
  sessionId: string
  questionId: string
  /** The question as he saw it, so the Vault reads correctly years later. */
  question: string
  sessionCode: string
  /** Human-readable answer. This is what she actually reads. */
  value: string
  /** Machine value: choice id, slider number, raw text. */
  raw: string | number
  /** null for unscored questions. */
  correct: boolean | null
  /** How long he sat on it. Worth more than you'd think. */
  secondsTaken: number
  answeredAt: string
  device: string
}

type Envelope =
  | { kind: 'answer'; payload: Answer }
  | { kind: 'event'; payload: { sessionId: string; event: string; at: string; detail?: string } }

/* --------------------------------------------------------------- plumbing */

const safeLocal = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      // Private mode, quota, or a browser that blocks storage. The network
      // path still works; we just lose the local copy.
      return false
    }
  },
}

function uuid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `s-${Math.floor(performance.now())}-${Math.floor(Math.random() * 1e9).toString(36)}`
  }
}

export function getSessionId(): string {
  let id = safeLocal.get<string | null>(KEY_SESSION, null)
  if (!id) {
    id = uuid()
    safeLocal.set(KEY_SESSION, id)
  }
  return id
}

function device(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  const mobile = /iPhone|iPad|Android/i.test(ua) ? 'mobile' : 'desktop'
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Win/.test(ua) ? 'Windows' : '?'
  return `${mobile} · ${os} · ${window.innerWidth}px`
}

/* ------------------------------------------------------------------ queue */

function readQueue(): Envelope[] {
  return safeLocal.get<Envelope[]>(KEY_QUEUE, [])
}

function writeQueue(q: Envelope[]) {
  safeLocal.set(KEY_QUEUE, q.slice(-200)) // hard cap, just in case
}

function enqueue(envelope: Envelope) {
  writeQueue([...readQueue(), envelope])
}

/** Drops every envelope that matches — used after a confirmed send. */
function dequeue(sent: Envelope[]) {
  const sentKeys = new Set(sent.map(envelopeKey))
  writeQueue(readQueue().filter((e) => !sentKeys.has(envelopeKey(e))))
}

function envelopeKey(e: Envelope): string {
  return e.kind === 'answer'
    ? `a:${e.payload.sessionId}:${e.payload.questionId}`
    : `e:${e.payload.sessionId}:${e.payload.event}:${e.payload.at}`
}

/* ------------------------------------------------------------- transports */

/**
 * Apps Script rejects a preflight, so we send text/plain — a "simple request"
 * the browser fires without asking permission first. Apps Script redirects to
 * googleusercontent.com, which does send CORS headers, so we can read the
 * response and actually confirm the write landed.
 */
async function sendToAppsScript(batch: Envelope[]): Promise<boolean> {
  const url = config.storage.appsScriptUrl
  if (!url) return false
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ batch }),
      redirect: 'follow',
      keepalive: batch.length <= 5,
    })
    if (!res.ok) {
      lastTransportError = `HTTP ${res.status} from Apps Script`
      return false
    }
    const text = await res.text()
    if (text.includes('"status":"ok"') || text.includes("'status':'ok'")) return true

    // The script answered but refused the write. Its own message is far more
    // useful than "failed", so keep it for the self-test to display.
    lastTransportError = text.slice(0, 300)
    return false
  } catch (err) {
    lastTransportError = String(err)
    return false
  }
}

/** Whatever went wrong last time, verbatim. Read by the self-test screen. */
let lastTransportError = ''
export const getLastTransportError = () => lastTransportError

/** Independent second channel. Fire-and-hope; never blocks the primary. */
async function sendToBackupForm(batch: Envelope[]): Promise<boolean> {
  const url = config.storage.backupFormUrl
  if (!url) return false
  try {
    const answers = batch.filter((e) => e.kind === 'answer') as Extract<Envelope, { kind: 'answer' }>[]
    if (!answers.length) return false
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        subject: `answers from ${config.him.name}`,
        ...Object.fromEntries(answers.map((a) => [a.payload.questionId, `${a.payload.question} → ${a.payload.value} (${a.payload.secondsTaken}s)`])),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ flush */

type FlushResult = { sent: number; pending: number }

let inFlight: Promise<FlushResult> | null = null

/**
 * Anyone who awaits this gets the real outcome.
 *
 * This used to bail out with `{ sent: 0 }` whenever another flush was
 * already running — fine for the fire-and-forget callers, badly wrong for
 * anyone awaiting. `recordAnswer` kicks off a flush without awaiting it, so
 * a caller who then awaited `flush()` landed straight on that early return
 * and concluded the delivery had failed, seconds before it succeeded.
 * Sharing the in-flight promise means awaiting actually waits.
 */
export function flush(): Promise<FlushResult> {
  if (inFlight) return inFlight
  inFlight = runFlush().finally(() => {
    inFlight = null
  })
  return inFlight
}

async function runFlush(): Promise<FlushResult> {
  const queue = readQueue()
  if (!queue.length) return { sent: 0, pending: 0 }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { sent: 0, pending: queue.length }
  }

  // Both channels get the same batch. Either landing is good enough.
  const [primary, backup] = await Promise.all([
    sendToAppsScript(queue),
    sendToBackupForm(queue),
  ])

  if (primary || backup) {
    dequeue(queue)
    // Anything enqueued while that request was in the air is still waiting.
    return { sent: queue.length, pending: pendingCount() }
  }
  return { sent: 0, pending: queue.length }
}

/**
 * Drains the queue, not just the batch that happened to be in it when the
 * first request went out. Stops early once it stops making progress, so a
 * genuine outage doesn't spin.
 */
export async function flushUntilEmpty(maxRounds = 4): Promise<FlushResult> {
  let sent = 0
  let previous = -1

  for (let round = 0; round < maxRounds; round++) {
    const result = await flush()
    sent += result.sent
    if (result.pending === 0) return { sent, pending: 0 }
    if (result.pending === previous) break // no progress — stop trying
    previous = result.pending
  }
  return { sent, pending: pendingCount() }
}

/**
 * The unload path. `fetch` gets killed when the page goes away;
 * sendBeacon is handed to the browser and delivered regardless.
 */
function beaconFlush() {
  const queue = readQueue()
  const url = config.storage.appsScriptUrl
  if (!queue.length || !url || typeof navigator.sendBeacon !== 'function') return
  try {
    const blob = new Blob([JSON.stringify({ batch: queue })], {
      type: 'text/plain;charset=utf-8',
    })
    // We cannot read the result, so the queue is left in place. If it did
    // land, the next flush writes the same rows again — and because rows are
    // keyed by sessionId+questionId, Apps Script overwrites instead of
    // duplicating. Sending twice is fine. Losing it is not.
    navigator.sendBeacon(url, blob)
  } catch {
    /* nothing else we can do at this point */
  }
}

/* ------------------------------------------------------------- public API */

export function recordAnswer(input: Omit<Answer, 'sessionId' | 'answeredAt' | 'device'>) {
  const answer: Answer = {
    ...input,
    sessionId: getSessionId(),
    answeredAt: new Date().toISOString(),
    device: device(),
  }

  // 1. Local first. This is the write that cannot fail on him.
  const all = safeLocal.get<Answer[]>(KEY_ANSWERS, [])
  const next = [...all.filter((a) => a.questionId !== answer.questionId), answer]
  safeLocal.set(KEY_ANSWERS, next)

  // 2. Then the network, via the queue so a failure is never lost.
  enqueue({ kind: 'answer', payload: answer })
  void flush()

  return answer
}

export function recordEvent(event: string, detail?: string) {
  enqueue({
    kind: 'event',
    payload: { sessionId: getSessionId(), event, at: new Date().toISOString(), detail },
  })
  void flush()
}

export function getLocalAnswers(): Answer[] {
  return safeLocal.get<Answer[]>(KEY_ANSWERS, [])
}

export function getAnswer(questionId: string): Answer | undefined {
  return getLocalAnswers().find((a) => a.questionId === questionId)
}

export function pendingCount(): number {
  return readQueue().length
}

/** Score across every scored question he has answered so far. */
export function currentScore(): { correct: number; answered: number } {
  const scored = getLocalAnswers().filter((a) => a.correct !== null)
  return { correct: scored.filter((a) => a.correct).length, answered: scored.length }
}

/**
 * The human fallback. Opens WhatsApp with everything he wrote, prefilled.
 * Works with no server, no config, no internet policy in the way.
 */
export function whatsappHandoffUrl(): string | null {
  const number = config.storage.whatsappNumber
  const answers = getLocalAnswers()
  if (!answers.length) return null

  const body = [
    `my answers 👇`,
    '',
    ...answers.map((a) => `${a.question}\n→ ${a.value}`),
  ].join('\n\n')

  const base = number ? `https://wa.me/${number}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(body)}`
}

/* ------------------------------------------------------------ the watchers */

let started = false

export function startAnswerSync() {
  if (started || typeof window === 'undefined') return
  started = true

  // Anything left over from a previous visit goes out immediately.
  void flush()

  window.addEventListener('online', () => void flush())
  window.addEventListener('focus', () => void flush())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') beaconFlush()
    else void flush()
  })
  // pagehide fires on iOS Safari where beforeunload does not.
  window.addEventListener('pagehide', beaconFlush)

  // Slow background retry, in case every event above somehow misses.
  window.setInterval(() => void flush(), 20_000)
}
