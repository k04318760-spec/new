/**
 * Every shape the experience understands.
 * Nothing in `src/components` or `src/sections` invents its own content —
 * it all comes from the files in this folder.
 */

export type ChapterId =
  | 'gate'
  | 'intro'
  | 'beginning'
  | 'chaos'
  | 'moments'
  | 'unsaid'
  | 'videos'
  | 'letters'
  | 'montage'
  | 'credits'
  | 'finale'

/* ------------------------------------------------------------------ photos */

export type Photo = {
  id: string
  /** Path under /public, without extension — the optimizer emits .webp sizes. */
  src: string
  /** Screen-reader description. Say what is happening, not "photo of us". */
  alt: string
  chapter: ChapterId
  /** Big cinematic line shown alongside this photo. Keep it short. */
  quote?: string
  /** Small handwritten scribble laid over the photo. */
  scribble?: string
  /** Faint camera-roll style label: "IMG_0472 · that random Tuesday" */
  meta?: string
  /** Where the subject sits, so cropping never beheads anyone. */
  focal?: 'center' | 'top' | 'bottom'
  /** Polaroid tilt in degrees, chaos chapter only. */
  rotate?: number
}

/* ------------------------------------------------------------------ videos */

export type Video = {
  id: string
  /** e.g. "MEMORY_01" — shown in the archive list. */
  code: string
  label: string
  src: string
  poster: string
  /** mm:ss, purely cosmetic in the archive list. */
  duration?: string
  /** Line that fades in after this video finishes. */
  afterQuote?: string
}

/* ------------------------------------------------------------------- songs */

export type Song = {
  id: string
  title: string
  artist?: string
  src: string
  /** 0–1. Per-track trim so nothing jumps in loudness. */
  volume?: number
  loop?: boolean
}

/* -------------------------------------------------------------------- chat */

export type Choice = {
  id: string
  label: string
  /** Opens a free-text box when picked (the "Something else" option). */
  opensText?: boolean
}

export type AnswerInput =
  | { type: 'choice'; options: Choice[]; correctId?: string }
  | { type: 'text'; placeholder?: string; minLength?: number; multiline?: boolean }
  | {
      type: 'slider'
      leftEmoji: string
      rightEmoji: string
      labels: [string, string, string]
      /** Lets him drag past 100% for the joke. */
      overshoot?: boolean
    }
  | { type: 'thisOrThat'; a: string; b: string }
  | { type: 'emojiScale'; emojis: string[] }
  | { type: 'voice'; maxSeconds: number }

export type Reactions = {
  /** Used when the question is scored. */
  correct?: string[]
  wrong?: string[]
  /** Used for unscored questions — free text, sliders, opinions. */
  any?: string[]
  /** Keyed by Choice.id — beats `correct`/`wrong` when present. */
  byOption?: Record<string, string[]>
  /** For sliders. First matching range wins. */
  byRange?: Array<{ min: number; max: number; lines: string[] }>
  /** For free text, chosen by how much he actually wrote. */
  long?: string[]
  short?: string[]
}

export type ChatNode =
  | { kind: 'text'; text: string; delay?: number; handwritten?: boolean }
  | { kind: 'photo'; src: string; alt: string; caption?: string }
  | { kind: 'voice'; src: string; seconds: number }
  | { kind: 'pause'; ms: number }
  | {
      kind: 'question'
      id: string
      /** One string, or several for a burst of messages before the input appears. */
      prompt: string | string[]
      input: AnswerInput
      reactions: Reactions
      /** Counts toward the score. Unscored questions never show right/wrong. */
      scored?: boolean
    }

export type ChatSession = {
  id: string
  /** Shown in the thread header: "CHAT 01 · warming up" */
  code: string
  title: string
  songId?: string
  nodes: ChatNode[]
  /** Shown once at the end of this session, if present. */
  verdict?: Array<{ min: number; max: number; lines: string[] }>
  /** Line that carries him out of the chat and back into the memories. */
  outro?: string[]
}

/* ----------------------------------------------------------------- letters */

export type Letter = {
  id: string
  /** "Open when you miss me" */
  title: string
  emoji: string
  body: string[]
  signoff?: string
  /** Optional voice note, path under /public/music or /public/videos. */
  voice?: string
}

/* ----------------------------------------------------------------- montage */

export type MontageCue =
  | { t: number; type: 'photo'; photoId: string; effect?: 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' }
  | { t: number; type: 'collage'; photoIds: string[] }
  | { t: number; type: 'text'; value: string; hold?: number }
  | { t: number; type: 'blackout' }

/* -------------------------------------------------------------- the finale */

export type Finale = {
  headline: string
  lines: string[]
  closing: string
  favouritePhotoId: string
  finalLine: string
  playfulLine: string
}
