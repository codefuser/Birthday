import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

type Size = { radius: number; width: number }

function getSize(): Size {
  const w = window.innerWidth
  if (w < 480) return { radius: 140, width: 170 }
  if (w < 768) return { radius: 180, width: 200 }
  if (w < 1024) return { radius: 320, width: 260 }
  if (w < 1440) return { radius: 480, width: 300 }
  return { radius: 600, width: 330 }
}

function activeIndex(angle: number, n: number): number {
  const step = 360 / n
  let minD = Infinity
  let idx = 0
  for (let i = 0; i < n; i++) {
    let d = ((angle + i * step) % 360 + 360) % 360
    if (d > 180) d = 360 - d
    if (d < minD) { minD = d; idx = i }
  }
  return idx
}

const stylesId = 'memories-carousel-styles'
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(stylesId)) return
  const s = document.createElement('style')
  s.id = stylesId
  s.textContent = `
    @keyframes carousel-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes carousel-float-sm { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
    @keyframes particle-float { 0%{opacity:0;transform:translateY(0) scale(0)} 20%{opacity:0.6} 80%{opacity:0.4} 100%{opacity:0;transform:translateY(-40px) scale(1)} }
    .carousel-scale-float { animation: carousel-float 3.5s ease-in-out infinite; }
    .carousel-scale-float-sm { animation: carousel-float-sm 3.5s ease-in-out infinite; }
  `
  document.head.appendChild(s)
}

