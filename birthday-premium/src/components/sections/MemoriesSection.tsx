import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

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
      <FilmstripCarousel images={images} onSelect={setSelectedImage} />
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

function FilmstripCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null!)
  const thumbRef = useRef<HTMLDivElement>(null!)
  const [idx, setIdx] = useState(0)
  const isDraggingRef = useRef(false)
  const isScrollingRef = useRef(false)
  const dragStart = useRef(0)
  const scrollStart = useRef(0)

  const goTo = useCallback((i: number) => {
    const n = images.length
    const target = ((i % n) + n) % n
    setIdx(target)
    const slide = scrollRef.current?.children[target] as HTMLElement
    if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [images.length])

  const advance = useCallback((dir: number) => goTo(idx + dir), [goTo, idx])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true
    isScrollingRef.current = false
    dragStart.current = e.clientX
    scrollStart.current = scrollRef.current.scrollLeft
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStart.current
    if (Math.abs(dx) > 5) isScrollingRef.current = true
    scrollRef.current.scrollLeft = scrollStart.current - dx
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isScrollingRef.current) {
      const i = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth)
      goTo(i)
    } else {
      const slides = scrollRef.current.children
      let closest = 0
      let minDist = Infinity
      for (let i = 0; i < slides.length; i++) {
        const el = slides[i] as HTMLElement
        const rect = el.getBoundingClientRect()
        const parentRect = scrollRef.current.getBoundingClientRect()
        const dist = Math.abs(rect.left + rect.width / 2 - parentRect.left - parentRect.width / 2)
        if (dist < minDist) { minDist = dist; closest = i }
      }
      setIdx(closest)
    }
    isDraggingRef.current = false
  }, [goTo])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') advance(1)
      if (e.key === 'ArrowRight') advance(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const slides = el.children
          let closest = 0
          let minDist = Infinity
          for (let i = 0; i < slides.length; i++) {
            const s = slides[i] as HTMLElement
            const r = s.getBoundingClientRect()
            const pr = el.getBoundingClientRect()
            const d = Math.abs(r.left + r.width / 2 - pr.left - pr.width / 2)
            if (d < minDist) { minDist = d; closest = i }
          }
          setIdx(closest)
          ticking = false
        })
        ticking = true
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const n = images.length
  const thumbW = 56

  return (
    <div className="relative w-full select-none">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {images.map((src, i) => {
          const isActive = i === idx
          return (
            <div
              key={i}
              className="snap-center shrink-0 flex items-center justify-center"
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'center',
              }}
            >
              <div
                onClick={() => { if (!isScrollingRef.current) onSelect(src) }}
                className="relative cursor-pointer"
                style={{
                  width: 'min(320px, 60vw)',
                  aspectRatio: '4 / 5',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isActive
                    ? '0 0 60px rgba(244,63,94,0.15), 0 30px 80px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
                  transform: isActive ? 'scale(1)' : 'scale(0.88)',
                  filter: isActive ? 'brightness(1)' : 'brightness(0.5) blur(1px)',
                  transitionProperty: 'transform, filter, box-shadow, border-color',
                  transitionDuration: '0.5s',
                  transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <img
                  src={src}
                  alt={`Memory ${i + 1}`}
                  className="w-full h-full"
                  style={{ objectFit: 'cover', aspectRatio: '4 / 5' }}
                  draggable={false}
                />
                {isActive && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)',
                    }}
                  />
                )}
                {isActive && (
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(10px, 1.2vw, 12px)',
                      color: 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {i + 1} / {n}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => advance(1)}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: '-5%' }}
      >
        ‹
      </button>
      <button
        onClick={() => advance(-1)}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition-all duration-300 text-lg md:text-xl"
        style={{ marginTop: '-5%' }}
      >
        ›
      </button>

      <div className="flex justify-center gap-1.5 mt-6" ref={thumbRef}>
        {images.map((src, i) => {
          const isActive = i === idx
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="overflow-hidden rounded-md transition-all duration-500"
              style={{
                width: isActive ? thumbW + 8 : thumbW,
                height: isActive ? thumbW * 1.25 + 8 : thumbW * 1.25,
                opacity: isActive ? 1 : 0.35,
                border: isActive ? '2px solid rgba(244,63,94,0.5)' : '2px solid transparent',
                filter: isActive ? 'brightness(1)' : 'brightness(0.5)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full"
                style={{ objectFit: 'cover' }}
                draggable={false}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
