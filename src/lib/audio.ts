import { songs, songById } from '@/content/songs'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  MUSIC                                                               ║
 * ║                                                                      ║
 * ║  Rules that are not negotiable:                                      ║
 * ║   · Nothing plays before he taps "start". Browsers block it, and     ║
 * ║     fighting them just produces silence and a console full of red.   ║
 * ║   · Sections crossfade. A hard cut between songs feels like a bug.   ║
 * ║   · A playing video always wins — the music ducks out of its way     ║
 * ║     and comes back afterwards.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type FadeHandle = number | null

class MusicPlayer {
  private elements = new Map<string, HTMLAudioElement>()
  private fades = new Map<string, FadeHandle>()
  private currentId: string | null = null
  private ducked = false
  private listeners = new Set<() => void>()

  /** Master gain, 0–1. Everything is multiplied by this. */
  masterVolume = 1
  muted = false
  unlocked = false

  /* ------------------------------------------------------------ react glue */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit() {
    this.listeners.forEach((fn) => fn())
  }

  get nowPlaying() {
    return this.currentId ? songById(this.currentId) ?? null : null
  }

  get isPlaying() {
    if (!this.currentId) return false
    const el = this.elements.get(this.currentId)
    return !!el && !el.paused
  }

  /* -------------------------------------------------------------- elements */

  private element(id: string): HTMLAudioElement | null {
    const song = songById(id)
    if (!song) return null

    let el = this.elements.get(id)
    if (!el) {
      el = new Audio()
      el.src = song.src
      el.loop = song.loop ?? true
      el.preload = 'none'
      el.volume = 0
      // iOS will not play anything it thinks might be a video.
      el.setAttribute('playsinline', '')
      el.addEventListener('play', () => this.emit())
      el.addEventListener('pause', () => this.emit())
      // A missing mp3 must never take the site down with it.
      el.addEventListener('error', () => {
        if (import.meta.env.DEV) {
          console.warn(`[music] could not load ${song.src} — carrying on without it.`)
        }
      })
      this.elements.set(id, el)
    }
    return el
  }

  /** Target volume for a track, accounting for mute, ducking and master. */
  private targetVolume(id: string): number {
    if (this.muted) return 0
    const song = songById(id)
    const base = song?.volume ?? 0.5
    return base * this.masterVolume * (this.ducked ? 0.12 : 1)
  }

  private fadeTo(el: HTMLAudioElement, id: string, to: number, ms: number, onDone?: () => void) {
    const existing = this.fades.get(id)
    if (existing) cancelAnimationFrame(existing)

    const from = el.volume
    const start = performance.now()
    if (ms <= 0 || from === to) {
      el.volume = clamp(to)
      onDone?.()
      return
    }

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      // ease-out so fades feel like a hand on a fader, not a linear ramp
      el.volume = clamp(from + (to - from) * (1 - Math.pow(1 - t, 3)))
      if (t < 1) {
        this.fades.set(id, requestAnimationFrame(step))
      } else {
        this.fades.set(id, null)
        onDone?.()
      }
    }
    this.fades.set(id, requestAnimationFrame(step))
  }

  /* ---------------------------------------------------------------- public */

  /**
   * Called once, from the tap on "Start Your Surprise". Everything the
   * browser needs to trust us happens inside that gesture.
   */
  async unlock(firstSongId: string) {
    this.unlocked = true
    // Nudge every element awake inside the gesture so later plays are allowed.
    for (const song of songs) {
      const el = this.element(song.id)
      if (el) el.preload = 'none'
    }
    await this.play(firstSongId, { fadeMs: 2400 })
    this.emit()
  }

  async play(id: string, opts: { fadeMs?: number } = {}) {
    if (!this.unlocked) return
    if (this.currentId === id && this.isPlaying) return

    const fadeMs = opts.fadeMs ?? 1600
    const previousId = this.currentId
    const el = this.element(id)
    if (!el) return

    this.currentId = id
    el.preload = 'auto'

    try {
      el.volume = 0
      await el.play()
      this.fadeTo(el, id, this.targetVolume(id), fadeMs)
    } catch {
      // Autoplay refused, or the file is missing. Neither is fatal.
      this.currentId = previousId
      this.emit()
      return
    }

    if (previousId && previousId !== id) {
      const prev = this.elements.get(previousId)
      if (prev) {
        this.fadeTo(prev, previousId, 0, fadeMs, () => {
          prev.pause()
          prev.currentTime = 0
        })
      }
    }
    this.emit()
  }

  toggle() {
    if (!this.currentId) return
    const el = this.elements.get(this.currentId)
    if (!el) return
    if (el.paused) {
      void el.play().then(() => this.fadeTo(el, this.currentId!, this.targetVolume(this.currentId!), 500))
    } else {
      this.fadeTo(el, this.currentId, 0, 400, () => el.pause())
    }
    this.emit()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.currentId) {
      const el = this.elements.get(this.currentId)
      if (el) this.fadeTo(el, this.currentId, this.targetVolume(this.currentId), 320)
    }
    this.emit()
  }

  setMasterVolume(v: number) {
    this.masterVolume = clamp(v)
    if (this.currentId) {
      const el = this.elements.get(this.currentId)
      if (el) el.volume = this.targetVolume(this.currentId)
    }
    this.emit()
  }

  /**
   * Pull the music down under a video, and hand back the undo.
   * Returns a function — call it when the video ends or the modal closes.
   */
  duck(): () => void {
    this.ducked = true
    if (this.currentId) {
      const el = this.elements.get(this.currentId)
      if (el) this.fadeTo(el, this.currentId, this.targetVolume(this.currentId), 600)
    }
    this.emit()

    let restored = false
    return () => {
      if (restored) return
      restored = true
      this.ducked = false
      if (this.currentId) {
        const el = this.elements.get(this.currentId)
        if (el) this.fadeTo(el, this.currentId, this.targetVolume(this.currentId), 1200)
      }
      this.emit()
    }
  }

  /** Full silence, for the seconds of nothing before the fake ending breaks. */
  fadeOutAll(ms = 2000) {
    this.elements.forEach((el, id) => {
      if (el.paused) return
      this.fadeTo(el, id, 0, ms, () => el.pause())
    })
    this.currentId = null
    this.emit()
  }
}

const clamp = (n: number) => Math.max(0, Math.min(1, n))

/** One player for the whole site. */
export const music = new MusicPlayer()
