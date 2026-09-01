import { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Volume2, VolumeX, Play, Pause, Disc3 } from 'lucide-react'
import { config } from '@/content/config'
import { music } from '@/lib/audio'
import { useExperience } from '@/state/Experience'
import { useIdle, useReducedMotion } from '@/lib/hooks'
import { writeProgress, readProgress } from '@/lib/progress'
import { cn } from '@/lib/cn'

/**
 * Everything that floats above the experience: grain, vignette, the chapter
 * marker, the progress rail and the music button.
 *
 * There is no navbar. This is not a website he is browsing — it's something
 * he is being shown, and the chrome stays out of the way accordingly.
 */

export function Chrome() {
  const { step, chapterPosition, started } = useExperience()

  // The montage and the finale take the whole screen. Nothing floats over
  // the emotional peak except the photos.
  const bare = step.id === 'montage' || step.id === 'finale' || step.id === 'gate'

  return (
    <>
      {config.features.grain && <div className="grain vignette pointer-events-none fixed inset-0 z-50" aria-hidden />}

      <AnimatePresence>
        {started && !bare && (
          <>
            {step.marker && <ChapterMarker key="marker" label={step.marker} position={chapterPosition} />}
            <MusicWidget key="music" />
          </>
        )}
      </AnimatePresence>

      {started && !bare && <IdleNudge />}
    </>
  )
}

/* ────────────────────────────────────────────────────── chapter marker ── */

function ChapterMarker({
  label,
  position,
}: {
  label: string
  position: { current: number; total: number } | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="pointer-events-none fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-40 sm:left-6 sm:top-6"
    >
      <p className="stencil">{label}</p>
      {position && (
        <div className="mt-2 flex items-center gap-2" aria-hidden>
          <div className="h-px w-14 overflow-hidden bg-ink-4 sm:w-20">
            <motion.div
              className="h-full bg-gold/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: position.current / position.total }}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="font-mono text-[10px] text-faint">
            {String(position.current).padStart(2, '0')}/{String(position.total).padStart(2, '0')}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────── music ─────── */

function MusicWidget() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  // The player lives outside React, so subscribe to it rather than mirroring
  // its state — that keeps play/pause honest even when audio events fire
  // on their own (a track ending, a fade completing).
  const snapshot = useSyncExternalStore(
    music.subscribe,
    () => `${music.nowPlaying?.id ?? ''}|${music.isPlaying}|${music.muted}`,
    () => ''
  )
  void snapshot

  const song = music.nowPlaying
  const muted = music.muted

  useEffect(() => {
    // Restore his choice from last visit — if he muted it, keep it muted.
    const saved = readProgress()
    if (saved.muted && !music.muted) music.setMuted(true)
  }, [])

  const toggleMute = () => {
    const next = !music.muted
    music.setMuted(next)
    writeProgress({ muted: next })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      /**
       * Top-right, not bottom-right. The bottom edge belongs to his thumbs:
       * the chat's send button lives there, and a floating disc over it means
       * "send" taps the music toggle instead. Found by driving it on a phone.
       */
      className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 sm:right-6 sm:top-6"
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-full border border-ink-4/80 bg-ink-2/70 p-1 backdrop-blur-md',
          'transition-colors duration-300',
          open && 'border-gold/25'
        )}
      >
        <AnimatePresence initial={false}>
          {open && song && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 whitespace-nowrap pl-3 pr-1">
                <button
                  onClick={() => music.toggle()}
                  aria-label={music.isPlaying ? 'Pause music' : 'Play music'}
                  className="tap-target flex items-center justify-center text-bone-dim transition-colors hover:text-gold"
                >
                  {music.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="max-w-[36vw] sm:max-w-[220px]">
                  <p className="stencil !text-[9px] !tracking-[0.18em]">now playing</p>
                  <p className="truncate text-xs text-bone-dim">{song.title}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="tap-target flex items-center justify-center rounded-full text-bone-dim transition-colors hover:text-gold"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Hide track details' : 'Show track details'}
          aria-expanded={open}
          className="tap-target flex items-center justify-center rounded-full text-gold/80 transition-colors hover:text-gold"
        >
          <motion.span
            animate={reduced || !music.isPlaying || muted ? {} : { rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            className="flex"
          >
            <Disc3 className="h-4 w-4" />
          </motion.span>
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────── idle nudge ──── */

const nudges = ['still there? 👀', 'hello?', 'take your time. I waited longer.', 'you can keep going 😌']

function IdleNudge() {
  const idle = useIdle(38_000, config.features.idleNudges)
  const [line] = useState(() => nudges[Math.floor(Math.random() * nudges.length)])

  return (
    <AnimatePresence>
      {idle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="handwriting pointer-events-none fixed bottom-20 left-1/2 z-40 -translate-x-1/2
                     whitespace-nowrap text-center !text-lg text-gold/60"
        >
          {line}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
