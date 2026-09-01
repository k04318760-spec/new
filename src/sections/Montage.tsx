import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { montage, kenBurns } from '@/content/montage'
import { photoById } from '@/content/memories'
import { useExperience } from '@/state/Experience'
import { music } from '@/lib/audio'
import { SmartImage } from '@/components/ui/SmartImage'
import { CinemaButton, Halo } from '@/components/ui/CinemaButton'
import { TypeLines } from '@/components/ui/TypeLines'
import { useReducedMotion } from '@/lib/hooks'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MONTAGE — the emotional peak.                                   ║
 * ║                                                                      ║
 * ║  Everything else on the site gets out of the way: no chapter         ║
 * ║  marker, no music widget, no scroll. Just photos, a song, and        ║
 * ║  eight words spread across a minute and a half.                      ║
 * ║                                                                      ║
 * ║  Driven by one requestAnimationFrame clock rather than a pile of     ║
 * ║  chained timeouts, so the words stay locked to the song even if      ║
 * ║  the phone stutters.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export default function Montage() {
  const { next } = useExperience()
  const [playing, setPlaying] = useState(false)

  if (!playing) {
    return (
      <main className="ambient screen-h flex flex-col items-center justify-center px-6 text-center">
        <TypeLines
          lines={['There is one more thing', 'I wanted you to see.']}
          startDelay={800}
          gap={1600}
          className="space-y-3"
          lineClassName="font-display text-[clamp(1.5rem,6.5vw,2.4rem)] leading-snug text-bone"
        />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.8 }}
          className="mt-14"
        >
          <Halo>
            <CinemaButton
              onClick={() => {
                setPlaying(true)
                void music.play(montage.songId, { fadeMs: 1200 })
              }}
            >
              Play it ❤️
            </CinemaButton>
          </Halo>
          <p className="stencil mt-6 !text-[10px]">turn it up</p>
        </motion.div>
      </main>
    )
  }

  return <Reel onDone={next} />
}

/* ──────────────────────────────────────────────────────────────── reel ── */

function Reel({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  /**
   * Only two things drive a re-render: which photo is up, and which word is
   * on screen. The clock itself runs at 60fps but re-renders maybe forty
   * times across the whole ninety seconds — setting state every frame would
   * re-render this tree sixty times a second and stutter on a mid-range phone.
   */
  const [slot, setSlot] = useState(0)
  const [beatIndex, setBeatIndex] = useState(-1)
  const [showExit, setShowExit] = useState(false)
  const raf = useRef<number>(0)
  /** The progress line is written straight to the DOM — never worth a render. */
  const progressRef = useRef<HTMLDivElement>(null)

  /* One clock for the whole sequence. */
  useEffect(() => {
    const start = performance.now()

    const tick = (now: number) => {
      const t = (now - start) / 1000

      if (progressRef.current) {
        progressRef.current.style.width = `${Math.min(100, (t / montage.durationSeconds) * 100)}%`
      }

      setSlot((prev) => {
        const nextSlot = Math.floor(t / montage.photoHoldSeconds)
        return nextSlot === prev ? prev : nextSlot
      })
      setBeatIndex((prev) => {
        const next = montage.beats.findIndex(
          (b) => t >= b.t && t < b.t + (b.hold ?? 3)
        )
        return next === prev ? prev : next
      })

      if (t >= montage.durationSeconds) {
        music.fadeOutAll(2600)
        window.setTimeout(onDone, 2200)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    // An escape hatch, quiet and late. Nobody should be trapped in a
    // 95-second animation they can't leave.
    const exitTimer = window.setTimeout(() => setShowExit(true), 12_000)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        music.fadeOutAll(1200)
        onDone()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf.current)
      window.clearTimeout(exitTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onDone])

  const ids = montage.photoIds
  const isCollage = montage.collageEvery > 0 && slot > 0 && slot % montage.collageEvery === 0

  const currentPhoto = photoById(ids[slot % ids.length])
  const collagePhotos = [0, 1, 2]
    .map((n) => photoById(ids[(slot + n) % ids.length]))
    .filter(Boolean)

  const beat = beatIndex >= 0 ? montage.beats[beatIndex] : undefined

  /* Pull the next few frames in early so nothing pops in mid-cut. */
  useEffect(() => {
    for (let n = 1; n <= 3; n++) {
      const p = photoById(ids[(slot + n) % ids.length])
      if (!p) continue
      const img = new Image()
      img.src = `${p.src}-1080.webp`
    }
  }, [slot, ids])

  const effect = kenBurns[slot % kenBurns.length]

  return (
    <main className="fixed inset-0 z-[75] overflow-hidden bg-black">
      {/* ── frames ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="sync">
        {isCollage ? (
          <motion.div
            key={`collage-${slot}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0 grid grid-rows-3 gap-1 p-1 sm:grid-cols-3 sm:grid-rows-1"
          >
            {collagePhotos.map(
              (p) =>
                p && (
                  <SmartImage
                    key={p.id}
                    src={p.src}
                    alt={p.alt}
                    className="h-full w-full"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )
            )}
          </motion.div>
        ) : (
          currentPhoto && (
            <motion.div
              key={`photo-${slot}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              /* Kept under half the hold time — at 1.8s per photo a longer
                 crossfade means two frames are always half-visible at once,
                 which reads as mush rather than as cutting. */
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <SmartImage
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                className="h-full w-full"
                imgClassName={reduced ? undefined : `kb-${effect}`}
                sizes="100vw"
                priority
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Darkens the frame just enough for the words to sit on top. */}
      <div aria-hidden className="absolute inset-0 bg-black/35" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]"
      />

      {/* ── the words ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {beat && (
            <motion.p
              key={beat.value}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
              transition={{ duration: reduced ? 0.01 : 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-balance-tight text-center font-display
                         text-[clamp(2rem,10vw,4.5rem)] leading-[1.05] text-bone
                         [text-shadow:0_2px_30px_rgba(0,0,0,0.8)]"
            >
              {beat.value}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── the thinnest possible progress line ─────────────────────────── */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
        <div ref={progressRef} className="h-full bg-gold/70" style={{ width: '0%' }} />
      </div>

      <AnimatePresence>
        {showExit && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            whileHover={{ opacity: 1 }}
            onClick={() => {
              music.fadeOutAll(1200)
              onDone()
            }}
            className="stencil absolute bottom-6 right-5 z-10 tap-target px-3 text-bone-dim"
          >
            skip
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  )
}
