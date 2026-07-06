import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

function CoverFlowCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const [current, setCurrent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragStart = useRef(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (isDragging || isHovering) return
    const interval = setInterval(() => setCurrent(c => c + 1), 3500)
    return () => clearInterval(interval)
  }, [isDragging, isHovering])

  const goTo = (i: number) => setCurrent(i)
  const next = () => goTo(current + 1)
  const prev = () => goTo(current - 1)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current])

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStart.current = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    const diff = e.clientX - dragStart.current
    if (Math.abs(diff) > 50) diff > 0 ? prev() : next()
    setIsDragging(false)
  }

  const cw = isDesktop ? 300 : 240
  const ch = isDesktop ? 560 : 440

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{ perspective: '1400px', height: `min(${ch + 140}px, 80dvh)` }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setIsDragging(false)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={prev}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 text-xl md:text-2xl"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 text-xl md:text-2xl"
      >
        ›
      </button>

      <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        {images.map((src, i) => {
          const n = images.length
          const cd = ((current % n) + n) % n
          let offset = i - cd
          if (offset > n / 2) offset -= n
          if (offset < -n / 2) offset += n
          const abs = Math.abs(offset)

          const x = offset * cw * 0.55
          const z = -abs * 100
          const rY = offset * -30
          const s = 1 - abs * 0.12
          const o = abs > 3 ? 0 : offset === 0 ? 1 : Math.max(0.15, 1 - abs * 0.35)

          return (
            <div
              key={i}
              onClick={() => onSelect(src)}
              className="absolute cursor-pointer transition-all duration-500 ease-out will-change-transform"
              style={{
                width: cw,
                height: ch,
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rY}deg) scale(${Math.max(s, 0.4)})`,
                opacity: o,
                zIndex: 1000 - abs,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.07] bg-black/40 shadow-2xl">
                <img
                  src={src}
                  alt={`Memory ${i + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                  loading={abs < 3 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MemoriesSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const images = birthdayConfig.photos

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

      {images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 font-sans text-sm">Add photos to the img folder to create a gallery</p>
        </div>
      ) : (
        <CoverFlowCarousel images={images} onSelect={setSelectedImage} />
      )}

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
