import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/cn'

/**
 * Lines that arrive one at a time, at reading speed, and wait.
 *
 * This is the site's whole voice. The pauses between the lines are doing
 * more emotional work than the lines themselves, so resist speeding it up.
 */

type Props = {
  lines: string[]
  /** Gap before the first line. */
  startDelay?: number
  /** Base gap between lines; long lines automatically get longer. */
  gap?: number
  className?: string
  lineClassName?: string
  /** Keeps earlier lines on screen. Off = each line replaces the last. */
  stack?: boolean
  onDone?: () => void
}

export function TypeLines({
  lines,
  startDelay = 400,
  gap = 1500,
  className,
  lineClassName,
  stack = true,
  onDone,
}: Props) {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(reduced ? lines.length : 0)

  /**
   * Callers write `lines={['Okay.', "Let's begin."]}` inline, so the array is
   * a new object on every parent render. Keying the effect on its *contents*
   * instead of its identity is not a micro-optimisation — without it any
   * incidental re-render restarts the sequence and fires `onDone` again, and
   * since `onDone` is usually "advance to the next scene", the journey skips
   * whole chapters. That is exactly what it did.
   */
  const key = lines.join('␟')

  // Same reason: an inline arrow prop must not be able to re-trigger the run.
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const all = key.split('␟')

    if (reduced) {
      setVisible(all.length)
      const t = window.setTimeout(() => onDoneRef.current?.(), 0)
      return () => window.clearTimeout(t)
    }

    setVisible(0)
    const timers: number[] = []
    let elapsed = startDelay

    all.forEach((line, i) => {
      timers.push(window.setTimeout(() => setVisible(i + 1), elapsed))
      // An empty line is a deliberate beat of silence.
      const weight = line.length === 0 ? 0.6 : Math.min(2.2, 0.75 + line.length / 42)
      elapsed += gap * weight
    })

    timers.push(window.setTimeout(() => onDoneRef.current?.(), elapsed))
    return () => timers.forEach(window.clearTimeout)
  }, [key, reduced, startDelay, gap])

  if (!stack) {
    const current = lines[Math.max(0, visible - 1)]
    return (
      <div className={cn('relative', className)}>
        <AnimatePresence mode="wait">
          <motion.p
            key={visible}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: reduced ? 0.01 : 0.85, ease: [0.16, 1, 0.3, 1] }}
            className={lineClassName}
          >
            {current}
          </motion.p>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={className}>
      {lines.slice(0, visible).map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: reduced ? 0.01 : 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(line === '' && 'h-4', lineClassName)}
        >
          {line}
        </motion.p>
      ))}
    </div>
  )
}
