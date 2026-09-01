import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { byChapter } from '@/content/memories'
import type { Photo } from '@/content/types'
import { useExperience } from '@/state/Experience'
import { SmartImage } from '@/components/ui/SmartImage'
import { Reveal } from '@/components/ui/Reveal'
import { CinemaButton } from '@/components/ui/CinemaButton'
import { useMediaQuery, useReducedMotion, useScrollLock } from '@/lib/hooks'
import { cn } from '@/lib/cn'
import { q } from '@/content/quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 2 — THE CHAOS                                               ║
 * ║                                                                      ║
 * ║  The mood breaks here. Polaroids, tilted, scribbled on, thrown on    ║
 * ║  a table rather than hung in a gallery.                              ║
 * ║                                                                      ║
 * ║  Desktop gets to shove them around. Mobile gets a clean scrollable   ║
 * ║  pile — the dragging is a bonus, never the way to see a photo, so    ║
 * ║  nothing here depends on having a mouse.                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const LINES = [
  'Not every memory is aesthetic.',
  "Some are just proof that we survived each other's nonsense. 😂",
]

export default function Chaos() {
  const { next } = useExperience()
  const photos = byChapter('chaos')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [zoomed, setZoomed] = useState<Photo | null>(null)

  return (
    <main className="ambient min-h-[100dvh] overflow-hidden px-5 py-20 sm:px-8">
      <header className="mx-auto max-w-3xl pt-10 text-center">
        <p className="stencil mb-5">02</p>
        <h1 className="font-display text-[clamp(2.25rem,11vw,4.5rem)] leading-[0.95] text-bone">
          the chaos
        </h1>
        <div className="mt-8 space-y-3">
          {LINES.map((line, i) => (
            <Reveal key={line} delay={0.3 + i * 0.25}>
              <p className="text-balance-tight text-[15px] leading-relaxed text-muted sm:text-base">
                {line}
              </p>
            </Reveal>
          ))}
        </div>
        {isDesktop && (
          <Reveal delay={0.9}>
            <p className="handwriting mt-6 !text-lg text-gold/60">
              (you can move them around)
            </p>
          </Reveal>
        )}
      </header>

      <div
        className={cn(
          'mx-auto mt-16 max-w-5xl',
          isDesktop
            ? 'flex flex-wrap items-start justify-center gap-x-2 gap-y-10'
            : 'flex flex-col items-center gap-12'
        )}
      >
        {photos.map((photo, i) => (
          <Polaroid
            key={photo.id}
            photo={photo}
            index={i}
            draggable={isDesktop}
            onOpen={() => setZoomed(photo)}
          />
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center gap-8 px-4 text-center">
        <Reveal>
          <p className="text-balance-tight font-display text-[clamp(1.3rem,5vw,1.9rem)] text-bone">
            And somehow... these are still some of my favourites.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="max-w-xl text-balance-tight font-display text-[clamp(1.15rem,4.5vw,1.6rem)] leading-snug text-gold">
            {q.quietlyBetter}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <CinemaButton variant="ghost" onClick={next}>
            okay stop 😂
          </CinemaButton>
        </Reveal>
      </div>

      <Lightbox photo={zoomed} onClose={() => setZoomed(null)} />
    </main>
  )
}

/* ──────────────────────────────────────────────────────────── polaroid ── */

function Polaroid({
  photo,
  index,
  draggable,
  onOpen,
}: {
  photo: Photo
  index: number
  draggable: boolean
  onOpen: () => void
}) {
  const reduced = useReducedMotion()
  const tilt = photo.rotate ?? (index % 2 === 0 ? -4 : 4)

  return (
    <motion.div
      drag={draggable && !reduced}
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{ scale: 1.04, rotate: 0, zIndex: 30, cursor: 'grabbing' }}
      initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduced ? 0.01 : 0.9, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[min(78vw,320px)] shrink-0 touch-pan-y"
      style={{ zIndex: 10 - (index % 5) }}
    >
      {/* The polaroid itself: warm paper, deep shadow, thick bottom margin. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open photo: ${photo.alt}`}
        /* pb-24 rather than the classic thin polaroid margin: her captions are
           whole sentences, not two words, and they need three lines of room
           without spilling off the paper. */
        className="block w-full rounded-[3px] bg-[#efe9dd] p-3 pb-24 text-left
                   shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] transition-transform
                   hover:-translate-y-1 focus-visible:-translate-y-1"
      >
        <SmartImage
          src={photo.src}
          alt={photo.alt}
          className="aspect-square w-full bg-[#d9d2c6]"
          sizes="(max-width: 1024px) 78vw, 320px"
        />
        {photo.scribble && (
          <span
            className="handwriting absolute bottom-4 left-1/2 w-[88%] -translate-x-1/2 text-center
                       !text-[17px] leading-[1.2] !text-[#3a3330]"
          >
            {photo.scribble}
          </span>
        )}
      </button>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────── lightbox ── */

function Lightbox({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  useScrollLock(!!photo)

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
          <button
            onClick={onClose}
            aria-label="Close photo"
            className="tap-target absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))]
                       flex items-center justify-center rounded-full bg-ink-3/80 text-bone-dim
                       transition-colors hover:text-bone"
            autoFocus
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-full w-full max-w-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SmartImage
              src={photo.src}
              alt={photo.alt}
              className="max-h-[75dvh] w-full rounded-sm"
              sizes="(max-width: 640px) 92vw, 512px"
            />
            {photo.scribble && (
              <p className="handwriting mt-4 text-center !text-xl">{photo.scribble}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
