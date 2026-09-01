import type { ChapterId } from '@/content/types'

/**
 * Where he got to, kept on his device only. Nothing here is ever sent
 * anywhere — it exists so that closing the tab halfway through doesn't
 * cost him the whole journey.
 *
 * This is what makes "something you can come back to" literally true.
 */

const KEY = 'bd.progress'

export type Progress = {
  furthest: number
  lastSeen: string
  completed: boolean
  /** Which sealed letters he has already opened. */
  openedLetters: string[]
  /** Which videos he has watched, so the archive can mark them. */
  watchedVideos: string[]
  muted: boolean
}

const empty: Progress = {
  furthest: 0,
  lastSeen: '',
  completed: false,
  openedLetters: [],
  watchedVideos: [],
  muted: false,
}

export function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Progress>) } : empty
  } catch {
    return empty
  }
}

export function writeProgress(patch: Partial<Progress>) {
  try {
    const next = { ...readProgress(), ...patch, lastSeen: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  } catch {
    return readProgress()
  }
}

export function pushOpenedLetter(id: string) {
  const p = readProgress()
  if (p.openedLetters.includes(id)) return p
  return writeProgress({ openedLetters: [...p.openedLetters, id] })
}

export function pushWatchedVideo(id: string) {
  const p = readProgress()
  if (p.watchedVideos.includes(id)) return p
  return writeProgress({ watchedVideos: [...p.watchedVideos, id] })
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}

/** Human label for the resume prompt: "you stopped at THE CHAOS". */
export const chapterLabels: Record<ChapterId, string> = {
  gate: 'the door',
  intro: 'the beginning',
  beginning: 'it started somewhere',
  chaos: 'the chaos',
  moments: 'the moments that matter',
  unsaid: 'things I may not always say',
  videos: 'the memory archive',
  letters: 'the letters',
  montage: 'the last thing',
  credits: 'the end',
  finale: 'your birthday',
}
