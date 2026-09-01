import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, X, Check } from 'lucide-react'
import { videos } from '@/content/videos'
import type { Video } from '@/content/types'
import { useExperience } from '@/state/Experience'
import { music } from '@/lib/audio'
import { Reveal } from '@/components/ui/Reveal'
import { CinemaButton } from '@/components/ui/CinemaButton'
import { useScrollLock, useReducedMotion } from '@/lib/hooks'
import { readProgress, pushWatchedVideo } from '@/lib/progress'
import { cn } from '@/lib/cn'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MEMORY ARCHIVE                                                  ║
 * ║                                                                      ║
 * ║  A list, not a grid of thumbnails. It should read like a private     ║
 * ║  index of tapes rather than a video gallery — and it means the       ║
 * ║  page costs him nothing to open, because no video loads until he     ║
 * ║  actually picks one.                                                 ║
 * ║                                                                      ║
 * ║  While a video plays, the background music ducks to almost nothing   ║
 * ║  and comes back up when he closes it.                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export default function Archive() {
  const { next } = useExperience()
  const [open, setOpen] = useState<Video | null>(null)
  const [watched, setWatched] = useState<string[]>(() => readProgress().watchedVideos)
  const [afterQuote, setAfterQuote] = useState<string | null>(null)

  const handleClose = (video: Video) => {
    setOpen(null)
    setWatched(pushWatchedVideo(video.id).watchedVideos)
    if (video.afterQuote) setAfterQuote(video.afterQuote)
  }

  const allWatched = watched.length >= videos.length

  return (
    <main className="ambient screen-min-h px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="pt-8">
          <p className="stencil mb-5">05</p>
          <h1 className="font-display text-[clamp(2rem,9vw,3.75rem)] leading-[1] text-bone">
            some memories
            <br />
            needed to move
          </h1>
        </header>

        <ol className="mt-14 divide-y divide-ink-3 border-y border-ink-3">
          {videos.map((video, i) => (
            <Reveal key={video.id} delay={i * 0.08} blur={false}>
              <li>
                <button
                  type="button"
                  onClick={() => setOpen(video)}
                  className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-gold/[0.03]"
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                               border border-gold/25 text-gold transition-colors
                               group-hover:border-gold/70 group-hover:bg-gold/10"
                  >
                    <Play className="h-3.5 w-3.5 translate-x-px" fill="currentColor" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="stencil block">{video.code}</span>
                    <span className="mt-0.5 block truncate text-[15px] text-bone">
                      {video.label}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    {watched.includes(video.id) && (
                      <Check className="h-3.5 w-3.5 text-gold/60" aria-label="watched" />
                    )}
                    <span className="font-mono text-xs text-faint">{video.duration}</span>
                  </span>
                </button>
              </li>
            </Reveal>
          ))}
        </ol>

        {/* The line that lands after he's actually watched something. */}
        <div className="mt-16 min-h-[6rem] text-center">
          <AnimatePresence mode="wait">
            {afterQuote && (
              <motion.p
                key={afterQuote}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-balance-tight font-display text-[clamp(1.25rem,5vw,1.75rem)] text-bone"
              >
                {afterQuote}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <CinemaButton variant="ghost" onClick={next}>
            {allWatched ? 'okay, what else' : "I've seen enough 😂"}
          </CinemaButton>
          {!allWatched && (
            <p className="stencil !text-[10px]">
              {watched.length} of {videos.length} watched
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && <VideoModal video={open} onClose={() => handleClose(open)} />}
      </AnimatePresence>
    </main>
  )
}

/* ─────────────────────────────────────────────────────────────── modal ── */

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()
  useScrollLock(true)

  useEffect(() => {
    // Music out of the way for as long as this is open.
    const restore = music.duck()

    const el = ref.current
    // Autoplay with sound is refused on mobile; the controls are right there,
    // so a refusal costs him one tap rather than breaking anything.
    el?.play().catch(() => undefined)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      restore()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink/97 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${video.code} — ${video.label}`}
    >
      <button
        onClick={onClose}
        aria-label="Close video"
        autoFocus
        className="tap-target absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10
                   flex items-center justify-center rounded-full bg-ink-3/80 text-bone-dim
                   transition-colors hover:text-bone"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <motion.div
        initial={{ scale: reduced ? 1 : 0.95, y: reduced ? 0 : 14 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl"
      >
        <p className="stencil mb-3">{video.code}</p>

        {failed ? (
          <div
            className={cn(
              'flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-sm px-6 text-center',
              'bg-[repeating-linear-gradient(135deg,#131010_0px,#131010_14px,#1c1817_14px,#1c1817_28px)]'
            )}
          >
            <p className="text-sm text-bone-dim">{video.label}</p>
            <p className="font-mono text-[10px] text-faint">{video.src}</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Drop the clip in at this path and run <code>npm run optimize:vid</code>.
            </p>
          </div>
        ) : (
          <video
            ref={ref}
            src={video.src}
            poster={video.poster}
            controls
            playsInline
            preload="none"
            onError={() => setFailed(true)}
            onEnded={onClose}
            className="max-h-[72dvh] w-full rounded-sm bg-black"
          >
            {/* Captions go here if you add a .vtt file next to the clip. */}
          </video>
        )}

        <p className="mt-3 text-[15px] text-bone-dim">{video.label}</p>
      </motion.div>
    </motion.div>
  )
}
