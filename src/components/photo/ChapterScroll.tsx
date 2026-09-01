import { useState } from 'react'
import { motion } from 'motion/react'
import type { Photo } from '@/content/types'
import { CinematicPhoto } from './CinematicPhoto'
import { Reveal, ScrollCue } from '@/components/ui/Reveal'
import { CinemaButton } from '@/components/ui/CinemaButton'
import { useReducedMotion } from '@/lib/hooks'

/**
 * The shape every photo chapter shares: a title card on black, the photos
 * one at a time, and a quiet way onward at the bottom.
 *
 * There is no "next chapter" button floating over the photos. He gets to
 * the end by looking at all of them, which is the point.
 */
export function ChapterScroll({
  number,
  title,
  subtitle,
  photos,
  closingLines,
  onDone,
  cta = 'keep going',
}: {
  number: string
  title: string
  subtitle?: string
  photos: Photo[]
  closingLines?: string[]
  onDone: () => void
  cta?: string
}) {
  const reduced = useReducedMotion()
  const [titleSeen, setTitleSeen] = useState(false)

  return (
    <main className="ambient">
      {/* ── title card ─────────────────────────────────────────────────── */}
      <section className="screen-h relative flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 1.4, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setTitleSeen(true)}
        >
          <p className="stencil mb-6">{number}</p>
          <h1 className="font-display text-[clamp(2.25rem,11vw,5rem)] leading-[0.95] tracking-tight text-bone">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-sm text-balance-tight text-[15px] leading-relaxed text-muted">
              {subtitle}
            </p>
          )}
        </motion.div>

        {titleSeen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="absolute bottom-12"
          >
            <ScrollCue />
          </motion.div>
        )}
      </section>

      {/* ── the photos ─────────────────────────────────────────────────── */}
      {photos.map((photo, i) => (
        <CinematicPhoto key={photo.id} photo={photo} index={i} priority={i === 0} />
      ))}

      {/* ── the way out ────────────────────────────────────────────────── */}
      <section className="flex min-h-[70dvh] flex-col items-center justify-center px-6 pb-24 text-center">
        {closingLines?.map((line, i) => (
          <Reveal key={line} delay={i * 0.25} duration={1.4} className="mb-5 max-w-xl">
            <p className="text-balance-tight font-display text-[clamp(1.35rem,5.2vw,2rem)] leading-snug text-bone">
              {line}
            </p>
          </Reveal>
        ))}

        <Reveal delay={0.6} className="mt-10">
          <CinemaButton variant="ghost" onClick={onDone}>
            {cta}
          </CinemaButton>
        </Reveal>
      </section>
    </main>
  )
}
