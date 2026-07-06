import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { StarIcon } from '../ui/PremiumIcons'
import { soundManager } from '../../lib/sound'

const wishes = [
  'May your heart always be light and happy!',
  'Wishing you a year of amazing adventures!',
  'May every day bring you a new reason to smile!',
  'You deserve all the happiness in the world!',
  'May your dreams take flight this year!',
  'Sending you warm wishes and big hugs!',
  'May life bring you everything you wish for!',
  'Here is to making beautiful memories together!',
  'You are stronger and braver than you know!',
  'May your year be filled with magical moments!',
  'Wishing you peace, love, and laughter!',
  'May the stars shine brightly on your journey!',
]

interface WishStar {
  id: number
  x: number
  y: number
  delay: number
  text: string
  size: 'sm' | 'md' | 'lg'
}

export default function WishSection() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [stars, setStars] = useState<WishStar[]>([])
  const [activeWish, setActiveWish] = useState('')
  const [showWish, setShowWish] = useState(false)
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const newStars: WishStar[] = wishes.map((text, i) => ({
      id: i, x: Math.random() * 85 + 7.5, y: Math.random() * 80 + 10,
      delay: Math.random() * 2, text,
      size: (['sm', 'md', 'lg'] as const)[Math.floor(Math.random() * 3)],
    }))
    setStars(newStars)
  }, [])

  const handleStarClick = useCallback((star: WishStar) => {
    setActiveWish(star.text)
    setShowWish(true)
    soundManager.playSparkle()
    setBurstParticles((prev) => [...prev, { id: Date.now(), x: star.x, y: star.y }])
    setTimeout(() => {
      setShowWish(false)
      setBurstParticles((prev) => prev.slice(1))
    }, 3500)
  }, [])

  return (
    <SectionWrapper className="bg-night-sky relative" id="wishes" transitionType="portal">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/10 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -200], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      <AnimatedText text="Wishing Stars" className="text-3xl md:text-5xl font-heading text-blue-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-10">Tap a star to reveal your wish</p>

      <div ref={containerRef} className="relative w-full max-w-3xl h-[420px] mx-auto">
        <AnimatePresence>
          {stars.map((star) => (
            <motion.button
              key={star.id}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: star.delay + 0.3, type: 'spring', stiffness: 60 }}
              whileHover={{ scale: 1.3, filter: 'brightness(1.3)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleStarClick(star)}
              className="absolute cursor-pointer bg-transparent border-none outline-none"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.12, 1],
                }}
                transition={{ duration: 2 + star.delay, repeat: Infinity, ease: 'easeInOut' }}
              >
                <StarIcon size={star.size} className="text-gold-300" />
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>

        {burstParticles.map((bp) => (
          <div key={bp.id} className="absolute pointer-events-none" style={{ left: `${bp.x}%`, top: `${bp.y}%` }}>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 0, x: Math.cos(angle) * 80, y: Math.sin(angle) * 80, scale: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute"
                >
                  <StarIcon size="sm" className="w-3 h-3 text-gold-300" />
                </motion.div>
              )
            })}
          </div>
        ))}

        <AnimatePresence>
          {showWish && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center"
            >
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(3)].map((_, i) => (
                  <StarIcon key={i} size="sm" className="w-4 h-4 text-gold-300" />
                ))}
              </div>
              <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">{activeWish}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  )
}
