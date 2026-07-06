import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { BalloonIcon, ConfettiPiece, FlowerIcon, ButterflyIcon } from '../ui/PremiumIcons'
import { soundManager } from '../../lib/sound'

function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const particlesRef = useRef<{
    x: number; y: number; vx: number; vy: number
    life: number; maxLife: number; color: string; size: number; trail: { x: number; y: number }[]
  }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#f43f5e', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f97316', '#d946ef', '#fcd34d']

    function createBurst(x: number, y: number) {
      const count = 50 + Math.random() * 60
      const color = colors[Math.floor(Math.random() * colors.length)]
      const type = Math.random()
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const speed = 2 + Math.random() * (type > 0.7 ? 8 : 5)
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type > 0.5 ? 2 : 0),
          life: 0,
          maxLife: 80 + Math.random() * 60,
          color: type > 0.8 ? colors[Math.floor(Math.random() * colors.length)] : color,
          size: type > 0.6 ? 1 + Math.random() * 3 : 2 + Math.random() * 2,
          trail: [],
        })
      }
      if (type > 0.6) {
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 1 + Math.random() * 3
          particlesRef.current.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            life: 0,
            maxLife: 40 + Math.random() * 30,
            color: '#fff',
            size: 0.5 + Math.random() * 1.5,
            trail: [],
          })
        }
      }
    }

    let lastBurst = 0
    function animate(time: number) {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (time - lastBurst > 400 + Math.random() * 800) {
        createBurst(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        createBurst(Math.random() * canvas.width, Math.random() * canvas.height * 0.3)
        lastBurst = time
      }

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 5) p.trail.shift()

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.vx *= 0.99
        p.life++

        const alpha = 1 - p.life / p.maxLife
        const glow = alpha * 0.5

        for (let t = 0; t < p.trail.length; t++) {
          const ta = (t / p.trail.length) * alpha * 0.3
          ctx.beginPath()
          ctx.arc(p.trail[t].x, p.trail[t].y, p.size * (t / p.trail.length), 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${ta})`).replace('rgb', 'rgba')
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba')
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha * 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(')', `, ${glow})`).replace('rgb', 'rgba')
        ctx.fill()

        if (p.life > p.maxLife) {
          particles.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

const floatingElements = [
  { Icon: BalloonIcon, color: '#f43f5e' },
  { Icon: BalloonIcon, color: '#fbbf24' },
  { Icon: BalloonIcon, color: '#a78bfa' },
  { Icon: BalloonIcon, color: '#34d399' },
  { Icon: FlowerIcon, color: '#f472b6' },
  { Icon: ButterflyIcon },
  { Icon: ConfettiPiece, color: '#fcd34d' },
  { Icon: ConfettiPiece, color: '#f43f5e' },
  { Icon: ConfettiPiece, color: '#a78bfa' },
  { Icon: FlowerIcon, color: '#fbbf24' },
]

export default function CelebrationSection() {
  const reducedMotion = useReducedMotion()
  const confettiFired = useRef(false)

  useEffect(() => {
    if (confettiFired.current || reducedMotion) return
    confettiFired.current = true

    const duration = 8000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4, angle: 60, spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa'],
      })
      confetti({
        particleCount: 4, angle: 120, spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    soundManager.playCelebration()
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <SectionWrapper className="bg-night-900">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display text-rose-200 mb-4">Happy Birthday!</h2>
          <p className="text-white/50 font-sans">Wishing you the most wonderful year ahead!</p>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper className="bg-party-hall min-h-[150dvh] relative" id="celebration" transitionType="lightBurst">
      <FireworksCanvas />

      <div className="relative z-10 text-center">
        <AnimatedText text="Let's Celebrate!" className="text-4xl md:text-7xl font-display text-rose-200 mb-4 text-center" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 font-sans tracking-widest text-xs uppercase"
        >
          This is YOUR moment
        </motion.p>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto mt-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {floatingElements.map((el, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              animate={{ y: [0, -15 - Math.random() * 20, 0] }}
              transition={{
                duration: 2 + Math.random(), repeat: Infinity, ease: 'easeInOut', delay: Math.random(),
              }}
              className="flex items-center justify-center p-4"
            >
              {'color' in el ? (
                <el.Icon color={el.color as string} />
              ) : (
                <el.Icon />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
