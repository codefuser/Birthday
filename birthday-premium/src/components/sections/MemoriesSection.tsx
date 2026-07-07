import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

const RAD = Math.PI / 180

function getRadius(): number {
  const w = window.innerWidth
  if (w < 480) return 260
  if (w < 768) return 340
  if (w < 1024) return 440
  return 560
}

function getCardWidth(): number {
  const w = window.innerWidth
  if (w < 480) return Math.min(w * 0.5, 180)
  if (w < 768) return 220
  if (w < 1024) return 260
  return 300
}

export default function MemoriesSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const images = birthdayConfig.photos

  if (images.length === 0) {
    return (
      <SectionWrapper className="bg-galaxy" id="memories" transitionType="lightBurst">
        <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
        <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 text-center">A collection of special moments</p>
        <div className="text-center py-20"><p className="text-white/20 font-sans text-sm">Add photos to the img folder to create a gallery</p></div>
      </SectionWrapper>
    )
  }
  return (
    <SectionWrapper className="bg-galaxy" id="memories" transitionType="lightBurst">
      <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 text-center">A collection of special moments</p>
      <InfiniteRingCarousel images={images} onSelect={setSelectedImage} />
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Enlarged memory"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}

type CardData = { i: number; src: string; off: number; zF: number; cn: number }

function InfiniteRingCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const ringRef = useRef<HTMLDivElement>(null!)
  const [activeIdx, setActiveIdx] = useState(0)
  const [radius, setRadius] = useState(getRadius)
  const [cardW, setCardW] = useState(getCardWidth)
  const [isHovered, setIsHovered] = useState(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragBaseAngle = useRef(0)
  const autoTimer = useRef<number | undefined>(undefined)

  const n = images.length
  const step = 360 / n
  const cardH = cardW * 1.25

  useEffect(() => {
    const onResize = () => { setRadius(getRadius()); setCardW(getCardWidth()) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const rotateTo = useCallback((idx: number, instant = false) => {
    const target = -idx * step
    const el = ringRef.current
    if (!el) return
    if (instant) {
      el.style.transition = 'none'
      el.style.transform = `rotateY(${target}deg)`
      el.style.transition = ''
    } else {
      el.style.transition = `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)`
      el.style.transform = `rotateY(${target}deg)`
    }
  }, [step])

  const goTo = useCallback((idx: number) => {
    const target = ((idx % n) + n) % n
    setActiveIdx(target)
    rotateTo(target)
  }, [n, rotateTo])

  // Auto-rotate: purely CSS-driven for buttery smoothness
  useEffect(() => {
    if (!isHovered && !isDragging.current) {
      autoTimer.current = window.setTimeout(() => goTo(activeIdx + 1), 3500)
    }
    return () => {
      if (autoTimer.current !== undefined) window.clearTimeout(autoTimer.current)
    }
  }, [activeIdx, isHovered, goTo])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    autoTimer.current !== undefined && window.clearTimeout(autoTimer.current)
    dragStartX.current = e.clientX
    const el = ringRef.current
    if (el) {
      const match = el.style.transform.match(/rotateY\(([-\d.]+)deg\)/)
      dragBaseAngle.current = match ? parseFloat(match[1]) : -activeIdx * step
      el.style.transition = 'none'
    }
  }, [activeIdx, step])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStartX.current
    const angleDelta = dx * 0.15
    const el = ringRef.current
    if (el) {
      el.style.transform = `rotateY(${dragBaseAngle.current + angleDelta}deg)`
    }
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = ringRef.current
    if (!el) return
    const match = el.style.transform.match(/rotateY\(([-\d.]+)deg\)/)
    const currentAngle = match ? parseFloat(match[1]) : -activeIdx * step
    const nearestIdx = Math.round(-currentAngle / step)
    const clamped = ((nearestIdx % n) + n) % n
    setActiveIdx(clamped)
    el.style.transition = `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)`
    el.style.transform = `rotateY(${-clamped * step}deg)`
  }, [activeIdx, step, n])

  const advance = useCallback((dir: number) => goTo(activeIdx + dir), [goTo, activeIdx])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') advance(1)
      if (e.key === 'ArrowRight') advance(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    advance(e.deltaY > 0 ? 1 : -1)
  }, [advance])

  const cards: CardData[] = useMemo(() => {
    const list: CardData[] = []
    for (let i = 0; i < n; i++) {
      let off = i - activeIdx
      if (off > n / 2) off -= n
      if (off < -n / 2) off += n
      const zF = Math.cos(off * step * RAD)
      const cn = Math.max(0, (zF + 1) / 2)
      list.push({ i, src: images[i], off, zF, cn })
    }
    return list.sort((a, b) => a.zF - b.zF)
  }, [activeIdx, images, n, step])

  return (
    <div
      className="relative w-full select-none touch-none overflow-hidden"
      style={{ height: `min(${cardH + 100}px, 70dvh)`, perspective: '1400px' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => advance(1)}
        className="absolute left-2 md:left-5 top-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: -cardH * 0.08 }}
      >
        ‹
      </button>
      <button
        onClick={() => advance(-1)}
        className="absolute right-2 md:right-5 top-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: -cardH * 0.08 }}
      >
        ›
      </button>

      <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        <div
          className="absolute pointer-events-none"
          style={{
            width: cardW * 1.4,
            height: cardH * 0.6,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(244,63,94,0.08) 0%, transparent 70%)',
            transform: 'translateZ(-60px)',
          }}
        />

        <div
          ref={ringRef}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-activeIdx * step}deg)`,
            transition: `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {cards.map(c => {
            const ang = c.off * step
            const isActive = c.off === 0
            const sc = 0.55 + 0.45 * c.cn
            const op = Math.max(0.04, 0.06 + 0.94 * c.cn)
            const bl = (1 - c.cn) * 2.5
            const br = 0.25 + 0.75 * c.cn

            return (
              <div
                key={c.i}
                onClick={() => {
                  if (c.off !== 0) goTo(c.i)
                  else onSelect(c.src)
                }}
                className="absolute cursor-pointer"
                style={{
                  width: cardW,
                  height: cardH,
                  transform: `rotateY(${ang}deg) translateZ(${radius}px) rotateY(180deg)`,
                  transformStyle: 'preserve-3d',
                  transition: 'none',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: `1px solid rgba(255,255,255,${isActive ? 0.18 : 0.035})`,
                    background: 'rgba(0,0,0,0.35)',
                    boxShadow: isActive
                      ? '0 0 50px rgba(244,63,94,0.15), 0 20px 60px rgba(0,0,0,0.5)'
                      : `0 8px 28px rgba(0,0,0,${0.15 + 0.3 * c.cn})`,
                    opacity: op,
                    filter: `brightness(${br}) blur(${Math.round(bl * 10) / 10}px)`,
                    transform: `scale(${sc})`,
                    transition: `opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), filter 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease`,
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
                        zIndex: 2,
                      }}
                    />
                  )}
                  <div
                    className="w-full h-full"
                    style={isActive ? { animation: 'mem-float 3.8s ease-in-out infinite' } : undefined}
                  >
                    <img
                      src={c.src}
                      alt={`Memory ${c.i + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: 'cover', aspectRatio: '4 / 5' }}
                      draggable={false}
                    />
                  </div>
                  {isActive && (
                    <>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)', zIndex: 2 }} />
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'clamp(10px, 1.2vw, 12px)',
                          color: 'rgba(255,255,255,0.45)',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {c.i + 1} / {n}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === activeIdx ? 18 : 4,
              height: 4,
              background: i === activeIdx ? 'rgba(244,63,94,0.7)' : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: i % 2 === 0 ? 2.5 : 1.5,
              height: i % 2 === 0 ? 2.5 : 1.5,
            }}
            animate={{ opacity: [0, 0.4, 0], y: [0, -12 - Math.random() * 20], x: [0, (Math.random() - 0.5) * 10] }}
            transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <style>{`
        @keyframes mem-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}