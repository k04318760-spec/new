import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { config } from '@/content/config'
import { useExperience } from '@/state/Experience'
import { TypeLines } from '@/components/ui/TypeLines'
import { CinemaButton, Halo } from '@/components/ui/CinemaButton'
import { useReducedMotion } from '@/lib/hooks'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE OPENING                                                         ║
 * ║                                                                      ║
 * ║  Black. A few lines. One button. Nothing else on screen — no menu,   ║
 * ║  no scroll bar of content underneath hinting at what's coming.       ║
 * ║                                                                      ║
 * ║  The music starts on the tap and nowhere else. Every browser blocks  ║
 * ║  audio before a real gesture, and trying to sneak past that just     ║
 * ║  produces a silent site and a console full of red.                   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const OPENING_LINES = [
  `Hey, ${config.him.name}. 👀`,
  'Today is your birthday.',
  'I could have just sent you a normal birthday message...',
  '',
  "But where's the fun in that? 😂",
]

const LOADING_LINES = [
  'Collecting memories...',
  'Finding embarrassing photos...',
  'Hiding the worst ones...',
  'Preparing something special...',
]

export default function Intro() {
  const { next, start } = useExperience()
  const [phase, setPhase] = useState<'lines' | 'ready' | 'loading' | 'begin'>('lines')

  const onStart = async () => {
    // Inside the tap, so the browser lets the audio through.
    await start()
    setPhase('loading')
  }

  return (
    <main className="ambient screen-h relative flex flex-col items-center justify-center overflow-hidden px-6">
      <Particles />

      <AnimatePresence mode="wait">
        {/* ── the opening lines ────────────────────────────────────────── */}
        {(phase === 'lines' || phase === 'ready') && (
          <motion.div
            key="lines"
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-lg text-center"
          >
            <TypeLines
              lines={OPENING_LINES}
              startDelay={900}
              gap={1700}
              onDone={() => setPhase('ready')}
              className="space-y-5"
              lineClassName="font-display text-[clamp(1.5rem,6.5vw,2.4rem)] leading-snug text-bone text-balance-tight"
            />

            <div className="mt-14 h-24">
              <AnimatePresence>
                {phase === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Halo>
                      <CinemaButton onClick={onStart} autoFocus>
                        Start Your Surprise 🎁
                      </CinemaButton>
                    </Halo>
                    <p className="stencil !text-[10px]">
                      headphones, if you have them · {config.runtime}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── the loading beat ─────────────────────────────────────────── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-md"
          >
            <LoadingSequence onDone={() => setPhase('begin')} />
          </motion.div>
        )}

        {/* ── and in ───────────────────────────────────────────────────── */}
        {phase === 'begin' && (
          <motion.div
            key="begin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center"
          >
            <TypeLines
              lines={['Okay.', "Let's begin. ❤️"]}
              startDelay={500}
              gap={1500}
              onDone={() => window.setTimeout(next, 1600)}
              className="space-y-4"
              lineClassName="font-display text-[clamp(1.75rem,7vw,2.75rem)] text-bone"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* ─────────────────────────────────────────────────────── the fake loader ── */

function LoadingSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (step >= LOADING_LINES.length) {
      const t = window.setTimeout(onDone, 700)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), reduced ? 350 : 1250)
    return () => window.clearTimeout(t)
  }, [step, onDone, reduced])

  return (
    <div>
      <ul className="space-y-3">
        {LOADING_LINES.slice(0, step + 1).map((line, i) => (
          <motion.li
            key={line}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < step ? 0.35 : 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 font-mono text-sm text-bone-dim"
          >
            <span className={i < step ? 'text-gold' : 'text-faint'}>{i < step ? '✓' : '·'}</span>
            {line}
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 h-px w-full overflow-hidden bg-ink-4">
        <motion.div
          className="h-full bg-gold/70"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.min(1, (step + 1) / LOADING_LINES.length) }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── particles ── */

/**
 * Dust in a projector beam. Twelve of them, transform-only, paused entirely
 * when he has asked his phone for less motion.
 */
function Particles() {
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }).map((_, i) => {
        const left = (i * 37) % 100
        const delay = (i % 5) * 1.7
        const duration = 14 + (i % 4) * 5
        const size = i % 3 === 0 ? 2.5 : 1.5
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold/25"
            style={{ left: `${left}%`, width: size, height: size }}
            initial={{ y: '105vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        )
      })}
    </div>
  )
}
