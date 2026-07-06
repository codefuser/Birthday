import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeartIcon, SparkleParticle } from '../ui/PremiumIcons'
import { soundManager } from '../../lib/sound'

function TeddySVG() {
  const svgRef = useRef<HTMLDivElement>(null!)
  const [isWaving, setIsWaving] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !svgRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(svgRef.current.querySelector('.teddy-ear-l'), {
        rotation: -5, transformOrigin: 'right bottom', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(svgRef.current.querySelector('.teddy-ear-r'), {
        rotation: 5, transformOrigin: 'left bottom', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(svgRef.current.querySelector('.teddy-body'), {
        scaleY: 1.02, scaleX: 0.98, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
        transformOrigin: 'center bottom',
      })
      gsap.to(svgRef.current.querySelector('.teddy-eye-l'), {
        scaleY: 0.2, duration: 0.15, repeat: 1, yoyo: true, delay: 4,
      })
      gsap.to(svgRef.current.querySelector('.teddy-eye-r'), {
        scaleY: 0.2, duration: 0.15, repeat: 1, yoyo: true, delay: 4,
      })
      gsap.to(svgRef.current.querySelector('.teddy-mouth'), {
        scaleX: [1, 1.1, 1], duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    }, svgRef)
    return () => ctx.revert()
  }, [reducedMotion])

  useEffect(() => {
    if (!isWaving || !svgRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(svgRef.current.querySelector('.teddy-arm-l'), {
        rotation: -30, duration: 0.3, yoyo: true, repeat: 3, ease: 'power2.inOut',
        transformOrigin: 'right top',
      })
    }, svgRef)
    const t = setTimeout(() => ctx.revert(), 1500)
    return () => { clearTimeout(t); ctx.revert() }
  }, [isWaving])

  return (
    <div ref={svgRef} className="relative w-64 h-72 mx-auto cursor-pointer" onClick={() => setIsWaving(true)}>
      <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="tb" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#d4a574" /><stop offset="100%" stopColor="#b88352" />
          </radialGradient>
          <radialGradient id="ti" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8c49a" /><stop offset="100%" stopColor="#d4a574" />
          </radialGradient>
        </defs>
        <g className="teddy-ear-l">
          <ellipse cx="70" cy="68" rx="20" ry="26" fill="url(#tb)" />
          <ellipse cx="70" cy="72" rx="12" ry="16" fill="#e8c49a" />
        </g>
        <g className="teddy-ear-r">
          <ellipse cx="170" cy="68" rx="20" ry="26" fill="url(#tb)" />
          <ellipse cx="170" cy="72" rx="12" ry="16" fill="#e8c49a" />
        </g>
        <g className="teddy-body">
          <ellipse cx="120" cy="210" rx="56" ry="50" fill="#b88352" />
          <ellipse cx="120" cy="180" rx="50" ry="58" fill="url(#tb)" />
          <ellipse cx="120" cy="190" rx="32" ry="38" fill="url(#ti)" />
          <g className="teddy-arm-l" style={{ transformOrigin: '75px 150px' }}>
            <ellipse cx="52" cy="190" rx="18" ry="38" fill="url(#tb)" />
            <ellipse cx="48" cy="200" rx="12" ry="16" fill="#e8c49a" />
          </g>
          <g className="teddy-arm-r" style={{ transformOrigin: '165px 150px' }}>
            <ellipse cx="188" cy="190" rx="18" ry="38" fill="url(#tb)" />
            <ellipse cx="192" cy="200" rx="12" ry="16" fill="#e8c49a" />
          </g>
          <g>
            <ellipse cx="120" cy="90" rx="56" ry="60" fill="url(#tb)" />
            <ellipse cx="120" cy="98" rx="36" ry="36" fill="url(#ti)" />
            <ellipse cx="95" cy="82" rx="6" ry="7" fill="#2d1a0e" className="teddy-eye-l" />
            <ellipse cx="145" cy="82" rx="6" ry="7" fill="#2d1a0e" className="teddy-eye-r" />
            <circle cx="97" cy="80" r="2.5" fill="#fff" opacity="0.8" />
            <circle cx="147" cy="80" r="2.5" fill="#fff" opacity="0.8" />
            <ellipse cx="100" cy="90" rx="7" ry="2.5" fill="#2d1a0e" opacity="0.5" />
            <ellipse cx="140" cy="90" rx="7" ry="2.5" fill="#2d1a0e" opacity="0.5" />
            <ellipse cx="120" cy="95" rx="8" ry="5" fill="#e88d8d" />
            <path d="M112 100 Q120 108 128 100" fill="none" stroke="#2d1a0e" strokeWidth="1.5" strokeLinecap="round" className="teddy-mouth" />
          </g>
          <circle cx="120" cy="55" r="7" fill="#d4a574" />
          <circle cx="108" cy="48" r="4" fill="#d4a574" />
          <circle cx="132" cy="48" r="4" fill="#d4a574" />
        </g>
      </svg>
    </div>
  )
}

export default function TeddySection() {
  const [showHearts, setShowHearts] = useState(false)

  const handleClick = () => {
    setShowHearts(true)
    soundManager.playSparkle()
    setTimeout(() => setShowHearts(false), 2000)
  }

  return (
    <SectionWrapper className="bg-soft-clouds relative" id="teddy" transitionType="ribbon">
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: '#fff',
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <AnimatedText text="A Special Friend" className="text-3xl md:text-5xl font-heading text-amber-200 mb-3 text-center" />

      <p className="text-white/40 font-sans text-sm tracking-widest uppercase mb-12">
        Click to receive love
      </p>

      <div onClick={handleClick} className="relative">
        <TeddySVG />

        <AnimatePresence>
          {showHearts && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2
                const r = 100 + Math.random() * 60
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: Math.cos(angle) * r,
                      y: Math.sin(angle) * r - 80,
                      scale: [0, 1.2, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2"
                  >
                    <HeartIcon className="w-8 h-8" />
                  </motion.div>
                )
              })}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -60 - Math.random() * 40 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                  className="absolute top-1/2 left-1/2"
                  style={{ marginLeft: (i - 2) * 20 }}
                >
                  <SparkleParticle />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  )
}
