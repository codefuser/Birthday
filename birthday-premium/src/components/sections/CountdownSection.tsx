import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { soundManager } from '../../lib/sound'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { screenShake } from '../../lib/animations'

function CountNumber({ num, onComplete }: { num: number; onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (!ref.current) return

    const tl = gsap.timeline({
      onComplete,
    })

    tl.fromTo(ref.current,
      { scale: 3, opacity: 0, filter: 'blur(10px) brightness(3)' },
      { scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)', duration: 0.6, ease: 'power3.out' }
    )
    tl.to(ref.current, {
      scale: 5, opacity: 0, filter: 'blur(15px)', duration: 0.5, ease: 'power2.in',
    }, '+=0.8')

    screenShake(ref.current.parentElement || ref.current, 8, 0.3)

    soundManager.playTick()

    confetti({
      particleCount: 20, spread: 60, origin: { x: 0.3, y: 0.4 },
      colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#fcd34d'],
    })
    confetti({
      particleCount: 20, spread: 60, origin: { x: 0.7, y: 0.4 },
      colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#fcd34d'],
    })

    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div ref={ref} className="text-8xl md:text-9xl font-display text-gold-300 font-bold select-none"
      style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.5), 0 0 80px rgba(251, 191, 36, 0.3)' }}
    >
      {num}
    </div>
  )
}

interface CountdownSectionProps {
  onComplete: () => void
}

export default function CountdownSection({ onComplete }: CountdownSectionProps) {
  const [step, setStep] = useState(0)
  const reducedMotion = useReducedMotion()
  const numbers = [5, 4, 3, 2, 1]

  const handleComplete = useCallback(() => {
    if (step < numbers.length - 1) {
      setStep((s) => s + 1)
    } else {
      setTimeout(() => {
        soundManager.playCelebration()
        const duration = 3000
        const end = Date.now() + duration
        const frame = () => {
          confetti({
            particleCount: 8, angle: 60, spread: 80,
            origin: { x: 0, y: 0.5 }, colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#fcd34d', '#fcd34d'],
          })
          confetti({
            particleCount: 8, angle: 120, spread: 80,
            origin: { x: 1, y: 0.5 }, colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#fcd34d', '#fcd34d'],
          })
          confetti({
            particleCount: 15, spread: 360,
            origin: { x: 0.5, y: 0.3 },
            colors: ['#fcd34d', '#fef08a'],
            shapes: ['star'],
          })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
        onComplete()
      }, 1000)
    }
  }, [step, numbers.length, onComplete])

  if (reducedMotion) {
    return null
  }

  return (
    <section className="fixed inset-0 z-50 bg-night-900 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-radial from-gold-500/10 via-transparent to-transparent" />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center"
        >
          <CountNumber num={numbers[step]} onComplete={handleComplete} />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
