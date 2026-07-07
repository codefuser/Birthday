import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

function Card({ src, onSelect }: { src: string; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="relative flex-none cursor-pointer overflow-hidden rounded-3xl bg-black/30"
      style={{
        width: 320,
        height: 400,
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        transition: '0.4s',
      }}
    >
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          padding: 2,
          borderRadius: 24,
          background: 'conic-gradient(#60a5fa, #c084fc, #22d3ee, #60a5fa)',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      <img
        src={src}
        alt=""
        className="w-full h-full"
        style={{ objectFit: 'cover', animation: 'card-zoom 14s ease-in-out infinite alternate' }}
        draggable={false}
      />
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)',
          transform: 'translateX(-150%) skewX(-20deg)',
          transition: '1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(180%) skewX(-20deg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(-150%) skewX(-20deg)' }}
      />
      <div
        className="absolute left-4 right-4 bottom-4 z-30"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          padding: 18,
          borderRadius: 18,
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: '#d590f5', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          Memory
        </h3>
        <small className="text-xs text-white/60 block mt-0.5" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.8)' }}>
          Pure CSS animation
        </small>
      </div>
    </div>
  )
}

function HorizontalMarquee({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const setWidth = useMemo(() => images.length * 344, [images.length])
  const items = useMemo(() => [...images, ...images], [images])

  return (
    <div className="slider relative overflow-hidden mt-8" style={{ marginTop: '4rem' }}>
      <div
        className="absolute top-0 left-0 w-30 h-full z-10 pointer-events-none"
        style={{ width: 120, background: 'linear-gradient(to right, #090b16, transparent)' }}
      />
      <div
        className="absolute top-0 right-0 w-30 h-full z-10 pointer-events-none"
        style={{ width: 120, background: 'linear-gradient(to left, #090b16, transparent)' }}
      />

      <div
        className="track flex gap-6"
        style={{
          width: 'max-content',
          animation: `scroll-${setWidth} 30s linear infinite`,
        }}
      >
        {items.map((src, i) => (
          <Card key={i} src={src} onSelect={() => onSelect(src)} />
        ))}
      </div>

      <style>{`
        @keyframes scroll-${setWidth} {
          to { transform: translateX(-${setWidth}px); }
        }
        .slider:hover .track {
          animation-play-state: paused;
        }
        @keyframes card-zoom {
          to { transform: scale(1.18); }
        }
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
    <SectionWrapper className="bg-galaxy py-12 md:py-20 overflow-x-hidden" id="memories" transitionType="lightBurst">
      <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,26,0.6) 75%, #0a0a1a 100%)' }} />

      <AnimatedText text="Photo Memories" className="text-3xl md:text-5xl font-heading text-rose-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-10 text-center">A collection of special moments</p>

      <HorizontalMarquee images={images} onSelect={setSelectedImage} />

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
