import { useRef, useEffect, useState, useCallback, Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { GiftData } from '../../lib/giftConfig'
import { useLiveAge } from '../../hooks/useLiveAge'

const GiftScene1 = lazy(() => import('./GiftScene1').then(m => ({ default: m.GiftScene1 })))
const GiftScene2 = lazy(() => import('./GiftScene2').then(m => ({ default: m.GiftScene2 })))
const GiftScene3 = lazy(() => import('./GiftScene3').then(m => ({ default: m.GiftScene3 })))
const GiftScene4 = lazy(() => import('./GiftScene4').then(m => ({ default: m.GiftScene4 })))
const GiftScene5 = lazy(() => import('./GiftScene5').then(m => ({ default: m.GiftScene5 })))
const GiftScene6 = lazy(() => import('./GiftScene6').then(m => ({ default: m.GiftScene6 })))

const sceneComponents: Record<number, React.LazyExoticComponent<(props: { mouse: { x: number; y: number } }) => React.JSX.Element>> = {
  1: GiftScene1,
  2: GiftScene2,
  3: GiftScene3,
  4: GiftScene4,
  5: GiftScene5,
  6: GiftScene6,
}

function SceneLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )
}

export function GiftPopup({ gift, onClose }: { gift: GiftData; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const age = useLiveAge()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -2
    setMouse({ x, y })
  }, [])

  const colors = [gift.color, '#fcd34d', '#f43f5e', '#a78bfa']

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        exit={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        ref={containerRef}
        className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden border border-white/15"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(10,10,26,0.5) 100%)`,
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full" style={{ background: `radial-gradient(circle, ${gift.color}25, transparent 70%)`, filter: 'blur(30px)' }} />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, #fcd34d15, transparent 70%)`, filter: 'blur(20px)' }} />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <div className="relative h-48 sm:h-56 md:h-64 w-full">
          <Suspense fallback={<SceneLoader />}>
            <Canvas
              camera={{ position: [0, 0, 1.2], fov: 40 }}
              gl={{ antialias: true, alpha: true, toneMapping: 3, toneMappingExposure: 1.2 }}
              onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
              style={{ background: 'transparent' }}
            >
              {Scene && <Scene mouse={mouse} />}
            </Canvas>
          </Suspense>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)',
          }} />
        </div>

        <div className="relative p-5 sm:p-7 text-center">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 bg-white/5 border border-white/10">
              <span className="text-lg">✦</span>
            </div>

            <h2 className="text-lg sm:text-xl font-heading text-white mb-1 tracking-wide">
              On Your {age.years}<sup>th</sup> Birthday
            </h2>

            <p className="text-[10px] text-white/25 font-sans tracking-wider mb-1">
              {age.years}Y · {age.totalMonths}M · {age.totalDays}D
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="w-8 h-px mx-auto my-3 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${gift.color}, transparent)` }} />

            <h3 className="text-xl sm:text-2xl font-heading mb-1.5" style={{ color: gift.color }}>
              {gift.displayTitle}
            </h3>

            <p className="text-xs sm:text-sm text-white/50 font-sans leading-relaxed max-w-xs mx-auto">
              {gift.message}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mt-4"
          >
            {colors.map((c, i) => (
              <motion.span
                key={i}
                className="text-xs"
                style={{ color: c }}
                animate={{ y: [0, -3, 0], opacity: [0.3, 0.7, 0.3] }}
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
