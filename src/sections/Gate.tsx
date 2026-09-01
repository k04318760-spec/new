import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { config } from '@/content/config'
import { useExperience } from '@/state/Experience'
import { CinemaButton } from '@/components/ui/CinemaButton'
import { FadeIn } from '@/components/ui/Reveal'
import { recordEvent } from '@/lib/answerStore'
import { TypeLines } from '@/components/ui/TypeLines'
import { q } from '@/content/quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE DOOR                                                            ║
 * ║                                                                      ║
 * ║  One question only he can answer. It does two jobs at once: it       ║
 * ║  keeps a stranger with the link out, and — more importantly — the    ║
 * ║  very first thing that happens tells him this was built for him      ║
 * ║  and nobody else.                                                    ║
 * ║                                                                      ║
 * ║  It never locks him out. After a few misses it opens anyway, with    ║
 * ║  a joke, because being shut out of your own birthday present is      ║
 * ║  not a bit worth committing to.                                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

/** Forgiving comparison — spacing, case and punctuation never matter. */
const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '')

export default function Gate() {
  const { next } = useExperience()
  const [value, setValue] = useState('')
  const [misses, setMisses] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const [passed, setPassed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Skipping the gate has to happen in an effect — advancing during render
  // means setting state on the provider mid-render, which React rejects.
  useEffect(() => {
    if (!config.gate.enabled) next()
  }, [next])

  if (!config.gate.enabled) return null

  const mercy = misses >= config.gate.mercyAfter

  /* ── he's in ────────────────────────────────────────────────────────── */
  if (passed) {
    return (
      <main className="ambient screen-h flex items-center justify-center px-6">
        <TypeLines
          lines={['okay.', 'come in. 😌', '', q.noSpecialOccasion]}
          startDelay={500}
          gap={1600}
          onDone={() => window.setTimeout(next, 2600)}
          className="max-w-lg space-y-4 text-center"
          lineClassName="font-display text-[clamp(1.3rem,5.5vw,2rem)] leading-snug text-bone text-balance-tight"
        />
      </main>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const guess = normalise(value)
    if (!guess) return

    const accepted = config.gate.accept.some((a) => normalise(a) === guess)

    if (accepted || mercy) {
      recordEvent('gate_passed', accepted ? 'correct' : 'let in anyway')
      // Not straight through the door — one line first, so the very first
      // thing that happens after he proves it's him is her saying why.
      setPassed(true)
      return
    }

    const nextMisses = misses + 1
    setMisses(nextMisses)
    setHint(config.gate.wrongHints[Math.min(nextMisses - 1, config.gate.wrongHints.length - 1)])
    setShake((s) => s + 1)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <main className="ambient screen-h flex flex-col items-center justify-center px-6">
      <FadeIn delay={0.3} className="w-full max-w-sm text-center">
        <p className="stencil">{config.gate.question}</p>

        <h1 className="mt-5 font-display text-[clamp(1.75rem,7vw,2.5rem)] leading-tight text-bone">
          {config.gate.subtitle}
        </h1>

        <motion.form
          onSubmit={submit}
          key={shake}
          animate={shake ? { x: [0, -9, 9, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="mt-8"
        >
          <label htmlFor="gate-answer" className="sr-only">
            {config.gate.subtitle}
          </label>
          <input
            id="gate-answer"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.gate.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="w-full border-b border-ink-4 bg-transparent px-2 py-3 text-center text-lg text-bone
                       transition-colors placeholder:text-faint focus:border-gold/60 focus:outline-none"
          />

          <div className="mt-8">
            <CinemaButton onClick={() => inputRef.current?.form?.requestSubmit()}>
              {mercy ? 'fine, let me in 😂' : 'open it'}
            </CinemaButton>
          </div>
        </motion.form>

        <div className="mt-6 h-6">
          <AnimatePresence mode="wait">
            {hint && (
              <motion.p
                key={hint + misses}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="handwriting !text-lg text-gold/80"
              >
                {mercy ? 'okay whatever, come in 😂' : hint}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>
    </main>
  )
}
