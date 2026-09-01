import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { letters } from '@/content/letters'
import type { Letter } from '@/content/types'
import { useExperience } from '@/state/Experience'
import { TypeLines } from '@/components/ui/TypeLines'
import { CinemaButton, Halo } from '@/components/ui/CinemaButton'
import { Reveal } from '@/components/ui/Reveal'
import { useReducedMotion, useScrollLock } from '@/lib/hooks'
import { readProgress, pushOpenedLetter } from '@/lib/progress'
import { cn } from '@/lib/cn'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE HIDDEN SURPRISE                                                 ║
 * ║                                                                      ║
 * ║  He is told it's over, asked to confirm it's over, and then it       ║
 * ║  isn't. The joke only works if the "Yes, obviously." button is the   ║
 * ║  only thing on screen — so it is.                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type Phase = 'bait' | 'punchline' | 'letters'

export default function Letters() {
  const { next } = useExperience()
  const [phase, setPhase] = useState<Phase>('bait')
  const [open, setOpen] = useState<Letter | null>(null)
  const [opened, setOpened] = useState<string[]>(() => readProgress().openedLetters)

  const openLetter = (letter: Letter) => {
    setOpen(letter)
    setOpened(pushOpenedLetter(letter.id).openedLetters)
  }

  return (
    <main className="ambient screen-min-h flex flex-col items-center justify-center px-5 py-24 sm:px-8">
      <AnimatePresence mode="wait">
        {/* ── the bait ──────────────────────────────────────────────────── */}
        {phase === 'bait' && (
          <motion.div
            key="bait"
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md text-center"
          >
            <TypeLines
              lines={['Wait...', 'Did you think that was everything?']}
              startDelay={700}
              gap={1700}
              className="space-y-5"
              lineClassName="font-display text-[clamp(1.5rem,6.5vw,2.4rem)] leading-snug text-bone"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 4.4 }}
              className="mt-12"
            >
              <CinemaButton variant="ghost" onClick={() => setPhase('punchline')}>
                Yes, obviously.
              </CinemaButton>
            </motion.div>
          </motion.div>
        )}

        {/* ── the punchline ─────────────────────────────────────────────── */}
        {phase === 'punchline' && (
          <motion.div
            key="punchline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <TypeLines
              lines={['Wrong answer. 😂']}
              startDelay={300}
              onDone={() => window.setTimeout(() => setPhase('letters'), 1400)}
              lineClassName="font-display text-[clamp(1.75rem,8vw,3rem)] text-gold"
            />
          </motion.div>
        )}

        {/* ── the letters ───────────────────────────────────────────────── */}
        {phase === 'letters' && (
          <motion.div
            key="letters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="w-full max-w-2xl"
          >
            <header className="text-center">
              <p className="stencil mb-4">sealed</p>
              <h1 className="font-display text-[clamp(1.75rem,7vw,3rem)] leading-tight text-bone">
                I wrote you some letters.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Not for today. For whenever.
              </p>
            </header>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {letters.map((letter, i) => (
                <Reveal key={letter.id} delay={i * 0.09} blur={false}>
                  <li>
                    <Envelope
                      letter={letter}
                      opened={opened.includes(letter.id)}
                      onOpen={() => openLetter(letter)}
                    />
                  </li>
                </Reveal>
              ))}
            </ul>

            <div className="mt-16 flex flex-col items-center gap-3">
              <Halo>
                <CinemaButton onClick={next}>
                  {opened.length ? "okay, what's next" : 'skip them for now'}
                </CinemaButton>
              </Halo>
              <p className="stencil !text-[10px]">
                they'll still be here later
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LetterModal letter={open} onClose={() => setOpen(null)} />
    </main>
  )
}

/* ──────────────────────────────────────────────────────────── envelope ── */

function Envelope({
  letter,
  opened,
  onOpen,
}: {
  letter: Letter
  opened: boolean
  onOpen: () => void
}) {
  const reduced = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={reduced ? undefined : { y: -4 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className={cn(
        'relative flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-colors',
        opened
          ? 'border-ink-4 bg-ink-2/50'
          : 'border-gold/25 bg-gold/[0.04] hover:border-gold/60 hover:bg-gold/[0.08]'
      )}
    >
      <span className="text-2xl" aria-hidden>
        {letter.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-snug text-bone">{letter.title}</span>
        <span className="stencil mt-1 block !text-[9px]">
          {opened ? 'opened' : 'sealed'}
        </span>
      </span>
    </motion.button>
  )
}

/* ────────────────────────────────────────────────────────────── letter ── */

function LetterModal({ letter, onClose }: { letter: Letter | null; onClose: () => void }) {
  useScrollLock(!!letter)

  return (
    <AnimatePresence>
      {letter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80] overflow-y-auto bg-ink/96 px-4 py-16 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={letter.title}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
          <button
            onClick={onClose}
            aria-label="Close letter"
            autoFocus
            className="tap-target fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10
                       flex items-center justify-center rounded-full bg-ink-3/80 text-bone-dim
                       transition-colors hover:text-bone"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <motion.article
            initial={{ opacity: 0, y: 24, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-md rounded-sm bg-[#f2ece0] p-8 text-[#2c2724]
                       shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:p-10"
          >
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a7f72]">
              {letter.title}
            </p>

            <div className="space-y-5">
              {letter.body.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.35 }}
                  className="handwriting !text-[1.4rem] leading-[1.5] !text-[#2c2724]"
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {letter.signoff && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 + letter.body.length * 0.35 }}
                className="handwriting mt-8 text-right !text-xl !text-[#5a4f46]"
              >
                {letter.signoff}
              </motion.p>
            )}

            {letter.voice && (
              <audio
                src={letter.voice}
                controls
                preload="none"
                className="mt-8 w-full"
                aria-label={`Voice note for ${letter.title}`}
              />
            )}
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
