import type { Song } from './types'

/**
 * Single background soundtrack for the entire experience.
 * Seamlessly loops and plays continuously across chapters.
 */
export const songs: Song[] = [
  {
    id: 'song-main',
    title: 'Nenjukkul Peidhidum',
    artist: 'Harris Jayaraj, Hariharan (Vaaranam Aayiram)',
    src: '/music/nenjukkul-peidhidum.mp3',
    volume: 0.55,
    loop: true,
  },
]

/** Which track plays where — all mapped to the main soundtrack. */
export const songForChapter: Record<string, string> = {
  intro: 'song-main',
  beginning: 'song-main',
  chaos: 'song-main',
  moments: 'song-main',
  unsaid: 'song-main',
  videos: 'song-main',
  letters: 'song-main',
  montage: 'song-main',
  credits: 'song-main',
  finale: 'song-main',
}

export const songById = (id: string) => songs.find((s) => s.id === id)
