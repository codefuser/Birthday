import { useRef } from 'react'
import { motion } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { StarIcon, CrownIcon, HeartIcon, FlowerIcon, ButterflyIcon } from '../ui/PremiumIcons'

interface TimelineEvent {
  year: string
  desc: string
  Icon: React.ComponentType<{ className?: string }>
  color: string
}

const timelineEvents: TimelineEvent[] = [
  { year: 'The Beginning', desc: 'A beautiful journey starts', Icon: StarIcon, color: '#fcd34d' },
  { year: 'Memories Made', desc: 'Capturing every precious moment', Icon: HeartIcon, color: '#f43f5e' },
  { year: 'Laughter Shared', desc: 'Filled with joy and happiness', Icon: FlowerIcon, color: '#f472b6' },
  { year: 'Dreams Built', desc: 'Supporting each others dreams', Icon: ButterflyIcon, color: '#a78bfa' },
  { year: 'Growing Together', desc: 'Through ups and downs', Icon: StarIcon, color: '#34d399' },
  { year: 'Celebrating You', desc: 'Today is all about YOU!', Icon: CrownIcon, color: '#fbbf24' },
]

export default function FriendshipTimeline() {
  const trackRef = useRef<HTMLDivElement>(null!)

  return (
    <SectionWrapper className="bg-aurora relative" id="timeline" transitionType="particleDissolve">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-500/5 blur-[100px]"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-500/5 blur-[100px]"
          animate={{ x: [0, -80, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatedText text="Our Journey" className="text-3xl md:text-5xl font-heading text-emerald-200 mb-3 text-center" />
      <p className="text-white/30 font-sans text-sm tracking-widest uppercase mb-14">A timeline of beautiful moments</p>

      <div ref={trackRef} className="relative w-full max-w-4xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent hidden md:block" />

        <div className="space-y-12 md:space-y-16">
          {timelineEvents.map((event, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.12 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-3 md:gap-8`}
              >
                <div className={`flex-1 min-w-0 ${isLeft ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-400/20 transition-all duration-500 hover:bg-white/[0.07]`}
                  >
                    <div className={`flex ${isLeft ? 'justify-end' : 'justify-start'} mb-2`}>
                      <event.Icon />
                    </div>
                    <h3 className="text-lg md:text-xl font-display text-white mb-1">{event.year}</h3>
                    <p className="text-white/40 text-sm font-sans leading-relaxed">{event.desc}</p>
                  </div>
                </div>

                <div className="relative z-10 w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.12 + 0.3, type: 'spring' }}
                    className="w-2.5 h-2.5 rounded-full bg-rose-400"
                    style={{ boxShadow: '0 0 8px rgba(244, 63, 94, 0.5)' }}
                  />
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </SectionWrapper>
  )
}
