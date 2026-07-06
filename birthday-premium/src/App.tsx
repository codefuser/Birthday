import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import HeroSection from './components/sections/HeroSection'
import CakeSection from './components/sections/CakeSection'
import MemoriesSection from './components/sections/MemoriesSection'
import FriendshipTimeline from './components/sections/FriendshipTimeline'
import GiftSection from './components/sections/GiftSection'
import WishSection from './components/sections/WishSection'
import CelebrationSection from './components/sections/CelebrationSection'
import FinalMessage from './components/sections/FinalMessage'
import CountdownSection from './components/sections/CountdownSection'
import SectionWrapper from './components/ui/SectionWrapper'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { birthdayConfig } from './config/birthday'
import { useReducedMotion } from './hooks/useReducedMotion'
import { soundManager } from './lib/sound'
import { StarIcon, HeartIcon } from './components/ui/PremiumIcons'

function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </motion.button>
  )
}

function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-400 via-gold-400 to-rose-400 z-50 origin-left"
    />
  )
}

function ScrollIndicator() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase text-white/30 font-sans">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const [showContent, setShowContent] = useState(reducedMotion)
  const [countdownDone, setCountdownDone] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleCountdownComplete = useCallback(() => {
    setShowContent(true)
    soundManager.playCelebration()
    setTimeout(() => setCountdownDone(true), 1500)
  }, [])

  const toggleMute = useCallback(() => {
    const muted = soundManager.toggleMute()
    setIsMuted(muted)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      syncScroll: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => { lenis.destroy() }
  }, [reducedMotion])

  return (
    <div className="relative">
      <AnimatePresence>
        {!reducedMotion && !countdownDone && (
          <motion.div
            key="countdown-wrapper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50"
          >
            <CountdownSection onComplete={handleCountdownComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
        <ProgressBar />
        <MuteButton isMuted={isMuted} onToggle={toggleMute} />
        <ScrollIndicator />

        <ErrorBoundary><HeroSection /></ErrorBoundary>
        <ErrorBoundary><CakeSection /></ErrorBoundary>
        <ErrorBoundary><MemoriesSection /></ErrorBoundary>
        <ErrorBoundary><FriendshipTimeline /></ErrorBoundary>
        <ErrorBoundary><GiftSection /></ErrorBoundary>
        <ErrorBoundary><WishSection /></ErrorBoundary>
        <ErrorBoundary><CelebrationSection /></ErrorBoundary>
        <ErrorBoundary><FinalMessage /></ErrorBoundary>

        <footer className="relative z-10 py-8 text-center bg-night-900 border-t border-white/5">
          <p className="text-white/20 text-xs font-sans flex items-center justify-center gap-2">
            <HeartIcon className="w-4 h-4 text-rose-400/60" />
            <span>Made for {birthdayConfig.friendName} &mdash; Happy Birthday!</span>
            <StarIcon className="w-4 h-4 text-gold-400/60" />
          </p>
        </footer>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
