import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

function KamCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const n = images.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragBaseAngle = useRef(0)
  const ringRef = useRef<HTMLDivElement>(null!)
  const autoTimer = useRef<number | undefined>(undefined)

  const step = 360 / n
  const cardW = 260
  const cardH = cardW * 10 / 7

  const rotateTo = useCallback((idx: number, instant = false) => {
    const target = -idx * step
    if (ringRef.current) {
      ringRef.current.style.transition = instant ? 'none' : 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)'
      ringRef.current.style.transform = `rotateY(${target}deg)`
    }
  }, [step])

  const goTo = useCallback((idx: number) => {
    const target = ((idx % n) + n) % n
    setActiveIdx(target)
    rotateTo(target)
  }, [n, rotateTo])

  useEffect(() => {
    if (!isHovered && !isDragging.current) {
      autoTimer.current = window.setTimeout(() => goTo(activeIdx + 1), 3500)
    }
    return () => { if (autoTimer.current !== undefined) window.clearTimeout(autoTimer.current) }
  }, [activeIdx, isHovered, goTo])

  const advance = useCallback((dir: number) => goTo(activeIdx + dir), [goTo, activeIdx])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') advance(1)
      if (e.key === 'ArrowRight') advance(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    if (autoTimer.current !== undefined) window.clearTimeout(autoTimer.current)
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
    const el = ringRef.current
    if (el) {
      el.style.transform = `rotateY(${dragBaseAngle.current + dx * 0.15}deg)`
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
    el.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = `rotateY(${-clamped * step}deg)`
  }, [activeIdx, step, n])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    advance(e.deltaY > 0 ? 1 : -1)
  }, [advance])

  const ba = 360 / n

  return (
    <div
      className="relative w-full select-none touch-none overflow-hidden"
      style={{
        height: `min(${cardH + 120}px, 75dvh)`,
        perspective: '35em',
        mask: 'linear-gradient(90deg, transparent, black 20% 80%, transparent)',
        WebkitMask: 'linear-gradient(90deg, transparent, black 20% 80%, transparent)',
      }}
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
          ref={ringRef}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-activeIdx * step}deg)`,
            transition: `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {images.map((src, i) => {
            let off = i - activeIdx
            if (off > n / 2) off -= n
            if (off < -n / 2) off += n
            const isActive = off === 0
            const abs = Math.abs(off)
            const zDist = -(cardW * 0.5 + 8) / Math.tan((ba * 0.5) * Math.PI / 180)

            return (
              <div
                key={i}
                onClick={() => {
                  if (off !== 0) goTo(i)
                  else onSelect(src)
                }}
                className="absolute cursor-pointer"
                style={{
                  width: cardW,
                  height: cardH,
                  transform: `rotateY(${off * ba}deg) translateZ(${zDist}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '1.5em',
                    overflow: 'hidden',
                    border: `1px solid rgba(255,255,255,${isActive ? 0.18 : 0.035})`,
                    background: 'rgba(0,0,0,0.35)',
                    boxShadow: isActive
                      ? '0 0 50px rgba(244,63,94,0.15), 0 20px 60px rgba(0,0,0,0.5)'
                      : `0 2em 2em -1em rgba(0,0,0,0.3)`,
                    transition: 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), filter 0.85s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease',
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
                  <div className="w-full h-full" style={isActive ? { animation: 'kam-float 3.8s ease-in-out infinite' } : undefined}>
                    <img
                      src={src}
                      alt={`Memory ${i + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: 'cover' }}
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
                        {i + 1} / {n}
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

      <style>{`
        @keyframes kam-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
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
      <div className="absolute inset-0 opacity-5">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 text-center">A collection of special moments</p>

      <KamCarousel images={images} onSelect={setSelectedImage} />

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
