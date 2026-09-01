import { motion } from 'motion/react'
import { steps, useExperience } from '@/state/Experience'
import { chapterLabels } from '@/lib/progress'
import { CinemaButton } from '@/components/ui/CinemaButton'

/**
 * He came back. This is the small moment that makes her line — "something
 * you could come back to" — literally true rather than just a nice sentence.
 */
export function ResumePrompt() {
  const { resumeAvailable, resume, dismissResume } = useExperience()
  if (resumeAvailable === null) return null

  const where = chapterLabels[steps[resumeAvailable]?.chapter ?? 'intro']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="ambient fixed inset-0 z-[70] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Continue where you left off"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <p className="stencil">you were here before</p>
        <h2 className="mt-4 font-display text-3xl leading-tight text-bone">
          you stopped at
          <br />
          <span className="italic text-gold">{where}</span>
        </h2>
        <p className="mt-4 text-sm text-muted">it waited for you. 😌</p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <CinemaButton onClick={resume} autoFocus>
            keep going
          </CinemaButton>
          <CinemaButton variant="quiet" onClick={dismissResume} className="!text-sm">
            start from the beginning
          </CinemaButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
