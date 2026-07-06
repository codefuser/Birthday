import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Autoplay, Pagination, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'
import { birthdayConfig } from '../../config/birthday'
import { CrownIcon, FlowerIcon, ButterflyIcon } from '../ui/PremiumIcons'

type GalleryMode = 'coverflow' | 'polaroid' | 'masonry' | 'cards3d' | 'stack' | 'glass' | 'timeline'

const galleryModes: { mode: GalleryMode; label: string; icon: string }[] = [
  { mode: 'coverflow', label: 'Cover Flow', icon: 'M' },
  { mode: 'polaroid', label: 'Polaroids', icon: 'P' },
  { mode: 'masonry', label: 'Masonry', icon: 'W' },
  { mode: 'cards3d', label: '3D Cards', icon: '3' },
  { mode: 'stack', label: 'Stack', icon: 'S' },
  { mode: 'glass', label: 'Glass', icon: 'G' },
  { mode: 'timeline', label: 'Timeline', icon: 'T' },
]

function PolaroidCard({ src, index, onClick }: { src: string; index: number; onClick: () => void }) {
  const rotation = (Math.random() - 0.5) * 12
  const offsetX = (Math.random() - 0.5) * 30
  const offsetY = (Math.random() - 0.5) * 20

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 80 }}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 50 }}
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{ left: `calc(50% + ${offsetX}px)`, top: `calc(50% + ${offsetY}px)` }}
    >
      <div className="bg-white/10 backdrop-blur-sm p-3 pb-8 rounded-sm shadow-xl border border-white/10">
        <img
          src={src}
          alt={`Memory ${index + 1}`}
          className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-sm"
          loading="lazy"
        />
        <p className="text-[8px] text-white/30 font-sans mt-2 text-center uppercase tracking-widest">
          Memory {index + 1}
        </p>
      </div>
    </motion.div>
  )
}

function GlassCard({ src, index }: { src: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring' }}
      whileHover={{ scale: 1.03 }}
      className="group perspective-[1000px]"
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-rose-300/30">
        <img
          src={src}
          alt={`Memory ${index + 1}`}
          className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  )
}

function TimelinePhoto({ src, index }: { src: string; index: number }) {
  const isLeft = index % 2 === 0
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
      className={`flex items-center gap-4 md:gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className="flex-1">
        <div className={`${isLeft ? 'text-right' : 'text-left'}`}>
          <img
            src={src}
            alt={`Memory ${index + 1}`}
            className={`inline-block w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl shadow-lg border border-white/10 ${isLeft ? 'md:ml-auto' : ''}`}
            loading="lazy"
          />
        </div>
      </div>
      <div className="relative z-10 w-6 h-6 rounded-full bg-rose-500/20 border-2 border-rose-400 shrink-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
      </div>
      <div className="flex-1" />
    </motion.div>
  )
}

export default function MemoriesSection() {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('coverflow')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const images = birthdayConfig.photos

  useEffect(() => {
    if (images.length === 0) return
  }, [images.length])

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
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-6">A collection of special moments</p>

      {images.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {galleryModes.map((gm) => (
            <button
              key={gm.mode}
              onClick={() => setGalleryMode(gm.mode)}
              className={`px-4 py-2 rounded-full text-xs tracking-wider uppercase font-sans transition-all duration-300 ${
                galleryMode === gm.mode
                  ? 'bg-rose-400/20 text-rose-200 border border-rose-400/30'
                  : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10'
              }`}
            >
              {gm.label}
            </button>
          ))}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center">
          <CrownIcon className="mx-auto mb-6 opacity-40" />
          <p className="text-white/20 font-sans text-sm">Add photos to the img folder to create a gallery</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto">
          {galleryMode === 'coverflow' && (
            <Swiper
              effect="coverflow"
              grabCursor centeredSlides slidesPerView="auto"
              coverflowEffect={{ rotate: 40, stretch: 0, depth: 120, modifier: 1.2, slideShadows: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Autoplay, Pagination]}
              className="w-full py-10 [&_.swiper-pagination-bullet]:bg-white/30 [&_.swiper-pagination-bullet-active]:bg-rose-400"
            >
              {images.map((src, i) => (
                <SwiperSlide key={i} className="w-[280px] md:w-[340px]">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm group cursor-pointer"
                    onClick={() => setSelectedImage(src)}>
                    <img src={src} alt={`Memory ${i + 1}`} className="w-full h-72 md:h-80 object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                      <span className="text-white/70 text-sm font-sans tracking-wider">Memory {i + 1}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {galleryMode === 'polaroid' && (
            <div className="relative h-[400px] md:h-[500px]">
              {images.slice(0, 8).map((src, i) => (
                <PolaroidCard key={i} src={src} index={i} onClick={() => setSelectedImage(src)} />
              ))}
            </div>
          )}

          {galleryMode === 'masonry' && (
            <div className="columns-2 md:columns-3 gap-4">
              {images.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid mb-4 cursor-pointer"
                  onClick={() => setSelectedImage(src)}
                >
                  <img
                    src={src}
                    alt={`Memory ${i + 1}`}
                    className="w-full rounded-xl object-cover border border-white/10 hover:border-rose-400/30 transition-all duration-500"
                    style={{ height: `${150 + Math.random() * 150}px` }}
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {galleryMode === 'cards3d' && (
            <Swiper
              slidesPerView={1} spaceBetween={30} centeredSlides
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              modules={[Autoplay, Pagination]}
              pagination={{ clickable: true }}
              className="w-full max-w-md mx-auto [&_.swiper-pagination-bullet]:bg-white/30 [&_.swiper-pagination-bullet-active]:bg-rose-400"
            >
              {images.map((src, i) => (
                <SwiperSlide key={i}>
                  <motion.div
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer"
                    style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                    whileHover={{ rotateY: 5, rotateX: -5 }}
                    onClick={() => setSelectedImage(src)}
                  >
                    <img src={src} alt={`Memory ${i + 1}`} className="w-full h-80 md:h-96 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                      <p className="text-white/70 font-sans text-sm tracking-wider">Memory {i + 1}</p>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {galleryMode === 'stack' && (
            <div className="relative h-80 md:h-96 flex items-center justify-center">
              {images.slice(0, 5).map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 * (i + 1), rotate: (i - 2) * 4 }}
                  whileInView={{ opacity: 1, y: i * 8, rotate: (i - 2) * 4 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  whileHover={{ y: -20, rotate: 0, scale: 1.05 }}
                  className="absolute cursor-pointer"
                  style={{ zIndex: 5 - i }}
                  onClick={() => setSelectedImage(src)}
                >
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/10 shadow-xl">
                    <img src={src} alt={`Memory ${i + 1}`} className="w-28 h-28 md:w-32 md:h-32 object-cover rounded" loading="lazy" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {galleryMode === 'glass' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((src, i) => (
                <GlassCard key={i} src={src} index={i} />
              ))}
            </div>
          )}

          {galleryMode === 'timeline' && (
            <div className="relative max-w-lg mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose-400/20 to-transparent" />
              <div className="space-y-12">
                {images.slice(0, 6).map((src, i) => (
                  <TimelinePhoto key={i} src={src} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
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
