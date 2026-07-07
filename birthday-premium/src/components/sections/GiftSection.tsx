import { useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { soundManager } from '../../lib/sound'
import { gifts, GiftData } from '../../lib/giftConfig'
import { GiftPopup } from '../gifts/GiftPopup'

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  } catch { }
}

interface GiftParticlesProps {
  color: string
}

function GiftParticles({ color }: GiftParticlesProps) {
  const items = useMemo(() => {
    const shapes = ['●', '✦', '♥', '★', '◆', '❋']
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      shape: shapes[i % shapes.length],
      x: (Math.random() - 0.5) * 280,
      y: -Math.random() * 260 - 40,
      scale: 0.3 + Math.random() * 0.9,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.4,
      duration: 0.6 + Math.random() * 0.4,
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-20" style={{ perspective: '500px' }}>
      {items.map(p => (
        <motion.div
          key={p.id}
          className="absolute text-xs md:text-sm"
          style={{ left: '50%', top: '50%', color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0, rotate: p.rotation }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {p.shape}
        </motion.div>
      ))}
    </div>
  )
}

function GiftBox({
  gift,
  index,
  onOpen,
  opened,
}: {
  gift: GiftData
  index: number
  onOpen: (id: number) => void
  opened: boolean
}) {
  const [isOpening, setIsOpening] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  const handleClick = () => {
    if (opened || isOpening) return
    setIsOpening(true)
    setShowParticles(true)
    playChime()
    soundManager.playSparkle()
    setTimeout(() => {
      onOpen(gift.id)
    }, 600)
    setTimeout(() => {
      setShowParticles(false)
      setIsOpening(false)
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 80, damping: 14 }}
      className="relative flex flex-col items-center"
    >
      <motion.button
        className="relative cursor-pointer bg-transparent border-none outline-none"
        whileHover={!opened ? { scale: 1.07 } : {}}
        whileTap={!opened ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={opened}
      >
        <div className="relative w-28 h-28 md:w-32 md:h-32">
          <AnimatePresence>
            {showParticles && <GiftParticles color={gift.color} />}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${gift.color}40 0%, transparent 70%)` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={isOpening ? { opacity: [0, 0.6, 0], scale: [0, 2.5, 3.5] } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="closed"
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <motion.div
                  className="absolute inset-x-0 top-0 z-10"
                  style={{ height: '38%' }}
                  animate={isOpening
                    ? { y: -50, rotate: -12, opacity: 0 }
                    : {}
                  }
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div
                    className="w-full h-full rounded-t-xl border border-white/20"
                    style={{ background: `linear-gradient(145deg, ${gift.color}cc, ${gift.color}88)` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="md:w-6 md:h-5">
                        <path d="M10 0C6.5 0 4 2.5 4 6s2 5 6 8c4-3 6-4.5 6-8S13.5 0 10 0z" fill="white" opacity="0.5" />
                        <path d="M10 2C8 2 6 3.5 6 6s1.5 3.5 4 5.5c2.5-2 4-3.5 4-5.5S12 2 10 2z" fill="white" opacity="0.2" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <div className="absolute inset-x-0 bottom-0" style={{ height: '70%' }}>
                  <div
                    className="w-full h-full rounded-b-xl border border-white/20 shadow-lg"
                    style={{ background: `linear-gradient(145deg, ${gift.color}99, ${gift.color}44)` }}
                  >
                    <div className="absolute inset-x-[30%] top-0 bottom-0" style={{ background: `linear-gradient(180deg, ${gift.color}bb, transparent)` }} />
                    <div className="absolute inset-y-[15%] left-0 right-0" style={{ background: `linear-gradient(90deg, ${gift.color}bb, transparent, ${gift.color}bb)` }} />
                  </div>
                </div>

                <motion.div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20"
                  style={{ color: gift.color }}
                  animate={isOpening ? { scale: 0, opacity: 0 } : { y: [0, -3, 0] }}
                  transition={isOpening ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className="md:w-6 md:h-5">
                    <path d="M11 1C7 1 4 4 4 8s2.5 5.5 7 7.5c4.5-2 7-4 7-7.5S15 1 11 1z" fill="currentColor" opacity="0.6" />
                    <path d="M11 3.5c-2.5 0-4 2-4 4.5s1.5 3 4 4.5c2.5-1.5 4-2.5 4-4.5s-1.5-4.5-4-4.5z" fill="currentColor" opacity="0.3" />
                    <circle cx="11" cy="8" r="1.5" fill="white" opacity="0.8" />
                  </svg>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="opened"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-full h-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-1"
              >
                <svg width="20" height="16" viewBox="0 0 24 24" fill="none" className="md:w-6 md:h-5" style={{ color: gift.color }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" fill="currentColor" opacity="0.8" />
                </svg>
                <span className="text-[9px] text-white/30 font-sans uppercase tracking-wider">Opened</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-[clamp(8px,1.5vw,10px)] tracking-widest uppercase block text-center mt-3" style={{ color: `${gift.color}aa` }}>
          {gift.title}
        </span>
      </motion.button>
    </motion.div>
  )
}

export default function GiftSection() {
  const [openedGifts, setOpenedGifts] = useState<Set<number>>(new Set())
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null)

  const handleOpen = useCallback((id: number) => {
    setOpenedGifts(prev => new Set(prev).add(id))
    const gift = gifts.find(g => g.id === id)
    if (gift) setSelectedGift(gift)
  }, [])

  const handleClosePopup = useCallback(() => setSelectedGift(null), [])

  return (
    <SectionWrapper className="bg-golden-dust relative" id="gifts" transitionType="starWarp">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: '#fbbf2440' }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <AnimatedText text="Gifts For You" className="text-3xl md:text-5xl font-heading text-gold-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-8 md:mb-14 text-center">Tap each gift to unwrap</p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto w-full"
        animate={selectedGift ? { scale: 0.97 } : { scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {gifts.map((gift, i) => (
          <GiftBox
            key={gift.id}
            gift={gift}
            index={i}
            onOpen={handleOpen}
            opened={openedGifts.has(gift.id)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedGift && (
          <GiftPopup
            key={selectedGift.id}
            gift={selectedGift}
            onClose={handleClosePopup}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
