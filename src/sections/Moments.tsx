import { ChapterScroll } from '@/components/photo/ChapterScroll'
import { byChapter } from '@/content/memories'
import { useExperience } from '@/state/Experience'
import { q } from '@/content/quotes'

/**
 * Chapter 3. The emotional one. Deliberately the least animated section on
 * the whole site — the photos are carrying it, and anything moving around
 * them would only get in the way.
 */
export default function Moments() {
  const { next } = useExperience()
  return (
    <ChapterScroll
      number="03"
      title="the moments that matter"
      photos={byChapter('moments')}
      closingLines={[q.keepCollecting]}
      onDone={next}
      cta="wait, one second"
    />
  )
}
