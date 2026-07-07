import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { soundManager } from '../../lib/sound'

const wishes = [
  { id: 0, text: 'May every dream you chase become your reality.', color: '#fcd34d' },
  { id: 1, text: 'May your smile shine brighter every single day.', color: '#818cf8' },
  { id: 2, text: 'Wishing you endless happiness and peace.', color: '#fbbf24' },
  { id: 3, text: 'May God bless every step of your journey.', color: '#a78bfa' },
  { id: 4, text: 'Stay strong, stay kind, stay wonderful.', color: '#fcd34d' },
  { id: 5, text: 'May this year bring beautiful surprises.', color: '#60a5fa' },
  { id: 6, text: 'Keep believing \u2014 your best days are ahead.', color: '#fbbf24' },
  { id: 7, text: 'Your future is filled with hope and joy.', color: '#a78bfa' },
  { id: 8, text: 'May love surround you wherever you go.', color: '#818cf8' },
  { id: 9, text: 'Shine like the brightest star in the sky.', color: '#fcd34d' },
  { id: 10, text: 'Never stop dreaming big.', color: '#fbbf24' },
  { id: 11, text: 'Happy Birthday! May all your wishes come true.', color: '#a78bfa' },
]

interface StarDef {
  id: number
  x: number
  y: number
  size: number
  pulse: number
}

const stars: StarDef[] = [
  { id: 0, x: 18, y: 22, size: 3, pulse: 2.4 },
  { id: 1, x: 32, y: 14, size: 2, pulse: 1.8 },
  { id: 2, x: 48, y: 10, size: 1, pulse: 3.0 },
  { id: 3, x: 64, y: 16, size: 3, pulse: 2.0 },
  { id: 4, x: 80, y: 26, size: 2, pulse: 2.6 },
  { id: 5, x: 16, y: 48, size: 1, pulse: 1.5 },
  { id: 6, x: 38, y: 44, size: 3, pulse: 2.2 },
  { id: 7, x: 58, y: 48, size: 2, pulse: 1.9 },
  { id: 8, x: 82, y: 50, size: 1, pulse: 2.8 },
  { id: 9, x: 22, y: 72, size: 2, pulse: 2.1 },
  { id: 10, x: 48, y: 82, size: 3, pulse: 1.7 },
  { id: 11, x: 74, y: 70, size: 1, pulse: 2.5 },
]

const edges: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [3, 8],
  [4, 8], [5, 6], [6, 7], [7, 8], [5, 9], [6, 9], [6, 10], [7, 10],
  [8, 11], [9, 10], [10, 11],
]

const STAR_PATH = 'M0-10L2.36-3.09 9.51-3.09 3.78 1.18 5.88 8.09 0 3.82-5.88 8.09-3.78 1.18-9.51-3.09-2.36-3.09Z'

function useMousePos() {
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    if (isTouch) return
    const handler = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [isTouch])
  return pos
}

function playShimmer() {
  try {
    const ctx = soundManager.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 3000 + Math.random() * 3000
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.03, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch { }
}

function playStarChime() {
  try {
    const ctx = soundManager.getContext()
    if (!ctx) return
    const notes = [880, 1108.73, 1318.51, 1760]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.08, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.start(t)
      osc.stop(t + 0.6)
    })
  } catch { }
}

const bgStars = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: 0.5 + Math.random() * 1.5,
  d: Math.random() * 5,
  t: 1.5 + Math.random() * 3,
}))

const nebulaLayers = [
  { x: 20, y: 30, s: 300, c: '#818cf8', d: 12 },
  { x: 75, y: 60, s: 250, c: '#a78bfa', d: 8 },
  { x: 50, y: 20, s: 200, c: '#fbbf24', d: 15 },
  { x: 30, y: 70, s: 180, c: '#60a5fa', d: 10 },
]

function generateShootingStar() {
  return {
    id: Date.now() + Math.random(),
    x: Math.random() * 60 + 10,
    y: Math.random() * 30 + 5,
    angle: 20 + Math.random() * 20,
    duration: 1.2 + Math.random() * 0.8,
    delay: Math.random() * 3,
  }
}

