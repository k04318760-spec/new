import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send } from 'lucide-react'
import { finale, echoedAnswers } from '@/content/finale'
import { config } from '@/content/config'
import { byChapter, photoById } from '@/content/memories'
import { music } from '@/lib/audio'
import { SmartImage } from '@/components/ui/SmartImage'
import { TypeLines } from '@/components/ui/TypeLines'
import { Reveal } from '@/components/ui/Reveal'
import { useReducedMotion } from '@/lib/hooks'
import { getAnswer, whatsappHandoffUrl, recordEvent, currentScore } from '@/lib/answerStore'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE ACTUAL BIRTHDAY WISH                                            ║
 * ║                                                                      ║
 * ║  Confetti, once. Photos from the whole journey drifting past. Her    ║
 * ║  message, one line at a time, with no way to rush it.                ║
 * ║                                                                      ║
 * ║  And then his own answers handed back to him — the thing he typed    ║
 * ║  twenty minutes ago, in her handwriting. That is the moment the      ║
 * ║  whole site has been building toward.                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type Phase = 'burst' | 'message' | 'echo' | 'photo'

export default function Finale() {
  const [phase, setPhase] = useState<Phase>('burst')
  const reduced = useReducedMotion()

  useEffect(() => {
    void music.play('song-finale', { fadeMs: 900 })
    const { correct, answered } = currentScore()
    recordEvent('finished', answered ? `${correct}/${answered}` : undefined)

    if (reduced) return
    // One burst, warm colours only. Confetti loaded on demand so it never
    // costs anything on the way here.
    let cancelled = false
    void import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return
      const fire = (ratio: number, opts: Record<string, unknown>) =>
        confetti({
          particleCount: Math.floor(140 * ratio),
          spread: 70,
          origin: { y: 0.62 },
          colors: ['#e8c39e', '#f4efe6', '#cf8f83', '#c99b6d'],
          disableForReducedMotion: true,
          ...opts,
        })
      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      window.setTimeout(() => !cancelled && fire(0.2, { spread: 90, angle: 120 }), 700)
    })
    return () => {
      cancelled = true
    }
  }, [reduced])

  return (
    <main className="ambient relative min-h-[100dvh] overflow-hidden">
      <FloatingPhotos active={phase === 'burst' || phase === 'message'} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-24 text-center">
        <AnimatePresence mode="wait">
          {/* ── the headline ─────────────────────────────────────────────── */}
          {phase === 'burst' && (
            <motion.div
              key="burst"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => window.setTimeout(() => setPhase('message'), 3200)}
            >
              <h1 className="font-display leading-[0.92] text-bone">
                <span className="block text-[clamp(2rem,9vw,4rem)]">{finale.headline}</span>
                <span className="mt-2 block text-[clamp(2.75rem,15vw,7rem)] text-gold">
                  {config.him.shortName}
                </span>
                <span className="mt-4 block text-[clamp(2rem,9vw,4rem)]">❤️</span>
              </h1>
            </motion.div>
          )}

          {/* ── her message ──────────────────────────────────────────────── */}
          {phase === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full max-w-xl"
            >
              <TypeLines
                lines={finale.lines}
                startDelay={700}
                gap={1750}
                onDone={() =>
                  window.setTimeout(() => setPhase(echoedAnswers.enabled ? 'echo' : 'photo'), 2200)
                }
                className="space-y-4"
                lineClassName="text-balance-tight font-display text-[clamp(1.15rem,4.8vw,1.7rem)] leading-snug text-bone"
              />
            </motion.div>
          )}

          {/* ── his own words, handed back ───────────────────────────────── */}
          {phase === 'echo' && (
            <motion.div
              key="echo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full max-w-xl"
            >
              <Echo onDone={() => setPhase('photo')} />
            </motion.div>
          )}

          {/* ── the last photo ───────────────────────────────────────────── */}
          {phase === 'photo' && <FinalPhoto key="photo" />}
        </AnimatePresence>
      </div>
    </main>
  )
}

/* ──────────────────────────────────────────────────────────────── echo ── */

