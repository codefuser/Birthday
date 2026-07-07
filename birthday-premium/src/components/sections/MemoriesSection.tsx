import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

function KamCarousel({ images, onSelect }: { images: string[]; onSelect: (src: string) => void }) {
  const n = images.length

  const cardW = 440
  const ba = 360 / n
  const zDist = -(cardW * 0.5 + 8) / Math.tan((ba * 0.5) * Math.PI / 180)

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{
        height: `min(40rem, 65dvh)`,
        perspective: '50em',
        mask: 'linear-gradient(90deg, transparent 5%, black 12% 88%, transparent 95%)',
        WebkitMask: 'linear-gradient(90deg, transparent 5%, black 12% 88%, transparent 95%)',
      }}
    >
      <div className="flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        <div
          className="ring"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'ry 32s linear infinite',
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              onClick={() => onSelect(src)}
              className="absolute cursor-pointer"
              style={{
                width: cardW,
                height: cardW * 5 / 4,
                transform: `rotateY(${i * ba}deg) translateZ(${zDist}px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <div
                className="w-full h-full overflow-hidden bg-black/40"
                style={{ borderRadius: '1.5em' }}
              >
                <img
                  src={src}
                  alt={`Memory ${i + 1}`}
                  className="w-full h-full"
                  style={{ objectFit: 'cover' }}
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
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

      <style>{`
        @keyframes ry { to { rotate: y 1turn } }
      `}</style>
    </SectionWrapper>
  )
}
