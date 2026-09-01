import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/hooks'

/**
 * The only button style on the site. Warm, quiet, and always big enough
 * for a thumb — every call to action he ever taps is one of these.
 */
export function CinemaButton({
  children,
  onClick,
  variant = 'solid',
  className,
  disabled,
  autoFocus,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'solid' | 'ghost' | 'quiet'
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  'aria-label'?: string
}) {
  const reduced = useReducedMotion()

  const styles = {
    solid:
      'bg-gold text-ink shadow-[0_0_40px_-8px_rgba(232,195,158,0.45)] hover:bg-bone active:bg-bone',
    ghost:
      'border border-gold/35 text-gold hover:border-gold/70 hover:bg-gold/5 active:bg-gold/10',
    quiet: 'text-muted hover:text-bone-dim',
  }[variant]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      whileTap={reduced || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'tap-target inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5',
        'text-[15px] font-medium tracking-wide transition-colors duration-300',
        'disabled:cursor-not-allowed disabled:opacity-40',
        styles,
        className
      )}
    >
      {children}
    </motion.button>
  )
}

/**
 * A softly breathing halo behind the important buttons — the start button,
 * the gift box. Draws the eye without a single arrow or bouncing balloon.
 */
export function Halo({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <span className="relative inline-flex">
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-gold/20 blur-2xl"
          animate={{ opacity: [0.3, 0.75, 0.3], scale: [0.95, 1.15, 0.95] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {children}
    </span>
  )
}
