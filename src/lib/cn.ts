/** Tiny classnames joiner. No dependency needed for this. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Picks one line at random. Keeps reactions from feeling canned. */
export function pick<T>(list: T[] | undefined): T | null {
  if (!list || list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)]
}

/** Reading-speed delay, so her messages arrive like a person typing. */
export function typingDelay(text: string): number {
  const base = 420
  const perChar = 22
  return Math.min(2200, base + text.length * perChar)
}
