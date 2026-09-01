import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/cn'

/**
 * The one animation primitive. Fade up, slowly, once, when it comes into
 * view. Everything on the site that appears, appears through this — which
 * is what makes the pacing feel deliberate instead of twitchy.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  blur = true,
  duration = 1.1,
  className,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  /** Blur-to-focus. Beautiful, but expensive — off for long lists. */
  blur?: boolean
  duration?: number
  className?: string
  once?: boolean
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    // No motion, but never no content — it just arrives already there.
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(8px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.25, margin: '0px 0px -10% 0px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Same idea, but for things that should appear the moment they mount. */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.9,
  className,
}: {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.01 : duration, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** A quiet nudge to keep going. Never a hard "next" — this isn't a form. */
export function ScrollCue({ label = 'scroll', className }: { label?: string; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      className={cn('flex flex-col items-center gap-2', className)}
      animate={reduced ? {} : { y: [0, 7, 0], opacity: [0.35, 0.8, 0.35] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="stencil">{label}</span>
      <span className="h-8 w-px bg-gradient-to-b from-gold/50 to-transparent" />
    </motion.div>
  )
}
