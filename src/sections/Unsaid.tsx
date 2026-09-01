import { ChapterScroll } from '@/components/photo/ChapterScroll'
import { byChapter } from '@/content/memories'
import { useExperience } from '@/state/Experience'
import { q } from '@/content/quotes'

/**
 * Chapter 4. The closest photos, one line each, nothing rushed.
 * If any section deserves to be slower than feels comfortable, it's this one.
 */
export default function Unsaid() {
  const { next } = useExperience()
  return (
    <ChapterScroll
      number="04"
      title="things I may not always say"
      photos={byChapter('unsaid')}
      closingLines={[q.lookAfterYouToo]}
      onDone={next}
      cta="there's more"
    />
  )
}
