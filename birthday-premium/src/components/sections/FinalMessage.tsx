import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from '../ui/SectionWrapper'

function playPianoAmbience() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2)
    masterGain.connect(ctx.destination)

    const chords = [
      [261.63, 329.63, 392.00, 523.25],
      [293.66, 369.99, 440.00, 587.33],
      [329.63, 415.30, 493.88, 659.25],
      [261.63, 329.63, 392.00, 523.25],
      [293.66, 349.23, 440.00, 587.33],
      [261.63, 311.13, 392.00, 523.25],
    ]

    chords.forEach((notes, ci) => {
      notes.forEach((freq, ni) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(masterGain)
        osc.frequency.value = freq; osc.type = 'sine'
        const t = ctx.currentTime + ci * 2.5 + ni * 0.15
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.02, t + 0.1)
        gain.gain.linearRampToValueAtTime(0.01, t + 0.8)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2)
        osc.start(t); osc.stop(t + 2)
      })
    })

    const interval = setInterval(() => {
      const fadeGain = ctx.createGain()
      fadeGain.connect(masterGain)
      const fOsc = ctx.createOscillator()
      fOsc.connect(fadeGain)
      fOsc.frequency.value = 1000 + Math.random() * 2000
      fOsc.type = 'sine'
      const ft = ctx.currentTime
      fadeGain.gain.setValueAtTime(0.005, ft)
      fadeGain.gain.exponentialRampToValueAtTime(0.001, ft + 0.3)
      fOsc.start(ft); fOsc.stop(ft + 0.3)
    }, 4000)
    setTimeout(() => clearInterval(interval), 18000)
  } catch { }
}

const messageLines = [
  'May every sunrise bring new hope.',
  'May every step lead to success.',
  'May every prayer become a blessing.',
  'May happiness stay with you always.',
  '',
  'Happy Birthday, MS.',
]

const bokehLights = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  s: 20 + Math.random() * 60, d: 10 + Math.random() * 10,
}))

interface Butterfly {
  id: number; x: number; y: number; delay: number; duration: number; flip: boolean
}

interface Firefly {
  id: number; x: number; y: number; delay: number
}