function Echo({ onDone }: { onDone: () => void }) {
  const items = echoedAnswers.items
    .map((item) => ({ ...item, answer: getAnswer(item.questionId) }))
    .filter((item) => item.answer && item.answer.value.trim().length > 0)

  useEffect(() => {
    // If he skipped every free-text question there is nothing to echo —
    // slide straight past it rather than showing an empty section.
    const delay = items.length ? 2000 + items.length * 2600 : 0
    const t = window.setTimeout(onDone, delay)
    return () => window.clearTimeout(t)
  }, [items.length, onDone])

  if (!items.length) return null

  return (
    <div>
      <Reveal duration={1.2}>
        <p className="text-[15px] text-muted">{echoedAnswers.intro}</p>
      </Reveal>

      <div className="mt-10 space-y-8">
        {items.map((item, i) => (
          <Reveal key={item.questionId} delay={0.8 + i * 1.6} duration={1.3}>
            <p className="text-sm text-muted">{item.lead}</p>
            <p className="handwriting mt-2 !text-[clamp(1.4rem,6vw,2rem)] leading-snug">
              “{item.answer!.value}”
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={1 + items.length * 1.6} duration={1.3}>
        <p className="mt-12 font-display text-[clamp(1.2rem,5vw,1.7rem)] text-bone">
          {echoedAnswers.outro}
        </p>
      </Reveal>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── last frame ── */

function FinalPhoto() {
  const photo = photoById(finale.favouritePhotoId)
  const handoff = whatsappHandoffUrl()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6 }}
      className="w-full max-w-md"
    >
      <Reveal duration={1.6} blur={false}>
        <p className="font-display text-[clamp(1.75rem,7vw,2.5rem)] text-bone">
          {finale.closing}
        </p>
      </Reveal>

      {photo && (
        <Reveal delay={0.6} duration={1.8} className="mt-10">
          <SmartImage
            src={photo.src}
            alt={photo.alt}
            className="aspect-[4/5] w-full rounded-sm"
            sizes="(max-width: 640px) 92vw, 448px"
            priority
          />
        </Reveal>
      )}

      <Reveal delay={1.2} duration={1.6} className="mt-10">
        <p className="font-display text-[clamp(1.35rem,5.5vw,2rem)] text-gold">
          {finale.finalLine}
        </p>
      </Reveal>

      <Reveal delay={1.8} duration={1.4} className="mt-8">
        <p className="handwriting !text-lg leading-relaxed text-bone-dim">
          {finale.playfulLine}
        </p>
      </Reveal>

      {/* The last-resort delivery path for his answers: no server involved. */}
      {handoff && (
        <Reveal delay={2.4} duration={1.2} className="mt-14">
          <a
            href={handoff}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center gap-2 rounded-full border border-gold/30 px-6
                       text-sm text-gold transition-colors hover:border-gold/70 hover:bg-gold/5"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            send her your answers 💌
          </a>
        </Reveal>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── drifting photos ── */

/**
 * Photos from the whole journey drifting past behind the message. Small,
 * blurred, low opacity — texture, not content. Off entirely under reduced
 * motion, where it would be pure distraction.
 */
function FloatingPhotos({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const photos = byChapter('finale').filter((p) => p.id !== finale.favouritePhotoId)

  if (reduced || !active || !photos.length) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {photos.slice(0, 6).map((photo, i) => {
        const left = 8 + ((i * 31) % 78)
        const delay = i * 2.4
        const duration = 22 + (i % 3) * 6
        return (
          <motion.div
            key={photo.id}
            className="absolute w-24 opacity-0 sm:w-32"
            style={{ left: `${left}%` }}
            initial={{ y: '110vh', rotate: i % 2 ? -8 : 8 }}
            animate={{ y: '-30vh', opacity: [0, 0.28, 0.28, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          >
            <SmartImage
              src={photo.src}
              alt=""
              className="aspect-square w-full rounded-sm blur-[1px]"
              sizes="128px"
            />
          </motion.div>
        )
      })}
    </div>
  )
}
