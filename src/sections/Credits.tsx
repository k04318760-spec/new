import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Gift } from 'lucide-react'
import { fakeEnding, credits, postCredits } from '@/content/finale'
import { config } from '@/content/config'
import { useExperience } from '@/state/Experience'
import { TypeLines } from '@/components/ui/TypeLines'
import { CinemaButton, Halo } from '@/components/ui/CinemaButton'
import { music } from '@/lib/audio'
import { useReducedMotion } from '@/lib/hooks'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE FAKE ENDING                                                     ║
 * ║                                                                      ║
 * ║  A real credits roll, because he has been trained his entire life    ║
 * ║  to believe credits mean it is over. The music fades out. The        ║
 * ║  screen goes black and stays black for four full seconds — long      ║
 * ║  enough that he reaches for the home button.                         ║
 * ║                                                                      ║
 * ║  Then the post-credits scene.                                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type Phase = 'ending' | 'roll' | 'silence' | 'interrupt' | 'gift'

export default function Credits() {
  const { next } = useExperience()
  const [phase, setPhase] = useState<Phase>('ending')
  const reduced = useReducedMotion()

  /* Black. Nothing. Let it sit. */
  useEffect(() => {
    if (phase !== 'silence') return
    music.fadeOutAll(1800)
    const t = window.setTimeout(() => setPhase('interrupt'), reduced ? 900 : credits.silenceMs)
    return () => window.clearTimeout(t)
  }, [phase, reduced])

  return (
    <main className="screen-min-h flex flex-col items-center justify-center bg-ink px-6 py-24 text-center">
      <AnimatePresence mode="wait">
        {/* ── "and that's everything" ────────────────────────────────────── */}
        {phase === 'ending' && (
          <motion.div key="ending" exit={{ opacity: 0 }} transition={{ duration: 1 }} className="max-w-lg">
            <TypeLines
              lines={[...fakeEnding.lines, '', fakeEnding.thanks]}
              startDelay={900}
              gap={1450}
              onDone={() => window.setTimeout(() => setPhase('roll'), 1500)}
              className="space-y-4"
              lineClassName="font-display text-[clamp(1.35rem,5.5vw,2.1rem)] leading-snug text-bone"
            />
          </motion.div>
        )}

        {/* ── the credits roll ───────────────────────────────────────────── */}
        {phase === 'roll' && (
          <motion.div
            key="roll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-md"
          >
            <CreditRoll onDone={() => setPhase('silence')} />
          </motion.div>
        )}

        {/* ── nothing at all ─────────────────────────────────────────────── */}
        {phase === 'silence' && <div key="silence" className="h-40" aria-hidden />}

        {/* ── the interruption ───────────────────────────────────────────── */}
        {phase === 'interrupt' && (
          <motion.div
            key="interrupt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg"
          >
            <TypeLines
              lines={[...postCredits.lines, '', postCredits.punchline]}
              startDelay={600}
              gap={1500}
              onDone={() => window.setTimeout(() => setPhase('gift'), 1200)}
              className="space-y-4"
              lineClassName="font-display text-[clamp(1.4rem,6vw,2.25rem)] leading-snug text-bone"
            />
          </motion.div>
        )}

        {/* ── the box ────────────────────────────────────────────────────── */}
        {phase === 'gift' && (
          <motion.div
            key="gift"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <GiftBox onOpen={next} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* ─────────────────────────────────────────────────────────── the roll ── */

function CreditRoll({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const t = window.setTimeout(onDone, reduced ? 2000 : 11_000)
    return () => window.clearTimeout(t)
  }, [onDone, reduced])

  return (
    <div className="relative h-[60dvh] overflow-hidden">
      <motion.div
        initial={{ y: reduced ? 0 : '55%' }}
        animate={{ y: reduced ? 0 : '-105%' }}
        transition={{ duration: reduced ? 0.01 : 11, ease: 'linear' }}
        className="space-y-7"
      >
        <p className="stencil pb-4">{credits.title}</p>
        {credits.rows.map(([role, name]) => (
          <div key={role + name}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{role}</p>
            <p className="mt-1 font-display text-xl text-bone">{name}</p>
          </div>
        ))}
        <p className="pt-6 font-mono text-[10px] tracking-[0.2em] text-faint">— fin —</p>
      </motion.div>

      {/* Fades the roll off at both ends, like a real title sequence. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── the box ── */

function GiftBox({ onOpen }: { onOpen: () => void }) {
  const reduced = useReducedMotion()
  const [now, setNow] = useState(() => Date.now())

  const lockUntil = config.birthday.lockUntil ? new Date(config.birthday.lockUntil).getTime() : null
  const locked = lockUntil !== null && now < lockUntil

  useEffect(() => {
    if (!locked) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [locked])

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        animate={reduced || locked ? {} : { rotate: [-2.5, 2.5, -2.5], y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {!reduced && !locked && (
          <motion.span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-gold/25 blur-3xl"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <Gift className="h-24 w-24 text-gold" strokeWidth={1} aria-hidden />
      </motion.div>

      {locked ? (
        <div className="max-w-xs">
          <p className="font-display text-xl text-bone">{config.birthday.lockedMessage}</p>
          <p className="mt-3 font-mono text-2xl text-gold">{countdown(lockUntil! - now)}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            come back then. it'll be waiting. 😌
          </p>
        </div>
      ) : (
        <Halo>
          <CinemaButton onClick={onOpen} autoFocus className="max-w-[90vw] !px-6 !text-sm sm:!text-[15px]">
            {postCredits.cta}
          </CinemaButton>
        </Halo>
      )}
    </div>
  )
}

function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}