export default function FinalMessage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioPlayed = useRef(false)
  const [visible, setVisible] = useState(false)
  const [revealedLines, setRevealedLines] = useState(0)
  const [showBottom, setShowBottom] = useState(false)
  const [butterflies, setButterflies] = useState<Butterfly[]>([])
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  useEffect(() => {
    if (!visible) return
    if (!audioPlayed.current) { audioPlayed.current = true; playPianoAmbience() }

    messageLines.forEach((_, i) => {
      setTimeout(() => setRevealedLines(prev => Math.max(prev, i + 1)), 600 + i * 500)
    })
    setTimeout(() => setShowBottom(true), 600 + messageLines.length * 500 + 400)

    const spawnButterfly = () => {
      const b: Butterfly = {
        id: Date.now() + Math.random(),
        x: -10 - Math.random() * 20,
        y: 20 + Math.random() * 50,
        delay: 0,
        duration: 8 + Math.random() * 6,
        flip: Math.random() > 0.5,
      }
      setButterflies(prev => [...prev, b])
      setTimeout(() => setButterflies(prev => prev.filter(bb => bb.id !== b.id)), (b.duration + 2) * 1000)
    }

    const spawnFirefly = () => {
      const f: Firefly = {
        id: Date.now() + Math.random(),
        x: Math.random() * 90 + 5,
        y: 20 + Math.random() * 60,
        delay: Math.random() * 3,
      }
      setFireflies(prev => [...prev.slice(-5), f])
      setTimeout(() => setFireflies(prev => prev.filter(ff => ff.id !== f.id)), 8000)
    }

    const bInterval = setInterval(spawnButterfly, 5000)
    const fInterval = setInterval(spawnFirefly, 2000)
    setTimeout(spawnButterfly, 1500)
    setTimeout(spawnFirefly, 1000)

    return () => { clearInterval(bInterval); clearInterval(fInterval) }
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const dots: { x: number; y: number; s: number; a: number; sp: number; ph: number }[] = []
    for (let i = 0; i < 120; i++) dots.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      s: Math.random() * 1.2 + 0.2, a: Math.random(),
      sp: 0.002 + Math.random() * 0.008, ph: Math.random() * Math.PI * 2,
    })

    function animate(time: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach(d => {
        d.a = 0.15 + Math.sin(time * d.sp + d.ph) * 0.35
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, d.a)})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <SectionWrapper className="relative overflow-hidden" id="final" transitionType="none"
      style={{
        background: 'linear-gradient(165deg, #0B1026 0%, #120B2E 30%, #1A1035 55%, #0F0A28 80%, #08061A 100%)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(252,211,77,0.04) 0%, rgba(252,211,77,0.01) 30%, transparent 60%)' }}
        animate={visible ? { opacity: [0.3, 0.6, 0.3] } : {}}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, rgba(252,211,77,0.03) 0%, transparent 100%)' }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bokehLights.map(b => (
          <div key={b.id} className="absolute rounded-full" style={{
            left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s,
            background: `radial-gradient(circle, rgba(252,211,77,${0.03 + Math.random() * 0.04}), transparent)`,
            filter: 'blur(25px)',
          }}>
            <motion.div className="w-full h-full rounded-full"
              animate={{ x: [0, 20, 0, -20, 0], y: [0, -15, 0, 15, 0] }}
              transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '500px' }}>
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute top-0 w-px h-full" style={{
            left: `${20 + i * 30}%`,
            background: `linear-gradient(180deg, transparent, rgba(252,211,77,${0.01 + i * 0.005}), transparent)`,
            transform: 'rotateX(65deg)',
          }}
            animate={{ opacity: [0.1, 0.3, 0.1], scaleY: [0.9, 1.1, 0.9] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,6,26,0.4) 80%, rgba(8,6,26,0.6) 100%)',
      }} />

      <AnimatePresence>
        {butterflies.map(b => (
          <motion.div key={b.id} className="absolute pointer-events-none z-20" style={{ top: `${b.y}%` }}
            initial={{ x: '-10vw', y: 0, opacity: 0, scale: 0.5 }}
            animate={{ x: '110vw', y: [0, -30, -10, -40, -20, -35, 0], opacity: [0, 0.7, 0.5, 0.7, 0.4, 0.6, 0], scale: [0.5, 1, 0.9, 1.1, 0.8, 1, 0.5] }}
            transition={{ duration: b.duration, delay: b.delay, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 30 20" className="w-6 h-4 md:w-8 md:h-5" style={{ transform: b.flip ? 'scaleX(-1)' : 'none' }}>
              <defs>
                <linearGradient id={`bw-${b.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <motion.g animate={{ rotate: [0, -15, 0, 15, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
                <ellipse cx="10" cy="10" rx="9" ry="6" fill={`url(#bw-${b.id})`} />
                <ellipse cx="10" cy="10" rx="4" ry="2" fill="rgba(252,211,77,0.2)" />
              </motion.g>
              <motion.g animate={{ rotate: [0, 15, 0, -15, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
                <ellipse cx="20" cy="10" rx="9" ry="6" fill={`url(#bw-${b.id})`} />
              </motion.g>
              <line x1="15" y1="10" x2="15" y2="10" stroke="#fcd34d" strokeWidth="0.5" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {fireflies.map(f => (
          <motion.div key={f.id} className="absolute pointer-events-none z-10" style={{ left: `${f.x}%`, top: `${f.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0.2, 0.8, 0], scale: [0, 1.2, 0.8, 1.5, 0], y: [0, -15, 5, -20, 0] }}
            transition={{ duration: 5, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-2 h-2 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(252,211,77,0.8), transparent)',
              filter: 'blur(1px)',
            }} />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        onViewportEnter={() => setVisible(true)}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 w-full max-w-lg mx-auto px-5 flex flex-col items-center justify-center min-h-[80dvh]"
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full rounded-3xl border border-white/[0.06] p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 60px rgba(252,211,77,0.04), 0 2px 20px rgba(0,0,0,0.2)',
          }}
        >
          <div className="absolute -inset-px rounded-3xl pointer-events-none" style={{
            background: 'linear-gradient(135deg, rgba(252,211,77,0.08), transparent 40%, rgba(252,211,77,0.03) 70%, transparent)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }} />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm tracking-[0.25em] uppercase mb-6"
            style={{ color: 'rgba(252,211,77,0.6)' }}
          >
            ✦ Happy Birthday ✦
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-6"
          >
            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-display leading-none tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 30%, #f43f5e 60%, #fcd34d 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: visible ? 'shimmer 4s ease-in-out infinite' : 'none',
                filter: 'drop-shadow(0 0 20px rgba(252,211,77,0.15))',
              }}
            >
              MS
            </h1>

            <motion.div className="absolute -top-3 -right-3 w-12 h-12 md:w-14 md:h-14 pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={visible ? { opacity: [0, 0.4, 0], scale: [0, 1.2, 0] } : {}}
              transition={{ duration: 3, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="#fcd34d" strokeWidth="1" opacity="0.4">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          </motion.div>

          <div className="space-y-2">
            {messageLines.map((line, i) => (
              <AnimatePresence key={i}>
                {revealedLines > i && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`${line === '' ? 'h-3' : ''} ${
                      line.includes('Happy Birthday')
                        ? 'text-base md:text-lg font-display text-rose-200/90'
                        : 'text-sm md:text-base text-white/50 font-sans font-light leading-relaxed'
                    }`}
                  >
                    {line}
                  </motion.p>
                )}
              </AnimatePresence>
            ))}
          </div>

          <motion.div
            className="w-12 h-px mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={showBottom ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(252,211,77,0.3), transparent)' }}
          />

          <AnimatePresence>
            {showBottom && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-[10px] md:text-xs text-white/15 font-sans tracking-wider mt-4"
              >
                Made with <span className="text-rose-400/40">❤</span> especially for MS
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
          >
            <motion.div className="absolute -top-10 -left-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.03), transparent)', filter: 'blur(20px)' }}
              animate={{ x: [0, 15, 0, -15, 0], y: [0, -10, 0, 10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.02), transparent)', filter: 'blur(30px)' }}
              animate={{ x: [0, -15, 0, 15, 0], y: [0, 10, 0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  )
}
