import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Send } from 'lucide-react'
import type { AnswerInput, Choice } from '@/content/types'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/hooks'

/**
 * How he replies. Every one of these returns the same shape, so the thread
 * doesn't care which kind of question it just asked.
 *
 *  `raw`   — what gets scored and stored machine-side (choice id, a number)
 *  `label` — what she reads in the Vault, in his words
 */
export type Submission = { raw: string | number; label: string; choiceId?: string }

export function AnswerControls({
  input,
  onSubmit,
}: {
  input: AnswerInput
  onSubmit: (s: Submission) => void
}) {
  switch (input.type) {
    case 'choice':
      return <ChoiceInput options={input.options} onSubmit={onSubmit} />
    case 'text':
      return <TextInput input={input} onSubmit={onSubmit} />
    case 'slider':
      return <SliderInput input={input} onSubmit={onSubmit} />
    case 'thisOrThat':
      return (
        <ChoiceInput
          options={[
            { id: 'a', label: input.a },
            { id: 'b', label: input.b },
          ]}
          onSubmit={onSubmit}
          columns
        />
      )
    case 'emojiScale':
      return <EmojiScaleInput emojis={input.emojis} onSubmit={onSubmit} />
    default:
      return null
  }
}

/* ─────────────────────────────────────────────────────────────── choices ── */

function ChoiceInput({
  options,
  onSubmit,
  columns = false,
}: {
  options: Choice[]
  onSubmit: (s: Submission) => void
  columns?: boolean
}) {
  const [othering, setOthering] = useState<Choice | null>(null)

  // "Something else" turns into a free-text box rather than a dead end.
  if (othering) {
    return (
      <TextInput
        input={{ type: 'text', placeholder: 'go on then...' }}
        onSubmit={(s) => onSubmit({ ...s, choiceId: othering.id, label: s.label })}
      />
    )
  }

  return (
    <div className={cn('flex flex-wrap justify-end gap-2', columns && 'grid grid-cols-2 gap-3')}>
      {options.map((opt, i) => (
        <motion.button
          key={opt.id}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            opt.opensText
              ? setOthering(opt)
              : onSubmit({ raw: opt.id, label: opt.label, choiceId: opt.id })
          }
          className={cn(
            'tap-target rounded-2xl border border-gold/25 bg-gold/[0.04] px-4 py-3',
            'text-left text-[15px] leading-snug text-bone transition-colors',
            'hover:border-gold/60 hover:bg-gold/10 active:bg-gold/15',
            columns ? 'justify-center text-center' : 'max-w-full'
          )}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── free text ── */

function TextInput({
  input,
  onSubmit,
}: {
  input: Extract<AnswerInput, { type: 'text' }>
  onSubmit: (s: Submission) => void
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  // Grows with what he writes — a single-line box quietly tells him to be
  // brief, and the whole point of these questions is that he isn't.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [value])

  const ready = value.trim().length >= (input.minLength ?? 1)

  const send = () => {
    if (!ready) return
    onSubmit({ raw: value.trim(), label: value.trim() })
    setValue('')
  }

  return (
    <div className="flex items-end gap-2">
      <label htmlFor="chat-reply" className="sr-only">
        your answer
      </label>
      <textarea
        id="chat-reply"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends; Shift+Enter is a new line. Never trap him in a box.
          if (e.key === 'Enter' && !e.shiftKey && !input.multiline) {
            e.preventDefault()
            send()
          }
        }}
        placeholder={input.placeholder ?? 'type something...'}
        enterKeyHint="send"
        className="min-h-[48px] flex-1 resize-none rounded-2xl border border-ink-4 bg-ink-2 px-4 py-3
                   text-[16px] leading-relaxed text-bone placeholder:text-faint
                   focus:border-gold/50 focus:outline-none"
      />
      <button
        type="button"
        onClick={send}
        disabled={!ready}
        aria-label="Send your answer"
        className="tap-target flex shrink-0 items-center justify-center rounded-full bg-gold text-ink
                   transition-opacity disabled:opacity-30"
      >
        <Send className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────── slider ── */

function SliderInput({
  input,
  onSubmit,
}: {
  input: Extract<AnswerInput, { type: 'slider' }>
  onSubmit: (s: Submission) => void
}) {
  const max = input.overshoot ? 130 : 100
  const [value, setValue] = useState(50)
  const [touched, setTouched] = useState(false)
  const reduced = useReducedMotion()

  const overshot = value > 100

  return (
    <div className="w-full rounded-2xl border border-gold/20 bg-gold/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between text-2xl">
        <span aria-hidden>{input.leftEmoji}</span>
        <motion.span
          key={overshot ? 'over' : 'under'}
          animate={reduced || !overshot ? {} : { scale: [1, 1.35, 1] }}
          transition={{ duration: 0.5, repeat: overshot ? Infinity : 0, repeatDelay: 0.8 }}
          aria-hidden
        >
          {input.rightEmoji}
        </motion.span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value))
          setTouched(true)
        }}
        aria-label="how much"
        aria-valuetext={`${value} percent`}
        className="h-11 w-full cursor-pointer appearance-none bg-transparent
                   [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full
                   [&::-webkit-slider-runnable-track]:bg-ink-4
                   [&::-webkit-slider-thumb]:mt-[-10px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold
                   [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-ink-4
                   [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold"
      />

      <div className="mt-1 flex justify-between text-[11px] text-faint">
        {input.labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span
          className={cn(
            'font-mono text-sm transition-colors',
            overshot ? 'text-ember' : 'text-bone-dim'
          )}
        >
          {value}%{overshot && ' 👀'}
        </span>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              raw: value,
              label: overshot ? `${value}% (he broke the slider)` : `${value}%`,
            })
          }
          disabled={!touched}
          className="tap-target rounded-full bg-gold px-6 text-sm font-medium text-ink
                     transition-opacity disabled:opacity-30"
        >
          {touched ? 'lock it in' : 'drag it'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── emoji scale ── */

function EmojiScaleInput({
  emojis,
  onSubmit,
}: {
  emojis: string[]
  onSubmit: (s: Submission) => void
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {emojis.map((emoji, i) => (
        <motion.button
          key={emoji}
          type="button"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSubmit({ raw: i, label: emoji })}
          aria-label={`option ${i + 1} of ${emojis.length}`}
          className="tap-target flex items-center justify-center rounded-2xl border border-gold/25
                     bg-gold/[0.04] px-4 text-2xl transition-colors hover:border-gold/60 hover:bg-gold/10"
        >
          <span aria-hidden>{emoji}</span>
        </motion.button>
      ))}
    </div>
  )
}
