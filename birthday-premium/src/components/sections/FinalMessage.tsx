import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import SectionWrapper from '../ui/SectionWrapper'
import { birthdayConfig } from '../../config/birthday'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { StarIcon, HeartIcon } from '../ui/PremiumIcons'

function NightSkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const stars: { x: number; y: number; size: number; alpha: number; speed: number; twinkle: number }[] = []
    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3, alpha: Math.random(), speed: 0.003 + Math.random() * 0.01, twinkle: Math.random() * Math.PI * 2,
      })
    }

    function animate(time: number) {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.alpha = 0.3 + Math.sin(time * star.speed + star.twinkle) * 0.7
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.alpha)})`
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default function FinalMessage() {
  const reducedMotion = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (reducedMotion || !contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.querySelectorAll('.final-line'), {
        y: 30, opacity: 0, duration: 1.2, stagger: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      })
    }, contentRef)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <SectionWrapper className="bg-night-900 min-h-[100dvh] relative overflow-hidden" id="final" transitionType="ribbon">
      <NightSkyCanvas />

      <div ref={contentRef} className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, delay: 0.2 }}
          className="mb-8"
        >
          <StarIcon size="lg" className="mx-auto text-gold-300" />
        </motion.div>

        <h2 className="final-line text-3xl md:text-5xl font-display text-rose-200 mb-6 leading-tight">
          {birthdayConfig.greetingMessages.main}
        </h2>

        <p className="final-line text-lg md:text-xl text-white/50 font-sans font-light leading-relaxed mb-6 max-w-xl mx-auto">
          {birthdayConfig.finalMessage}
        </p>

        <p className="final-line text-white/20 font-sans text-sm italic tracking-wider mb-10">
          {birthdayConfig.birthdayDate}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex justify-center gap-4"
        >
          {[StarIcon, HeartIcon, StarIcon, HeartIcon, StarIcon].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2.5 + i * 0.12, duration: 0.6 }}
            >
              <motion.div
                animate={reducedMotion ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              >
                <Icon className={`w-6 h-6 ${i % 2 === 0 ? 'text-gold-300' : 'text-rose-300'}`} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
