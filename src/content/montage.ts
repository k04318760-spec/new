import { journeyPhotos } from './memories'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MONTAGE — the emotional peak.                                   ║
 * ║                                                                      ║
 * ║  You do NOT hand-time thirty photos. You give the engine a song       ║
 * ║  length and a handful of text beats; it spreads the photos evenly    ║
 * ║  across the runtime and floats the words over them.                  ║
 * ║                                                                      ║
 * ║  To tune it: play your song, note the seconds where it lifts, and    ║
 * ║  put a beat there. That is the whole job.                            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const montage = {
  songId: 'song-main',

  /**
   * Length of the montage in seconds. Match your song.
   *
   * The arithmetic that matters: 68 photos live outside the finale, and
   * duration ÷ photoHoldSeconds is how many actually get shown. 120 ÷ 1.8 is
   * 67, so very nearly all of them make it in. A longer song lets you slow
   * the cuts down; a shorter one starts dropping photos off the end.
   */
  durationSeconds: 120,

  /** Seconds each photo holds. Photos loop if there aren't enough. */
  photoHoldSeconds: 1.8,

  /**
   * Words, on black-ish, over the photos.
   * `t` is seconds from the start. `hold` is how long it stays.
   */
  beats: [
    { t: 3, value: 'The beginning.', hold: 3.5 },
    { t: 18, value: 'The chaos.', hold: 3.5 },
    { t: 34, value: 'The laughs.', hold: 3.5 },
    { t: 50, value: 'The random days.', hold: 3.5 },
    { t: 66, value: 'The memories.', hold: 3.5 },
    { t: 82, value: 'You. ❤️', hold: 4.5 },
    { t: 98, value: 'And somehow...', hold: 4 },
    { t: 108, value: 'all of this became us.', hold: 8 },
  ],

  /**
   * Which photos run, in order. Defaults to every non-finale photo.
   * Replace with an explicit id list if you want a specific order.
   */
  photoIds: journeyPhotos.map((p) => p.id),

  /** Every 5th photo becomes a 3-up collage instead of a single frame. */
  collageEvery: 5,
} as const

/** Ken Burns directions, cycled so no two neighbours move the same way. */
export const kenBurns = ['zoomIn', 'panLeft', 'zoomOut', 'panRight'] as const
export type KenBurns = (typeof kenBurns)[number]