function StarGlow({ color, size }: { color: string; size: number }) {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <radialGradient id={`glow-${color.replace('#', '')}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function WishSection() {
  const mouse = useMousePos()
  const containerRef = useRef<HTMLDivElement>(null)
  const [openedStars, setOpenedStars] = useState<Set<number>>(new Set())
  const [activeWish, setActiveWish] = useState<typeof wishes[0] | null>(null)
  const [burstId, setBurstId] = useState(0)
  const [shootingStars, setShootingStars] = useState<ReturnType<typeof generateShootingStar>[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    const spawn = () => {
      const star = generateShootingStar()
      setShootingStars(prev => [...prev.slice(-3), star])
      setTimeout(() => setShootingStars(prev => prev.filter(s => s.id !== star.id)), (star.duration + star.delay) * 1000 + 200)
    }
    spawn()
    const interval = setInterval(spawn, 2500 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = useCallback((star: StarDef) => {
    if (openedStars.has(star.id)) return
    setOpenedStars(prev => new Set(prev).add(star.id))
    setBurstId(prev => prev + 1)
    playStarChime()
    soundManager.playSparkle()
    setTimeout(() => setActiveWish(wishes[star.id]), 300)
  }, [openedStars])

  const handleClose = useCallback(() => setActiveWish(null), [])

  const openedCount = openedStars.size
  const allOpened = openedCount === stars.length

  return (
    <SectionWrapper className="bg-night-sky relative overflow-hidden" id="wishes" transitionType="portal">
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {nebulaLayers.map((n, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              width: n.s, height: n.s,
              background: `radial-gradient(circle, ${n.c}20, ${n.c}08, transparent)`,
              filter: 'blur(15px)',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: [mouse.x * n.d * -0.5, mouse.x * n.d * 0.5],
              y: [mouse.y * n.d * -0.5, mouse.y * n.d * 0.5],
            }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        ))}

        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.06) 0%, transparent 60%)' }} />

        {bgStars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.s, height: s.s,
              opacity: 0.3 + Math.random() * 0.4,
              animation: `twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: mouse.x * 8, y: mouse.y * 8 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div className="absolute top-[6%] right-[10%] md:right-[14%]">
          <div className="relative w-16 h-16 md:w-24 md:h-24">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,220,150,0.25) 0%, transparent 70%)',
                filter: 'blur(5px)',
                transform: 'scale(2.2)',
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-50 shadow-lg" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 58% 45%, transparent 38%, #0a0a1a 40%)',
              }}
            />
            <div className="absolute w-2 h-2 rounded-full bg-amber-200/50" style={{ top: '30%', left: '35%' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-200/40" style={{ top: '50%', left: '45%' }} />
            <div className="absolute w-1 h-1 rounded-full bg-amber-200/30" style={{ top: '38%', left: '55%' }} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {shootingStars.map(s => (
          <motion.div
            key={s.id}
            className="absolute top-0 left-0 pointer-events-none z-10"
            initial={{ x: `${s.x}vw`, y: `${s.y}vh`, opacity: 1 }}
            animate={{
              x: [`${s.x}vw`, `${s.x + 50}vw`],
              y: [`${s.y}vh`, `${s.y + 50 * Math.tan(s.angle * Math.PI / 180)}vh`],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: s.duration, delay: s.delay, ease: 'easeOut' }}
          >
            <svg width="80" height="2" viewBox="0 0 80 2" className="md:w-32">
              <defs>
                <linearGradient id={`ss-${s.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="60%" stopColor="#fcd34d" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="1" />
                </linearGradient>
              </defs>
              <rect width="80" height="1.5" rx="0.75" fill={`url(#ss-${s.id})`} />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        <AnimatedText text="Wishing Stars" className="text-3xl md:text-5xl font-heading text-blue-200 mb-3 text-center" />
        <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-2 text-center">
          {allOpened ? 'Every wish has been revealed' : `Tap a star \u2014 ${openedCount} of ${stars.length} revealed`}
        </p>

        <div className="relative w-full h-[420px] md:h-[520px] max-w-4xl mx-auto">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(1.5px)' }}>
            {edges.map(([i, j]) => {
              const a = stars[i]
              const b = stars[j]
              return (
                <line
                  key={`${i}-${j}`}
                  x1={`${a.x}%`} y1={`${a.y}%`}
                  x2={`${b.x}%`} y2={`${b.y}%`}
                  stroke="#818cf8"
                  strokeWidth="0.5"
                  opacity="0.15"
                  strokeDasharray="4 3"
                />
              )
            })}
          </svg>

          <AnimatePresence>
            {burstId > 0 && (
              <motion.div
                key={burstId}
                className="absolute inset-0 pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Array.from({ length: 20 }, (_, i) => {
                  const angle = (i / 20) * Math.PI * 2
                  const dist = 120 + Math.random() * 200
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 md:w-3 md:h-3"
                      style={{
                        left: '50%', top: '50%', color: '#fcd34d',
                      }}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        scale: [1.5, 0],
                        opacity: [1, 0],
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      <svg viewBox="-12 -12 24 24" className="w-full h-full">
                        <path d="M0-8L2-3 7-3 3 0 5 6 0 3-5 6-3 0-7-3-2-3Z" fill="currentColor" />
                      </svg>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {stars.map((star, i) => {
            const wish = wishes[i]
            const isOpened = openedStars.has(star.id)
            const isHovered = hoveredId === star.id
            const sizePx = star.size === 3 ? 32 : star.size === 2 ? 24 : 18
            const glowSize = star.size === 3 ? 80 : star.size === 2 ? 60 : 45
            const bright = isOpened ? 0.3 : 1

            return (
              <motion.button
                key={star.id}
                className="absolute cursor-pointer bg-transparent border-none outline-none z-10"
                style={{ left: `${star.x}%`, top: `${star.y}%`, transform: 'translate(-50%, -50%)' }}
                whileHover={!isOpened ? { scale: 1.25 } : {}}
                onClick={() => handleClick(star)}
                onMouseEnter={() => { if (!isOpened) { setHoveredId(star.id); playShimmer(); soundManager.playSparkle() } }}
                onMouseLeave={() => setHoveredId(null)}
                disabled={isOpened}
              >
                {isOpened ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center"
                    style={{ width: sizePx, height: sizePx }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white/20">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                    </svg>
                  </motion.div>
                ) : (
                  <>
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: glowSize, height: glowSize,
                        left: '50%', top: '50%',
                        transform: `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1})`,
                        background: `radial-gradient(circle, ${wish.color}50, ${wish.color}15, transparent)`,
                        filter: 'blur(6px)',
                        transition: 'transform 0.4s ease-out',
                      }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1 + 0.06 * star.size, 1],
                        opacity: [bright * 0.6, bright, bright * 0.6],
                      }}
                      transition={{ duration: star.pulse, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <svg
                        viewBox="-12 -12 24 24"
                        className="block"
                        style={{
                          width: sizePx, height: sizePx,
                          filter: isHovered ? `drop-shadow(0 0 6px ${wish.color})` : 'none',
                          transition: 'filter 0.3s ease-out',
                        }}
                      >
                        <path d={STAR_PATH} fill={wish.color} opacity={bright} />
                      </svg>
                    </motion.div>
                  </>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <div className="flex justify-center gap-2">
          {stars.map((s, i) => (
            <div
              key={s.id}
              className="w-1 h-1 rounded-full transition-all duration-500"
              style={{
                background: openedStars.has(s.id) ? wishes[i].color : 'rgba(255,255,255,0.1)',
                transform: openedStars.has(s.id) ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeWish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
            onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.85, opacity: 0, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 16, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/15"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${activeWish.color}25, transparent 70%)`,
                  filter: 'blur(10px)',
                }}
              />

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>

              <div className="relative p-8 md:p-10 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center mb-6"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <svg viewBox="-16 -16 32 32" className="w-16 h-16 md:w-20 md:h-20" style={{ color: activeWish.color }}>
                      <path d={STAR_PATH} fill="currentColor" />
                    </svg>
                  </motion.div>

                  <div className="w-16 h-px mx-auto mb-5 rounded-full" style={{
                    background: `linear-gradient(90deg, transparent, ${activeWish.color}60, transparent)`,
                  }} />

                  <p className="text-base md:text-lg text-white/85 font-sans leading-relaxed">
                    {activeWish.text}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-3 mt-6"
                >
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="text-xs"
                      style={{ color: activeWish.color }}
                      animate={{ y: [0, -5, 0], opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    >
                      ✦
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
