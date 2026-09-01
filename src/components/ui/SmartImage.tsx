import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Every photo on the site goes through here.
 *
 *  · `src` carries no extension. `npm run optimize` emits -640/-1080/-1600
 *    .webp files, and the browser picks whichever fits his screen. On a
 *    phone that's a ~90KB download instead of a 4MB one.
 *  · Lazy by default, so opening the site doesn't pull thirty photos at once.
 *  · If the file isn't there yet, it renders a labelled placeholder instead
 *    of a broken-image icon — so the whole journey is clickable end to end
 *    before a single real photo exists.
 */

type Props = {
  src: string
  alt: string
  className?: string
  /** The first image of a chapter — loads eagerly so it's never blank. */
  priority?: boolean
  sizes?: string
  /** Extra classes on the <img> itself, e.g. a Ken Burns animation. */
  imgClassName?: string
  onLoad?: () => void
}

const WIDTHS = [640, 1080, 1600] as const

export function SmartImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 80vw',
  imgClassName,
  onLoad,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) return <Placeholder alt={alt} src={src} className={className} />

  return (
    <div className={cn('relative overflow-hidden bg-ink-2', className)}>
      {/* Warm block underneath, so an unloaded photo reads as intentional
          darkness rather than a hole in the page. */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-ink-3 to-ink transition-opacity duration-700',
          loaded ? 'opacity-0' : 'opacity-100'
        )}
      />
      <img
        src={`${src}-1080.webp`}
        srcSet={WIDTHS.map((w) => `${src}-${w}.webp ${w}w`).join(', ')}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => {
          setLoaded(true)
          onLoad?.()
        }}
        onError={() => setFailed(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
      />
    </div>
  )
}

/**
 * What she sees while building. Deliberately readable: it tells her exactly
 * which file is missing and what she wrote in the alt text.
 */
function Placeholder({ alt, src, className }: { alt: string; src: string; className?: string }) {
  const filename = src.split('/').pop()
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden',
        'bg-[repeating-linear-gradient(135deg,#131010_0px,#131010_14px,#1c1817_14px,#1c1817_28px)]',
        'px-6 py-10 text-center',
        className
      )}
      role="img"
      aria-label={alt}
    >
      <ImageOff className="h-6 w-6 text-faint" aria-hidden />
      <p className="max-w-xs text-sm leading-relaxed text-bone-dim">{alt}</p>
      <p className="font-mono text-[10px] tracking-wider text-faint">
        {filename}-1080.webp
      </p>
    </div>
  )
}
