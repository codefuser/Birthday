import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  variant?: 'fade' | 'reveal' | 'scale'
}

const variants = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  },
  child: {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 12, stiffness: 200 },
    },
    hidden: { opacity: 0, y: 40 },
  },
  scaleChild: {
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, damping: 12, stiffness: 200 },
    },
    hidden: { opacity: 0, scale: 0.5 },
  },
}

export default function AnimatedText({
  text,
  className,
  delay = 0,
  as: Tag = 'h1',
  variant = 'reveal',
}: AnimatedTextProps) {
  const words = text.split(' ')

  const containerVars = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  }

  const childVars = variant === 'scale' ? variants.scaleChild : variants.child

  return (
    <motion.div
      variants={containerVars}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className={cn('inline-flex flex-wrap', className)}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIdx) => (
            <motion.span key={charIdx} variants={childVars} className="inline-block">
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  )
}
