import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '../../lib/utils'
import { starWarpTransition, portalTransition, ribbonRevealTransition, lightBurstTransition, particleDissolveTransition } from '../../lib/animations'

export type TransitionType = 'none' | 'starWarp' | 'portal' | 'ribbon' | 'lightBurst' | 'particleDissolve'

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  id?: string
  transitionType?: TransitionType
}

function TransitionOverlay({ type, containerRef }: { type: TransitionType; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const playedRef = useRef(false)

  useEffect(() => {
    if (playedRef.current || type === 'none' || !containerRef.current) return
    playedRef.current = true
    const el = containerRef.current

    switch (type) {
      case 'starWarp':
        starWarpTransition(el)
        break
      case 'portal': {
        const circle = el.querySelector('.portal-circle') as HTMLElement
        if (circle) portalTransition(circle)
        break
      }
      case 'ribbon': {
        const ribbons = el.querySelectorAll('.ribbon-el') as unknown as HTMLElement[]
        if (ribbons.length) ribbonRevealTransition(Array.from(ribbons))
        break
      }
      case 'lightBurst': {
        const burst = el.querySelector('.light-burst') as HTMLElement
        if (burst) lightBurstTransition(burst)
        break
      }
      case 'particleDissolve': {
        const particles = el.querySelectorAll('.dissolve-particle') as unknown as HTMLElement[]
        if (particles.length) {
          particleDissolveTransition(el, Array.from(particles))
        }
        break
      }
    }
  }, [type, containerRef])

  if (type === 'none') return null

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {type === 'starWarp' && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="warp-line h-[2px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
              style={{ width: `${20 + Math.random() * 60}%` }} />
          ))}
        </div>
      )}
      {type === 'portal' && (
        <div className="portal-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-radial from-rose-400/60 via-gold-400/30 to-transparent" />
      )}
      {type === 'ribbon' && (
        <div className="absolute inset-0 flex flex-col">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ribbon-el flex-1 bg-gradient-to-b from-rose-500/40 via-gold-400/20 to-transparent"
              style={{ marginBottom: i < 7 ? '1px' : 0 }} />
          ))}
        </div>
      )}
      {type === 'lightBurst' && (
        <div className="light-burst absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_60px_20px_rgba(251,191,36,0.6)]" />
      )}
      {type === 'particleDissolve' && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="dissolve-particle absolute w-2 h-2 rounded-full bg-gold-400/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SectionWrapper({ children, className, id, transitionType = 'none' }: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null!)
  const overlayContainerRef = useRef<HTMLDivElement>(null!)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60])

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, scale, y }}
      className={cn(
        'relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden px-4 py-20',
        className
      )}
    >
      <TransitionOverlay type={transitionType} containerRef={overlayContainerRef} />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.section>
  )
}