export default function MemoriesSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const images = birthdayConfig.photos

  useEffect(() => { injectStyles() }, [])

  if (images.length === 0) {
    return (
      <SectionWrapper className="bg-galaxy" id="memories" transitionType="lightBurst">
        <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
        <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 text-center">A collection of special moments</p>
        <div className="text-center py-20">
          <p className="text-white/20 font-sans text-sm">Add photos to the img folder to create a gallery</p>
        </div>
      </SectionWrapper>
    )
  }
  return (
    <SectionWrapper className="bg-galaxy" id="memories" transitionType="lightBurst">
      <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 text-center">A collection of special moments</p>
      <CircularCarousel images={images} onSelect={setSelectedImage} />
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

function CircularCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const [angle, setAngle] = useState(0)
  const [size, setSize] = useState<Size>(() => getSize())
  const angleRef = useRef(0)
  const targetRef = useRef<number | null>(null)
  const velRef = useRef(0)
  const dragStartRef = useRef(0)
  const dragAngleRef = useRef(0)
  const isDraggingRef = useRef(false)
  const hoveredRef = useRef(false)
  const lastTimeRef = useRef(0)
  const rafRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null!)

  const n = images.length
  const step = 360 / n

  useEffect(() => {
    const onResize = () => setSize(getSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const tick = (time: number) => {
      const dt = lastTimeRef.current === 0 ? 1 : Math.min((time - lastTimeRef.current) / 16.67, 3)
      lastTimeRef.current = time

      let cur = angleRef.current

      if (!isDraggingRef.current) {
        if (targetRef.current !== null) {
          let diff = targetRef.current - cur
          diff = ((diff % 360) + 540) % 360 - 180
          cur += diff * Math.min(0.1 * dt, 1)
          if (Math.abs(diff) < 0.15) {
            cur = targetRef.current
            targetRef.current = null
            velRef.current = 0
          }
        } else {
          if (Math.abs(velRef.current) > 0.001) {
            cur += velRef.current * dt
            velRef.current *= Math.pow(0.92, dt)
          } else {
            velRef.current = 0
            if (!hoveredRef.current) cur += 0.1 * dt
          }
        }
      }

      angleRef.current = cur
      setAngle(cur)
      rafRef.current = requestAnimationFrame(tick)
    }
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const goTo = useCallback((target: number) => {
    targetRef.current = target
  }, [])

  const advance = useCallback((dir: number) => {
    targetRef.current = angleRef.current + dir * step
  }, [step])

  const goToSlide = useCallback((idx: number) => {
    let target = (-idx * step) % 360
    if (target < 0) target += 360
    const cur = ((angleRef.current % 360) + 360) % 360
    let diff = target - cur
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    targetRef.current = angleRef.current + diff
  }, [step])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = e.clientX
    dragAngleRef.current = angleRef.current
    isDraggingRef.current = true
    targetRef.current = null
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current
    angleRef.current = dragAngleRef.current + dx * 0.18
    setAngle(angleRef.current)
  }, [])

  const onPointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      const dx = angleRef.current - dragAngleRef.current
      velRef.current = dx * 0.08
    }
    isDraggingRef.current = false
  }, [])

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
    const dir = e.deltaY > 0 ? 1 : -1
    targetRef.current = angleRef.current + dir * step
  }, [step])

  const idx = activeIndex(angle, n)
  const aIdx = ((idx % n) + n) % n
  const activeEffAngle = ((angle + aIdx * step) % 360 + 360) % 360
  const activeEA180 = activeEffAngle > 180 ? 360 - activeEffAngle : activeEffAngle
  const activeCloseness = Math.max(0, Math.cos((activeEA180 / 180) * Math.PI * 0.5))

  const { radius, width } = size
  const height = width * 1.25

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-none"
      style={{ perspective: '1800px', height: `min(${height + radius * 0.55 + 60}px, 80dvh)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onMouseEnter={() => { hoveredRef.current = true }}
      onMouseLeave={() => { hoveredRef.current = false }}
    >
      <button
        onClick={() => advance(1)}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-xl md:text-2xl"
      >
        ‹
      </button>
      <button
        onClick={() => advance(-1)}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-xl md:text-2xl"
      >
        ›
      </button>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="relative"
          style={{ transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg)` }}
        >
          {images.map((src, i) => {
            const sa = i * step
            const effAngle = ((angle + sa) % 360 + 360) % 360
            const effAngle180 = effAngle > 180 ? 360 - effAngle : effAngle
            const closeness = Math.max(0, Math.cos((effAngle180 / 180) * Math.PI * 0.5))
            const s = 0.55 + 0.45 * closeness
            const op = 0.08 + 0.92 * closeness
            const blur = Math.round((1 - closeness) * 3 * 10) / 10
            const bright = 0.35 + 0.65 * closeness
            const isActive = i === aIdx

            return (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                className="absolute cursor-pointer"
                style={{
                  width,
                  height,
                  transform: `rotateY(${sa}deg) translateZ(${radius}px) rotateY(180deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div style={{ transform: `scale(${s})`, transformOrigin: 'center center' }}>
                  <div className={isActive ? 'carousel-scale-float' : ''}>
                    <div
                      style={{
                        width,
                        height,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: `1px solid rgba(255,255,255,${isActive ? 0.18 : 0.05})`,
                        background: 'rgba(0,0,0,0.4)',
                        boxShadow: isActive
                          ? '0 0 40px rgba(244,63,94,0.15), 0 20px 60px rgba(0,0,0,0.5)'
                          : `0 8px 32px rgba(0,0,0,${0.2 + 0.3 * closeness})`,
                        opacity: op,
                        filter: `brightness(${bright}) blur(${blur}px)`,
                        transition: 'box-shadow 0.6s ease',
                      }}
                    >
                      <img
                        src={src}
                        alt={`Memory ${i + 1}`}
                        className="w-full h-full"
                        style={{ objectFit: 'cover', aspectRatio: '4 / 5' }}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="absolute pointer-events-none"
          style={{
            width: width * 0.8,
            height: height * 0.5,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(244,63,94,${0.03 + 0.05 * activeCloseness}), transparent 70%)`,
            transform: 'translateZ(-10px)',
            transition: 'opacity 0.8s ease',
          }}
        />

        {/* dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === aIdx ? 20 : 5,
                height: 5,
                background: i === aIdx ? 'rgba(244,63,94,0.7)' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/30"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -30 - Math.random() * 40],
              x: [0, (Math.random() - 0.5) * 20],
            }}
            transition={{
              duration: 2.5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
