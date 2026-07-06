import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { GiftIcon, RibbonIcon, StarIcon, HeartIcon, FlowerIcon } from '../ui/PremiumIcons'
import { soundManager } from '../../lib/sound'

interface Gift {
  id: number
  label: string
  color: string
  message: string
  Icon: React.ComponentType<{ className?: string; color?: string }>
}

const gifts: Gift[] = [
  { id: 1, label: 'Joy', color: '#f43f5e', message: 'May your days be filled with endless joy and laughter!', Icon: StarIcon },
  { id: 2, label: 'Love', color: '#d946ef', message: 'Wrapped with love and sent with warmest wishes!', Icon: HeartIcon },
  { id: 3, label: 'Success', color: '#fbbf24', message: 'May all your dreams and goals come true this year!', Icon: GiftIcon },
  { id: 4, label: 'Happiness', color: '#34d399', message: 'Happiness is a journey, enjoy every step!', Icon: FlowerIcon },
  { id: 5, label: 'Prosperity', color: '#60a5fa', message: 'Wishing you abundance and prosperity!', Icon: StarIcon },
  { id: 6, label: 'Adventure', color: '#fb923c', message: 'Here is to new adventures and exciting journeys!', Icon: RibbonIcon },
]

function GiftBox({ gift, index }: { gift: Gift; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
    soundManager.playSparkle()
    setTimeout(() => setShowMessage(true), 600)
    setTimeout(() => { setIsOpen(false); setShowMessage(false) }, 4000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 80 }}
      className="relative flex flex-col items-center"
    >
      <motion.button
        className="relative cursor-pointer bg-transparent border-none outline-none"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        disabled={isOpen}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed"
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -4, 0], rotate: [0, -2, 2, -2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <GiftIcon color={gift.color} />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center">
                <motion.span
                  className="text-[8px]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <StarIcon size="sm" className="w-3 h-3 text-white" />
                </motion.span>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-white/30 font-sans block text-center mt-2">
                {gift.label}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <gift.Icon className="w-14 h-14" color={gift.color} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-52 p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-center z-10"
          >
            <p className="text-white/70 text-xs font-sans leading-relaxed">{gift.message}</p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <StarIcon key={i} size="sm" className="w-3 h-3 opacity-50" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GiftSection() {
  return (
    <SectionWrapper className="bg-golden-dust relative" id="gifts" transitionType="starWarp">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-300/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <AnimatedText text="Gifts For You" className="text-3xl md:text-5xl font-heading text-gold-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-14">Tap each gift to unwrap</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto w-full">
        {gifts.map((gift, i) => (
          <GiftBox key={gift.id} gift={gift} index={i} />
        ))}
      </div>
    </SectionWrapper>
  )
}
