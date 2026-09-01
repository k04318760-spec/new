import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ChapterId } from '@/content/types'
import { config } from '@/content/config'
import { songForChapter } from '@/content/songs'
import { music } from '@/lib/audio'
import { readProgress, writeProgress } from '@/lib/progress'
import { recordEvent, startAnswerSync } from '@/lib/answerStore'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE RUNNING ORDER                                                   ║
 * ║                                                                      ║
 * ║  One scene on screen at a time. He can always go forward, and never  ║
 * ║  skip ahead — the whole thing rests on him not knowing what's next.  ║
 * ║                                                                      ║
 * ║  Reorder this array and the entire experience reorders with it.      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export type StepId =
  | 'gate'
  | 'intro'
  | 'beginning'
  | 'chaos'
  | 'chat-01'
  | 'moments'
  | 'chat-02'
  | 'unsaid'
  | 'videos'
  | 'chat-03'
  | 'letters'
  | 'chat-04'
  | 'montage'
  | 'credits'
  | 'finale'

type Step = {
  id: StepId
  /** Which chapter's music and colour this scene belongs to. */
  chapter: ChapterId
  /** Shown in the corner: "03 — THE CHAOS". Hidden when undefined. */
  marker?: string
  /** Counts toward the progress rail. The surprises deliberately don't. */
  counts: boolean
}

export const steps: Step[] = [
  { id: 'gate', chapter: 'gate', counts: false },
  { id: 'intro', chapter: 'intro', counts: false },
  { id: 'beginning', chapter: 'beginning', marker: '01 — BEGINNING', counts: true },
  { id: 'chaos', chapter: 'chaos', marker: '02 — CHAOS', counts: true },
  { id: 'chat-01', chapter: 'chaos', marker: 'CHAT 01', counts: true },
  { id: 'moments', chapter: 'moments', marker: '03 — MEMORIES', counts: true },
  { id: 'chat-02', chapter: 'moments', marker: 'CHAT 02', counts: true },
  { id: 'unsaid', chapter: 'unsaid', marker: '04 — YOU', counts: true },
  { id: 'videos', chapter: 'videos', marker: '05 — ARCHIVE', counts: true },
  { id: 'chat-03', chapter: 'videos', marker: 'CHAT 03', counts: true },
  { id: 'letters', chapter: 'letters', counts: false },
  { id: 'chat-04', chapter: 'letters', marker: 'CHAT 04', counts: true },
  { id: 'montage', chapter: 'montage', counts: false },
  { id: 'credits', chapter: 'credits', counts: false },
  { id: 'finale', chapter: 'finale', counts: false },
]

type ExperienceValue = {
  index: number
  step: Step
  /** Position within the visible chapters, for the progress rail. */
  chapterPosition: { current: number; total: number } | null
  next: () => void
  goTo: (id: StepId) => void
  started: boolean
  start: () => Promise<void>
  /** True when he has been here before and left partway through. */
  resumeAvailable: number | null
  dismissResume: () => void
  resume: () => void
}

const Ctx = createContext<ExperienceValue | null>(null)

/**
 * Director's cut: ?dev=1 skips the gate, ?at=<step> jumps straight to a
 * scene, and the arrow keys move between them — so content can be checked
 * without sitting through eleven minutes each time.
 */
function devJump(): number | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  if (params.get('dev') !== '1') return null
  const found = steps.findIndex((s) => s.id === params.get('at'))
  return found >= 0 ? found : 1
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  /**
   * Resolved during the first render, not in an effect.
   *
   * This matters more than it looks: setting the index from a mount effect
   * hands AnimatePresence a key change in the same commit as the very first
   * mount, and the exit/enter handoff never completes — the gate stays on
   * screen forever while the chapter marker cheerfully updates behind it.
   * Starting on the right step means there is no handoff at all.
   */
  const [index, setIndex] = useState(() => devJump() ?? 0)
  const [started, setStarted] = useState(() => devJump() !== null)
  const [resumeAvailable, setResumeAvailable] = useState<number | null>(null)

  /* ------------------------------------------------------- first paint */

  useEffect(() => {
    startAnswerSync()
    recordEvent('opened')

    if (devJump() !== null) return
    if (!config.features.resumeProgress) return

    const saved = readProgress()
    // Only offer to resume if he got properly into it and didn't finish.
    if (saved.furthest > 2 && !saved.completed) {
      setResumeAvailable(saved.furthest)
    }
  }, [])

  /* ------------------------------------------ keyboard jumps, dev only */

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('dev')) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(steps.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* --------------------------------------------- music follows the scene */

  const step = steps[index] ?? steps[0]

  useEffect(() => {
    if (!started) return
    const songId = songForChapter[step.chapter]
    // The montage and finale start their own music at the exact right beat,
    // so the scene change must not stomp on them.
    if (songId && step.id !== 'montage' && step.id !== 'finale') {
      void music.play(songId, { fadeMs: 2000 })
    }
  }, [step.chapter, step.id, started])

  /* ------------------------------------------------------ persistence */

  useEffect(() => {
    if (!started || !config.features.resumeProgress) return
    const saved = readProgress()
    if (index > saved.furthest) writeProgress({ furthest: index })
    // The 'finished' event itself is sent from the finale, where the score
    // is known. Sending it here too would email her twice.
    if (step.id === 'finale') writeProgress({ completed: true })
  }, [index, started, step.id])

  /* ----------------------------------------------------------- actions */

  const next = useCallback(() => {
    setIndex((i) => Math.min(steps.length - 1, i + 1))
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const goTo = useCallback((id: StepId) => {
    const found = steps.findIndex((s) => s.id === id)
    if (found >= 0) {
      setIndex(found)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [])

  const start = useCallback(async () => {
    setStarted(true)
    // Must happen inside the tap that called this, or the browser says no.
    await music.unlock(songForChapter.intro)
  }, [])

  const resume = useCallback(() => {
    if (resumeAvailable === null) return
    setIndex(resumeAvailable)
    setResumeAvailable(null)
    setStarted(true)
    void music.unlock(songForChapter[steps[resumeAvailable]?.chapter ?? 'intro'])
  }, [resumeAvailable])

  const chapterPosition = useMemo(() => {
    if (!step.counts) return null
    const counted = steps.filter((s) => s.counts)
    return { current: counted.findIndex((s) => s.id === step.id) + 1, total: counted.length }
  }, [step])

  const value = useMemo<ExperienceValue>(
    () => ({
      index,
      step,
      chapterPosition,
      next,
      goTo,
      started,
      start,
      resumeAvailable,
      dismissResume: () => setResumeAvailable(null),
      resume,
    }),
    [index, step, chapterPosition, next, goTo, started, start, resumeAvailable, resume]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useExperience() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useExperience must be used inside <ExperienceProvider>')
  return ctx
}
