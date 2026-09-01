/**
 * The three dots. Small thing, but it is what convinces him there is a
 * person on the other end rather than a form waiting for input.
 */
export function TypingDots() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="typing">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-ink-3 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot h-1.5 w-1.5 rounded-full bg-bone-dim"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  )
}
