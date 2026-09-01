import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { Photo } from '@/content/types'
import { SmartImage } from '@/components/ui/SmartImage'
import { Reveal } from '@/components/ui/Reveal'
import { useReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/cn'

/**
 * One photo, full-bleed, with room to breathe.
 *
 * The parallax is genuinely subtle — 6% of travel. Anything more and it
 * reads as a website effect instead of a camera move, which is the whole
 * thing we're trying not to be.
 */
export function CinematicPhoto({
  photo,
  index,
  priority = false,
}: {
  photo: Photo
  index: number
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92dvh] flex-col items-center justify-center px-5 py-16 sm:px-8"
    >
      <Reveal className="w-full max-w-3xl" duration={1.3}>
        <figure className="relative">
          <div className="relative overflow-hidden rounded-sm">
            <motion.div style={reduced ? undefined : { y }} className="will-change-transform">
              <SmartImage
                src={photo.src}
                alt={photo.alt}
                priority={priority}
                className="aspect-[4/5] w-full sm:aspect-[3/2]"
                sizes="(max-width: 768px) 100vw, min(90vw, 900px)"
              />
            </motion.div>

            {/* Grounds the photo in the page instead of floating on black. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/25"
            />

            {photo.meta && (
              <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-wider text-bone/45">
                {photo.meta}
              </p>
            )}
          </div>

          {photo.scribble && (
            <Reveal delay={0.6} blur={false}>
              <figcaption
                className={cn(
                  'handwriting mt-4 text-center !text-xl',
                  index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'
                )}
              >
                {photo.scribble}
              </figcaption>
            </Reveal>
          )}
        </figure>
      </Reveal>

      {photo.quote && (
        <Reveal delay={0.35} duration={1.5} className="mt-10 w-full max-w-xl">
          <p className="text-balance-tight text-center font-display text-[clamp(1.35rem,5.2vw,2rem)] leading-snug text-bone">
            {photo.quote}
          </p>
        </Reveal>
      )}
    </section>
  )
}
