import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ExperienceProvider, useExperience } from '@/state/Experience'
import { Chrome } from '@/components/chrome/Chrome'
import { ResumePrompt } from '@/components/chrome/ResumePrompt'
import { SelfTest } from '@/components/chrome/SelfTest'
import { config } from '@/content/config'

/**
 * Scenes load on demand. The intro ships in the first bundle; the montage,
 * the archive and the finale don't get downloaded until he's on his way to
 * them. On a phone that's the difference between a 2-second start and a
 * 10-second one.
 */
const Gate = lazy(() => import('@/sections/Gate'))
const Intro = lazy(() => import('@/sections/Intro'))
const Beginning = lazy(() => import('@/sections/Beginning'))
const Chaos = lazy(() => import('@/sections/Chaos'))
const Moments = lazy(() => import('@/sections/Moments'))
const Unsaid = lazy(() => import('@/sections/Unsaid'))
const ChatScene = lazy(() => import('@/sections/ChatScene'))
const Archive = lazy(() => import('@/sections/Archive'))
const Letters = lazy(() => import('@/sections/Letters'))
const Montage = lazy(() => import('@/sections/Montage'))
const Credits = lazy(() => import('@/sections/Credits'))
const Finale = lazy(() => import('@/sections/Finale'))
const Vault = lazy(() => import('@/vault/Vault'))

export default function App() {
  const route = useHashRoute()

  // Her private read of his answers. Deliberately not linked from anywhere.
  if (route === '#/vault' && config.vault.enabled) {
    return (
      <Suspense fallback={<Blackout />}>
        <Vault />
      </Suspense>
    )
  }

  return (
    <ExperienceProvider>
      <Experience />
    </ExperienceProvider>
  )
}

function Experience() {
  const { step, resumeAvailable } = useExperience()

  return (
    <>
      <Chrome />
      <SelfTest />
      {resumeAvailable !== null && <ResumePrompt />}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Suspense fallback={<Blackout />}>
            <Scene id={step.id} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function Scene({ id }: { id: string }) {
  switch (id) {
    case 'gate':
      return <Gate />
    case 'intro':
      return <Intro />
    case 'beginning':
      return <Beginning />
    case 'chaos':
      return <Chaos />
    case 'moments':
      return <Moments />
    case 'unsaid':
      return <Unsaid />
    case 'chat-01':
      return <ChatScene sessionId="chat-01" />
    case 'chat-02':
      return <ChatScene sessionId="chat-02" />
    case 'chat-03':
      return <ChatScene sessionId="chat-03" />
    case 'chat-04':
      return <ChatScene sessionId="chat-04" />
    case 'videos':
      return <Archive />
    case 'letters':
      return <Letters />
    case 'montage':
      return <Montage />
    case 'credits':
      return <Credits />
    case 'finale':
      return <Finale />
    default:
      return null
  }
}

/** Deliberately empty — a spinner would break the spell. */
function Blackout() {
  return <div className="screen-h bg-ink" aria-busy="true" aria-label="loading" />
}

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}
