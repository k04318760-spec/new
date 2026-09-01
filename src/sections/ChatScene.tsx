import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { config } from '@/content/config'
import { sessionById } from '@/content/chat'
import { useExperience } from '@/state/Experience'
import { ChatThread } from '@/components/chat/ChatThread'
import { music } from '@/lib/audio'

/**
 * A chat session, dressed as a conversation rather than a quiz.
 *
 * The header is the only chrome: her name and a status line. No score,
 * no "question 3 of 7" — the moment he can see how many are left, it
 * stops being a conversation.
 */
export default function ChatScene({ sessionId }: { sessionId: string }) {
  const { next } = useExperience()
  const session = sessionById(sessionId)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (session?.songId) void music.play(session.songId, { fadeMs: 2200 })
    const t = window.setTimeout(() => setEntered(true), 300)
    return () => window.clearTimeout(t)
  }, [session])

  // A missing session must never dead-end him — but skipping past it has to
  // happen in an effect, not during render.
  useEffect(() => {
    if (!session) next()
  }, [session, next])

  if (!session) return null

  return (
    <main className="ambient screen-min-h flex flex-col px-5 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] sm:px-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto mb-6 flex w-full max-w-lg items-center gap-3 border-b border-ink-3 pb-4"
      >
        {/* Her initial, standing in for an avatar — no stock icon needed. */}
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                     border border-gold/30 bg-gold/10 font-display text-lg text-gold"
        >
          {config.her.name.replace(/[^A-Za-z]/g, '').charAt(0) || '?'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] text-bone">{config.her.name}</p>
          <p className="stencil !text-[10px] !tracking-[0.16em]">
            {entered ? session.title : 'typing...'}
          </p>
        </div>
      </motion.header>

      <ChatThread session={session} onComplete={next} />
    </main>
  )
}
