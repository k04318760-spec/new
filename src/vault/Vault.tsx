import { useCallback, useEffect, useMemo, useState } from 'react'
import { Lock, RefreshCw, Printer, AlertTriangle, Clock, Check, X } from 'lucide-react'
import { config } from '@/content/config'
import { getLocalAnswers, type Answer } from '@/lib/answerStore'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE VAULT — yoursite.com/#/vault                                   ║
 * ║                                                                      ║
 * ║  Her private read of everything he wrote, replayed as the            ║
 * ║  conversation it actually was: her question, his reply, and how      ║
 * ║  long he sat there before answering.                                 ║
 * ║                                                                      ║
 * ║  The passcode is typed in here and sent to Apps Script, which        ║
 * ║  refuses to return a single row without it. It is never compiled     ║
 * ║  into the site, so reading the page source gets you nothing.         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type RemoteAnswer = Answer & { receivedAt?: string }
type Session = { id: string; answers: RemoteAnswer[]; started: string; device: string }

export default function Vault() {
  const [passcode, setPasscode] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'denied' | 'error'>('idle')
  const [answers, setAnswers] = useState<RemoteAnswer[]>([])
  const [errorText, setErrorText] = useState('')

  const url = config.storage.appsScriptUrl

  const load = useCallback(
    async (key: string) => {
      if (!url) {
        // Not wired up yet — fall back to whatever is on THIS device, so the
        // vault is still testable while she builds.
        setAnswers(getLocalAnswers())
        setState('ok')
        return
      }
      setState('loading')
      try {
        const res = await fetch(
          `${url}?action=read&key=${encodeURIComponent(key)}`,
          { redirect: 'follow' }
        )
        const data = await res.json()
        if (data.status === 'denied') {
          setState('denied')
          return
        }
        if (data.status !== 'ok') throw new Error(data.message || 'unexpected response')
        setAnswers(data.answers ?? [])
        setState('ok')
        sessionStorage.setItem('bd.vaultkey', key)
      } catch (err) {
        setErrorText(String(err))
        setState('error')
      }
    },
    [url]
  )

  // Convenience only: survives a refresh, dies when the tab closes.
  useEffect(() => {
    const saved = sessionStorage.getItem('bd.vaultkey')
    if (saved) {
      setPasscode(saved)
      void load(saved)
    }
  }, [load])

  const sessions = useMemo<Session[]>(() => {
    const map = new Map<string, RemoteAnswer[]>()
    for (const a of answers) {
      const list = map.get(a.sessionId) ?? []
      list.push(a)
      map.set(a.sessionId, list)
    }
    return [...map.entries()]
      .map(([id, list]) => {
        const sorted = [...list].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))
        return {
          id,
          answers: sorted,
          started: sorted[0]?.answeredAt ?? '',
          device: sorted[0]?.device ?? '',
        }
      })
      .sort((a, b) => b.started.localeCompare(a.started))
  }, [answers])

  /* ───────────────────────────────────────────────────── the lock screen */

  if (state !== 'ok') {
    return (
      <main className="ambient screen-min-h flex items-center justify-center px-6 py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void load(passcode)
          }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3">
            <Lock className="h-4 w-4 text-gold" aria-hidden />
            <span className="stencil">the vault</span>
          </div>

          <h1 className="font-display text-3xl text-bone">
            everything he wrote.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Only for you. Type the passcode you set in the Apps Script file.
          </p>

          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="passcode"
            autoComplete="current-password"
            aria-label="Vault passcode"
            className="tap-target mt-6 w-full rounded-xl border border-ink-4 bg-ink-2 px-4 py-3 text-bone
                       placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />

          <button
            type="submit"
            disabled={state === 'loading'}
            className="tap-target mt-3 w-full rounded-xl bg-gold px-4 py-3 font-medium text-ink
                       transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {state === 'loading' ? 'opening...' : 'open'}
          </button>

          {state === 'denied' && (
            <p className="mt-4 flex items-center gap-2 text-sm text-ember">
              <X className="h-4 w-4" aria-hidden /> Wrong passcode.
            </p>
          )}
          {state === 'error' && (
            <div className="mt-4 rounded-lg border border-ember/30 bg-ember/5 p-3 text-sm text-bone-dim">
              <p className="flex items-center gap-2 font-medium text-ember">
                <AlertTriangle className="h-4 w-4" aria-hidden /> Couldn’t reach the sheet.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Check that the Apps Script deployment is set to <em>Anyone</em>,
                and that the /exec URL in <code>config.ts</code> matches.
              </p>
              <p className="mt-2 break-all font-mono text-[10px] text-faint">{errorText}</p>
            </div>
          )}
          {!url && (
            <p className="mt-6 text-xs leading-relaxed text-faint">
              No Apps Script URL configured yet — this will show answers stored
              on <em>this</em> device only. See DEPLOY.md.
            </p>
          )}
        </form>
      </main>
    )
  }

  /* ─────────────────────────────────────────────────────── the transcript */

  return (
    <main className="ambient screen-min-h px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink-4 pb-6">
          <div>
            <span className="stencil">the vault</span>
            <h1 className="mt-2 font-display text-3xl text-bone sm:text-4xl">
              what {config.him.name} said
            </h1>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => void load(passcode)}
              className="tap-target flex items-center gap-2 rounded-lg border border-ink-4 px-3 text-sm text-bone-dim
                         transition-colors hover:border-gold/40 hover:text-bone"
              aria-label="Reload answers"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> refresh
            </button>
            <button
              onClick={() => window.print()}
              className="tap-target flex items-center gap-2 rounded-lg border border-ink-4 px-3 text-sm text-bone-dim
                         transition-colors hover:border-gold/40 hover:text-bone"
              aria-label="Save a copy as PDF"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden /> save a copy
            </button>
          </div>
        </header>

        {sessions.length === 0 && (
          <p className="py-20 text-center text-muted">
            Nothing yet. He hasn’t answered anything.
          </p>
        )}

        {sessions.map((session) => (
          <SessionBlock key={session.id} session={session} />
        ))}
      </div>
    </main>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function SessionBlock({ session }: { session: Session }) {
  const scored = session.answers.filter((a) => a.correct !== null)
  const right = scored.filter((a) => a.correct).length
  const totalSeconds = session.answers.reduce((n, a) => n + (a.secondsTaken || 0), 0)

  return (
    <section className="mb-16">
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
        <span className="font-mono">{formatWhen(session.started)}</span>
        <span aria-hidden>·</span>
        <span>{session.device}</span>
        {scored.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="text-gold">
              {right}/{scored.length} correct
            </span>
          </>
        )}
        <span aria-hidden>·</span>
        <span>{Math.round(totalSeconds)}s thinking</span>
      </div>

      <ol className="space-y-8">
        {session.answers.map((a) => (
          <li key={a.questionId}>
            {/* her question */}
            <p className="max-w-[85%] text-sm leading-relaxed text-muted">{a.question}</p>

            {/* his answer */}
            <div className="mt-2 flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink-3 px-4 py-3">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-bone">
                  {a.value || <span className="italic text-faint">(left blank)</span>}
                </p>
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-end gap-3 text-[11px] text-faint">
              {a.correct !== null &&
                (a.correct ? (
                  <span className="flex items-center gap-1 text-gold">
                    <Check className="h-3 w-3" aria-hidden /> got it
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-ember/70">
                    <X className="h-3 w-3" aria-hidden /> missed it
                  </span>
                ))}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {formatSeconds(a.secondsTaken)}
                {a.secondsTaken > 30 && (
                  <em className="ml-1 not-italic text-gold/70">— he thought about it</em>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function formatWhen(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSeconds(s: number): string {
  if (!s) return '—'
  if (s < 60) return `${Math.round(s)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}
