import { ChapterScroll } from '@/components/photo/ChapterScroll'
import { byChapter } from '@/content/memories'
import { useExperience } from '@/state/Experience'
import { q } from '@/content/quotes'

/** Chapter 1. Quiet. Slow. The photos do the work here, not the words. */
export default function Beginning() {
  const { next } = useExperience()
  return (
    <ChapterScroll
      number="01"
      title="it started somewhere"
      subtitle="I went looking for the earliest ones I still had."
      photos={byChapter('beginning')}
      closingLines={[q.gladIMetYou]}
      onDone={next}
      cta="keep going"
    />
  )
}
