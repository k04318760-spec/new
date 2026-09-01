import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { ChatNode, ChatSession, Reactions } from '@/content/types'
import { pick, typingDelay, cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/hooks'
import { recordAnswer, currentScore } from '@/lib/answerStore'
import { SmartImage } from '@/components/ui/SmartImage'
import { AnswerControls, type Submission } from './ChatInputs'
import { TypingDots } from './TypingDots'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE CONVERSATION ENGINE                                             ║
 * ║                                                                      ║
 * ║  This is deliberately not a quiz component. There is no question     ║
 * ║  counter, no progress bar, no green tick. Her messages arrive at      ║
 * ║  reading speed with a typing indicator, sometimes two or three in     ║
 * ║  a row, and his answers land as replies.                             ║
 * ║                                                                      ║
 * ║  Every answer is written to storage the moment he sends it — never   ║
 * ║  collected up and posted at the end, because he may never reach      ║
 * ║  the end.                                                            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type Item =
  | { id: string; from: 'her'; kind: 'text'; text: string; handwritten?: boolean }
  | { id: string; from: 'her'; kind: 'photo'; src: string; alt: string; caption?: string }
  | { id: string; from: 'him'; kind: 'text'; text: string }

/**
 * A plain Omit collapses a union into its shared keys, which would make
 * `append` reject a photo. Distributing over the members keeps each shape
 * intact minus its id.
 */
type NewItem = Item extends infer T ? (T extends Item ? Omit<T, 'id'> : never) : never

type Phase = 'playing' | 'verdict' | 'outro' | 'done'

export function ChatThread({
  session,
  onComplete,
}: {
  session: ChatSession
  onComplete: () => void
}) {
  const reduced = useReducedMotion()
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState(0)
  const [promptStep, setPromptStep] = useState(0)
  const [awaiting, setAwaiting] = useState<Extract<ChatNode, { kind: 'question' }> | null>(null)
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState<Phase>('playing')
  /**
   * He has answered, and her reaction is still on its way. Without this the
   * playback loop would see `awaiting: null` with the cursor still parked on
   * the question, re-arm the same input for the second before the reaction
   * lands, and let him answer it twice.
   */
  const [resolving, setResolving] = useState(false)
  const shownAt = useRef<number>(0)
  const bottom = useRef<HTMLDivElement>(null)

  const append = useCallback((item: NewItem) => {
    setItems((prev) => [...prev, { ...item, id: `${prev.length}-${Date.now()}` } as Item])
  }, [])

  /* Keep the newest message in view without yanking the page around. */
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' })
  }, [items, typing, awaiting, reduced])

  /* ─────────────────────────────────────────────── the playback loop ── */

  useEffect(() => {
    if (phase !== 'playing' || awaiting || resolving) return

    const node = session.nodes[cursor]

    // Ran out of nodes — move to the verdict, or straight to the outro.
    if (!node) {
      setPhase(session.verdict ? 'verdict' : 'outro')
      return
    }

    let cancelled = false
    const timers: number[] = []

    const say = (text: string, extra?: Partial<Item>, after?: () => void) => {
      setTyping(true)
      timers.push(
        window.setTimeout(
          () => {
            if (cancelled) return
            setTyping(false)
            append({ from: 'her', kind: 'text', text, ...extra } as NewItem)
            after?.()
          },
          reduced ? 120 : typingDelay(text)
        )
      )
    }

    switch (node.kind) {
      case 'text':
        timers.push(
          window.setTimeout(
            () => !cancelled && say(node.text, { handwritten: node.handwritten }, () => setCursor((c) => c + 1)),
            reduced ? 0 : (node.delay ?? 250)
          )
        )
        break

      case 'pause':
        timers.push(window.setTimeout(() => !cancelled && setCursor((c) => c + 1), reduced ? 100 : node.ms))
        break

      case 'photo':
        setTyping(true)
        timers.push(
          window.setTimeout(
            () => {
              if (cancelled) return
              setTyping(false)
              append({ from: 'her', kind: 'photo', src: node.src, alt: node.alt, caption: node.caption })
              setCursor((c) => c + 1)
            },
            reduced ? 120 : 1100
          )
        )
        break

      case 'voice':
        // Rendered as a text bubble until you actually record one.
        say('🎤 voice note', undefined, () => setCursor((c) => c + 1))
        break

      case 'question': {
        const prompts = Array.isArray(node.prompt) ? node.prompt : [node.prompt]

        if (promptStep < prompts.length) {
          say(prompts[promptStep], undefined, () => setPromptStep((s) => s + 1))
        } else {
          // All her lines are out — hand him the keyboard.
          shownAt.current = performance.now()
          setAwaiting(node)
        }
        break
      }
    }

    return () => {
      cancelled = true
      timers.forEach(window.clearTimeout)
    }
  }, [cursor, promptStep, phase, awaiting, resolving, session, append, reduced])

  /* ──────────────────────────────────────────────────── his answer ── */

  const handleSubmit = useCallback(
    (submission: Submission) => {
      const question = awaiting
      if (!question) return

      const secondsTaken = Math.round((performance.now() - shownAt.current) / 100) / 10
      const promptText = Array.isArray(question.prompt)
        ? question.prompt.join(' ')
        : question.prompt

      const correct =
        question.scored && question.input.type === 'choice' && question.input.correctId
          ? submission.choiceId === question.input.correctId
          : null

      // His bubble first, so the UI never feels like it's waiting on a network.
      append({ from: 'him', kind: 'text', text: submission.label })
      setAwaiting(null)
      setResolving(true)

      // Then the write. Local immediately, network right behind it.
      recordAnswer({
        questionId: question.id,
        question: promptText,
        sessionCode: session.code,
        value: submission.label,
        raw: submission.raw,
        correct,
        secondsTaken,
      })

      // And her reaction.
      const line = chooseReaction(question.reactions, submission, correct)
      if (line) {
        setTyping(true)
        window.setTimeout(
          () => {
            setTyping(false)
            append({ from: 'her', kind: 'text', text: line })
            setPromptStep(0)
            setCursor((c) => c + 1)
            setResolving(false)
          },
          reduced ? 150 : 900 + Math.random() * 700
        )
      } else {
        setPromptStep(0)
        setCursor((c) => c + 1)
        setResolving(false)
      }
    },
    [awaiting, append, session.code, reduced]
  )

  /* ────────────────────────────────────────────── verdict and outro ── */

  const verdictLines = useMemo(() => {
    if (!session.verdict) return []
    const { correct, answered } = currentScore()
    const band = session.verdict.find((v) => correct >= v.min && correct <= v.max)
    if (!band) return []
    return band.lines.map((l) => l.replace('[SCORE]', `${correct}/${answered}`))
  }, [session.verdict])

  useEffect(() => {
    if (phase !== 'verdict') return
    if (!verdictLines.length) {
      setPhase('outro')
      return
    }
    let i = 0
    const tick = () => {
      if (i >= verdictLines.length) {
        window.setTimeout(() => setPhase('outro'), reduced ? 200 : 1200)
        return
      }
      const text = verdictLines[i++]
      setTyping(true)
      window.setTimeout(
        () => {
          setTyping(false)
          append({ from: 'her', kind: 'text', text })
          window.setTimeout(tick, reduced ? 120 : 700)
        },
        reduced ? 120 : typingDelay(text)
      )
    }
    tick()
  }, [phase, verdictLines, append, reduced])

  useEffect(() => {
    if (phase !== 'outro') return
    const lines = session.outro ?? []
    if (!lines.length) {
      setPhase('done')
      return
    }
    let i = 0
    const tick = () => {
      if (i >= lines.length) {
        window.setTimeout(() => setPhase('done'), reduced ? 200 : 1400)
        return
      }
      const text = lines[i++]
      setTyping(true)
      window.setTimeout(
        () => {
          setTyping(false)
          append({ from: 'her', kind: 'text', text })
          window.setTimeout(tick, reduced ? 120 : 650)
        },
        reduced ? 120 : typingDelay(text)
      )
    }
    tick()
  }, [phase, session.outro, append, reduced])

  useEffect(() => {
    if (phase === 'done') {
      const t = window.setTimeout(onComplete, reduced ? 300 : 1600)
      return () => window.clearTimeout(t)
    }
  }, [phase, onComplete, reduced])

  /* ────────────────────────────────────────────────────────── render ── */

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <div className="flex-1 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <Bubble key={item.id} item={item} />
          ))}
        </AnimatePresence>

        {typing && <TypingDots />}
        <div ref={bottom} className="h-px" />
      </div>

      {/* The reply area. Sticks to the bottom so the keyboard never covers it. */}
      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-ink via-ink to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <AnimatePresence mode="wait">
          {awaiting && (
            <motion.div
              key={awaiting.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnswerControls input={awaiting.input} onSubmit={handleSubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── bubbles ── */

function Bubble({ item }: { item: Item }) {
  const reduced = useReducedMotion()
  const mine = item.from === 'him'

  return (
    <motion.div
      layout={!reduced}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
    >
      {item.kind === 'photo' ? (
        <figure className="max-w-[78%]">
          <SmartImage
            src={item.src}
            alt={item.alt}
            className="aspect-[4/5] rounded-2xl rounded-bl-sm"
            sizes="(max-width: 640px) 78vw, 340px"
          />
          {item.caption && (
            <figcaption className="mt-2 pl-1 text-sm text-muted">{item.caption}</figcaption>
          )}
        </figure>
      ) : (
        <p
          className={cn(
            'max-w-[82%] whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed',
            mine
              ? 'rounded-2xl rounded-br-sm bg-gold text-ink'
              : 'rounded-2xl rounded-bl-sm bg-ink-3 text-bone',
            !mine && item.handwritten && 'handwriting bg-transparent !px-1 text-gold'
          )}
        >
          {item.text}
        </p>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────── reactions ── */

/**
 * Picks what she says back. Specific beats general: a reaction written for
 * this exact option always wins over the generic right/wrong lines.
 */
function chooseReaction(
  reactions: Reactions,
  submission: Submission,
  correct: boolean | null
): string | null {
  if (submission.choiceId && reactions.byOption?.[submission.choiceId]) {
    return pick(reactions.byOption[submission.choiceId])
  }

  if (reactions.byRange && typeof submission.raw === 'number') {
    const band = reactions.byRange.find(
      (r) => (submission.raw as number) >= r.min && (submission.raw as number) <= r.max
    )
    if (band) return pick(band.lines)
  }

  if (correct === true && reactions.correct) return pick(reactions.correct)
  if (correct === false && reactions.wrong) return pick(reactions.wrong)

  // Free text: react to how much he actually bothered to write.
  if (typeof submission.raw === 'string') {
    const words = submission.raw.trim().split(/\s+/).length
    if (words > 18 && reactions.long) return pick(reactions.long)
    if (words <= 3 && reactions.short) return pick(reactions.short)
  }

  return pick(reactions.any)
}
