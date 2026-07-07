import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

type Sizes = { cw: number; aw: number; ow: number; maxV: number }

function getSizes(): Sizes {
  const w = window.innerWidth
  if (w < 480) return { cw: Math.min(w * 0.75, 200), aw: 80, ow: 0, maxV: 1 }
  if (w < 768) return { cw: Math.min(w * 0.5, 250), aw: 140, ow: 0, maxV: 1 }
  if (w < 1024) return { cw: 270, aw: 210, ow: 0, maxV: 1 }
  return { cw: 320, aw: 250, ow: 180, maxV: 2 }
}

function getPos(offset: number, s: Sizes): number {
  if (offset === 0 || !s.aw) return 0
  const absO = Math.abs(offset)
  let p = s.cw / 2 + s.aw / 2 - Math.min(s.cw * 0.22, 65)
  if (absO === 1) return offset > 0 ? p : -p
  if (!s.ow) return offset > 0 ? p : -p
  p = p + s.aw / 2 + s.ow / 2 - Math.min(s.aw * 0.18, 45)
  return offset > 0 ? p : -p
}

const CUBIC = 'cubic-bezier(0.22, 1, 0.36, 1)'

export default function MemoriesSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const images = birthdayConfig.photos

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
      <StackCarousel images={images} onSelect={setSelectedImage} />
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

function StackCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const [pos, setPos] = useState(0)
  const [sizes, setSizes] = useState<Sizes>(getSizes)
  const posRef = useRef(0)
  const targetRef = useRef<number | null>(null)
  const velRef = useRef(0)
  const dragStartRef = useRef(0)
  const dragPosRef = useRef(0)
  const isDraggingRef = useRef(false)
  const hoveredRef = useRef(false)
  const lastTimeRef = useRef(0)
  const rafRef = useRef(0)

  const n = images.length

  const dimensions = useMemo(() => {
    const s = sizes
    return { w: s.cw, h: s.cw * 1.25, zI: 10 }
  }, [sizes])

  useEffect(() => {
    const onResize = () => setSizes(getSizes())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const tick = (time: number) => {
      const dt = lastTimeRef.current === 0 ? 1 : Math.min((time - lastTimeRef.current) / 16.67, 3)
      lastTimeRef.current = time
      let cur = posRef.current

      if (!isDraggingRef.current) {
        if (targetRef.current !== null) {
          let diff = targetRef.current - cur
          cur += diff * Math.min(0.07 * dt, 1)
          if (Math.abs(diff) < 0.005) {
            cur = targetRef.current
            targetRef.current = null
            velRef.current = 0
          }
        } else {
          if (Math.abs(velRef.current) > 0.0005) {
            cur += velRef.current * dt
            velRef.current *= Math.pow(0.88, dt)
          } else {
            velRef.current = 0
            if (!hoveredRef.current) cur += 0.005 * dt
          }
        }
      }

      posRef.current = cur
      setPos(cur)
      rafRef.current = requestAnimationFrame(tick)
    }
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const aIdx = ((Math.round(pos) % n) + n) % n

  const advance = useCallback((dir: number) => {
    targetRef.current = posRef.current + dir
  }, [])

  const goToSlide = useCallback((idx: number) => {
    let diff = idx - posRef.current
    if (diff > n / 2) diff -= n
    if (diff < -n / 2) diff += n
    targetRef.current = posRef.current + diff
  }, [n])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = e.clientX
    dragPosRef.current = posRef.current
    isDraggingRef.current = true
    targetRef.current = null
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current
    const sensitivity = sizes.maxV === 2 ? 0.004 : 0.006
    posRef.current = dragPosRef.current + dx * sensitivity
    setPos(posRef.current)
  }, [sizes.maxV])

  const onPointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      velRef.current = (posRef.current - dragPosRef.current) * 0.04
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
    targetRef.current = posRef.current + (e.deltaY > 0 ? 1 : -1)
  }, [])

  const slides: { offset: number; src: string; i: number }[] = []
  for (let i = 0; i < n; i++) {
    let offset = i - pos
    if (offset > n / 2) offset -= n
    if (offset < -n / 2) offset += n
    if (Math.abs(offset) <= sizes.maxV + 1) {
      slides.push({ offset, src: images[i], i })
    }
  }
  slides.sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))

  const h = dimensions.h

  return (
    <div
      className="relative w-full select-none touch-none overflow-hidden"
      style={{ height: `min(${h + 80}px, 75dvh)` }}
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
        className="absolute left-2 md:left-5 top-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: `-${h * 0.05}px` }}
      >
        ‹
      </button>
      <button
        onClick={() => advance(-1)}
        className="absolute right-2 md:right-5 top-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: `-${h * 0.05}px` }}
      >
        ›
      </button>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center" style={{ width: 0, height: 0 }}>
          <div
            className="absolute pointer-events-none"
            style={{
              width: sizes.cw * 1.5,
              height: h * 0.7,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, rgba(244,63,94,0.07) 0%, transparent 70%)`,
              transform: 'translateY(-10%)',
            }}
          />

          {slides.map(s => {
            const o = s.offset
            const absO = Math.abs(o)
            const isCenter = absO < 0.5
            const isAdj = absO >= 0.5 && absO < 1.5
            const isOuter = absO >= 1.5

            const cardW = isCenter ? sizes.cw : isAdj && sizes.aw ? sizes.aw : sizes.ow || sizes.aw * 0.6
            const cardH = cardW * 1.25

            const closeness = Math.max(0, 1 - absO / (sizes.maxV + 1))
            const sc = 0.55 + 0.45 * closeness
            const op = Math.max(0.05, 0.08 + 0.92 * closeness)
            const bl = (1 - closeness) * 2.2
            const br = 0.25 + 0.75 * closeness
            const x = getPos(Math.round(o), sizes)
            const zI = 100 - absO * 10

            const isActive = Math.round(o) === 0 && absO < 0.5

            return (
              <div
                key={s.i}
                onClick={() => {
                  if (absO > 0.5) goToSlide(s.i)
                  else onSelect(s.src)
                }}
                className={`absolute cursor-pointer ${isActive ? 'active-card' : ''}`}
                style={{
                  width: cardW,
                  height: cardH,
                  transform: `translateX(${x}px) scale(${sc})`,
                  opacity: op,
                  zIndex: zI,
                  transition: `transform 0.7s ${CUBIC}, opacity 0.5s ease, filter 0.5s ease`,
                  filter: `brightness(${br}) blur(${Math.round(bl * 10) / 10}px)`,
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    borderRadius: '22px',
                    border: `1px solid rgba(255,255,255,${isActive ? 0.18 : 0.04})`,
                    boxShadow: isActive
                      ? '0 0 50px rgba(244,63,94,0.18), 0 25px 80px rgba(0,0,0,0.55)'
                      : `0 8px 32px rgba(0,0,0,${0.12 + 0.3 * closeness})`,
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                        zIndex: 2,
                      }}
                    />
                  )}
                  <div
                    className="w-full h-full"
                    style={
                      isActive
                        ? { animation: 'carousel-float 3.8s ease-in-out infinite' }
                        : undefined
                    }
                  >
                    <img
                      src={s.src}
                      alt={`Memory ${s.i + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: 'cover', aspectRatio: '4 / 5' }}
                      draggable={false}
                    />
                  </div>

                  {isActive && (
                    <>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.6) 100%)', zIndex: 2 }} />
                      <div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'clamp(10px, 1.2vw, 13px)',
                          color: 'rgba(255,255,255,0.5)',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.i + 1} / {n}
                      </div>

                      <div
                        className="shine absolute inset-0 pointer-events-none z-10"
                        style={{
                          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                          transform: 'translateX(-120%) skewX(-15deg)',
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === aIdx ? 18 : 4,
              height: 4,
              background: i === aIdx ? 'rgba(244,63,94,0.7)' : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: i % 3 === 0 ? 3 : 1.5, height: i % 3 === 0 ? 3 : 1.5 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: [0, -15 - Math.random() * 25],
              x: [0, (Math.random() - 0.5) * 12],
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

      <style>{`
        @keyframes carousel-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .active-card { transition: transform 0.5s ease, box-shadow 0.5s ease !important; }
        .active-card:hover { transform: scale(1.03) translateY(-4px) !important; box-shadow: 0 0 70px rgba(244,63,94,0.3), 0 30px 90px rgba(0,0,0,0.6) !important; }
        @keyframes shine-sweep { 0%{transform:translateX(-120%) skewX(-15deg)} 100%{transform:translateX(250%) skewX(-15deg)} }
        .active-card:hover .shine { animation: shine-sweep 0.7s ease-in-out forwards; }
      `}</style>
    </div>
  )
}
