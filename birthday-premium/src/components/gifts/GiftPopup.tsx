import { useRef, useEffect, useState, useCallback, Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { GiftData } from '../../lib/giftConfig'
import { useLiveAge } from '../../hooks/useLiveAge'
import { GiftViewer } from './GiftViewer'

const GiftScene1 = lazy(() => import('./GiftScene1').then(m => ({ default: m.GiftScene1 })))
const GiftScene2 = lazy(() => import('./GiftScene2').then(m => ({ default: m.GiftScene2 })))
const GiftScene3 = lazy(() => import('./GiftScene3').then(m => ({ default: m.GiftScene3 })))
const GiftScene4 = lazy(() => import('./GiftScene4').then(m => ({ default: m.GiftScene4 })))
const GiftScene5 = lazy(() => import('./GiftScene5').then(m => ({ default: m.GiftScene5 })))
const GiftScene6 = lazy(() => import('./GiftScene6').then(m => ({ default: m.GiftScene6 })))

const sceneComponents: Record<number, React.LazyExoticComponent<() => React.JSX.Element>> = {
  1: GiftScene1,
  2: GiftScene2,
  3: GiftScene3,
  4: GiftScene4,
  5: GiftScene5,
  6: GiftScene6,
}

function SceneLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border border-white/20 border-t-gold-300 rounded-full animate-spin" />
      <span className="text-[10px] text-white/20 font-sans tracking-widest uppercase">Loading...</span>
    </div>
  )
}

function ParticleField({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }[] = []
    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        life: Math.random(),
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.life += 0.003
        if (p.life > 1 || p.y < -10) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.life = 0
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = p.alpha * (1 - p.life)
        ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  )
}

export function GiftPopup({ gift, onClose }: { gift: GiftData; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const age = useLiveAge()
  const Scene = sceneComponents[gift.id]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-h-[90dvh] rounded-[28px] overflow-hidden border border-white/15"
        style={{
          maxWidth: 'min(95vw, 700px)',
          background: `linear-gradient(170deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.015) 50%, rgba(10,10,26,0.6) 100%)`,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full" style={{ background: `radial-gradient(circle, ${gift.color}20, transparent 70%)`, filter: 'blur(40px)' }} />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full" style={{ background: `radial-gradient(circle, #fcd34d12, transparent 70%)`, filter: 'blur(30px)' }} />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/5 border border-white/12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 transition-all duration-200 backdrop-blur-md"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <div className="relative h-[55dvh] min-h-[280px] max-h-[460px] w-full">
          <ParticleField color={gift.color} />

          <Suspense fallback={<SceneLoader />}>
            <Canvas
              camera={{ position: [0, 0, 1.8], fov: 35 }}
              gl={{
                antialias: true,
                alpha: true,
                toneMapping: 3,
                toneMappingExposure: 1.4,
                outputColorSpace: 'srgb',
              }}
              onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
              style={{ background: 'transparent' }}
            >
              <GiftViewer>
                {Scene && <Scene />}
              </GiftViewer>
            </Canvas>
          </Suspense>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.35) 100%)',
          }} />
        </div>

        <div className="relative px-5 sm:px-7 pb-5 sm:pb-7 -mt-2 text-center">
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2 bg-white/5 border border-white/10">
              <span className="text-base">✦</span>
            </div>

            <h2 className="text-base sm:text-lg font-heading text-white mb-0.5 tracking-wide">
              {age.years}<sup>th</sup> Birthday
            </h2>

            <p className="text-[9px] text-white/20 font-sans tracking-wider">
              {age.years}Y · {age.totalMonths}M · {age.totalDays}D
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <div className="w-8 h-px mx-auto my-2.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${gift.color}, transparent)` }} />

            <h3 className="text-lg sm:text-xl font-heading mb-1" style={{ color: gift.color }}>
              {gift.displayTitle}
            </h3>

            <p className="text-xs sm:text-sm text-white/45 font-sans leading-relaxed max-w-xs mx-auto">
              {gift.message}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mt-3"
          >
            {[gift.color, '#fcd34d', '#f43f5e', '#a78bfa'].map((c, i) => (
              <motion.span
                key={i}
                className="text-[10px]"
                style={{ color: c }}
                animate={{ y: [0, -3, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1.5, delay: i * 0.25, repeat: Infinity }}
              >
                ✦
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
