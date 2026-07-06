import { useRef, useState, Suspense, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { soundManager } from '../../lib/sound'
import { StarIcon, HeartIcon, FlowerIcon } from '../ui/PremiumIcons'

let micStream: MediaStream | null = null

function playHappyBirthday() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return
  const ctx = new AudioCtx()
  const note = (freq: number, start: number, dur: number) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.12, ctx.currentTime + start)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(ctx.currentTime + start)
    osc.stop(ctx.currentTime + start + dur)
  }
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25
  note(C4, 0, 0.3); note(C4, 0.3, 0.3); note(D4, 0.6, 0.35); note(C4, 0.95, 0.35); note(F4, 1.3, 0.35); note(E4, 1.65, 0.5)
  note(C4, 2.15, 0.3); note(C4, 2.45, 0.3); note(D4, 2.75, 0.35); note(C4, 3.1, 0.35); note(G4, 3.45, 0.35); note(F4, 3.8, 0.5)
  note(C4, 4.3, 0.3); note(C4, 4.6, 0.3); note(C5, 4.9, 0.35); note(A4, 5.25, 0.35); note(F4, 5.6, 0.35); note(E4, 5.95, 0.35); note(D4, 6.3, 0.5)
  note(Bb4, 6.8, 0.3); note(Bb4, 7.1, 0.3); note(A4, 7.4, 0.35); note(F4, 7.75, 0.35); note(G4, 8.1, 0.35); note(F4, 8.45, 0.8)
}

function CakeTier({ bottomR, topR, height, yOffset, color, hasRim }: { bottomR: number; topR: number; height: number; yOffset: number; color: string; hasRim?: boolean }) {
  const points = useMemo(() => {
    const p: THREE.Vector2[] = []
    const steps = 24
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const r = bottomR + (topR - bottomR) * Math.pow(t, 0.6)
      p.push(new THREE.Vector2(r, t * height))
    }
    return p
  }, [bottomR, topR, height])
  const geo = useMemo(() => new THREE.LatheGeometry(points, 48), [points])
  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={0.35} metalness={0.05} clearcoat={0.15} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[topR * 0.98, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.5} />
      </mesh>
      {hasRim && (
        <mesh position={[0, height + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[topR * 0.9, topR * 1.04, 32]} />
          <meshPhysicalMaterial color="#fce7f3" roughness={0.6} metalness={0.1} clearcoat={0.2} />
        </mesh>
      )}
    </group>
  )
}

function FrostingDrip({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshPhysicalMaterial color="#fce7f3" roughness={0.5} clearcoat={0.1} />
    </mesh>
  )
}

function Rose({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <mesh key={angle} position={[0, 0.01, 0]} rotation={[0.2, 0, (angle * Math.PI) / 180]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshPhysicalMaterial color="#f472b6" roughness={0.3} clearcoat={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshPhysicalMaterial color="#fcd34d" roughness={0.2} clearcoat={0.3} />
      </mesh>
    </group>
  )
}

function Pearl({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshPhysicalMaterial color="#fff" roughness={0.1} metalness={0.3} clearcoat={1} />
    </mesh>
  )
}

function Sprinkles({ count = 30, radius, yOffset }: { count: number; radius: number; yOffset: number }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2
    const r = radius * (0.2 + Math.random() * 0.7)
    return { angle, r, color: ['#fcd34d', '#f472b6', '#a78bfa', '#34d399', '#60a5fa'][i % 5] }
  }), [count, radius, yOffset])
  return (
    <group>
      {items.map((item, i) => (
        <mesh key={i} position={[Math.sin(item.angle) * item.r, yOffset + Math.random() * 0.1 - 0.05, Math.cos(item.angle) * item.r]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <boxGeometry args={[0.025, 0.005, 0.008]} />
          <meshPhysicalMaterial color={item.color} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function CandleFlame({ blown, index }: { blown: boolean; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const time = useRef(Math.random() * 100)

  useFrame((_, delta) => {
    time.current += delta
    if (meshRef.current && !blown) {
      const flicker = Math.sin(time.current * 18 + index * 3) * 0.15
        + Math.sin(time.current * 11 + index * 7) * 0.1
        + Math.sin(time.current * 7 + index * 2) * 0.08
      meshRef.current.scale.x = 1 + flicker * 0.15
      meshRef.current.scale.y = 1 + flicker * 0.2
      meshRef.current.position.x = Math.sin(time.current * 5 + index * 2) * 0.008
    }
    if (glowRef.current) {
      const intensity = blown ? 0 : 0.6 + Math.sin(time.current * 15) * 0.2
      glowRef.current.scale.setScalar(0.3 + intensity * 0.4)
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0.22, 0]}>
        <coneGeometry args={[0.025, 0.07, 8]} />
        <meshPhysicalMaterial color="#fcd34d" emissive="#f97316" emissiveIntensity={blown ? 0 : 2}
          transparent opacity={blown ? 0 : 1} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={blown ? 0 : 0.35} />
      </mesh>
    </group>
  )
}

function PremiumCake3D({ blown, onBlow, onSongPlay, playing, detecting }: {
  blown: boolean; onBlow: () => void; onSongPlay: () => void; playing: boolean; detecting: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const controlsRef = useRef<any>(null!)
  const [breathParticles] = useState(() => Array.from({ length: 12 }, () => ({
    x: (Math.random() - 0.5) * 0.2,
    y: 0.3 + Math.random() * 0.4,
    z: 0.6,
    speed: 0.5 + Math.random() * 0.5,
    size: 0.005 + Math.random() * 0.008,
  })))

  useFrame((state) => {
    if (groupRef.current && controlsRef.current) {
      if (!controlsRef.current.isDragging) {
        groupRef.current.rotation.y += state.clock.getDelta() * (playing ? 0.08 : 0.2)
      }
      if (!blown) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.025
      }
    }
  })

  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    onSongPlay()
  }, [onSongPlay])

  const candlePositions = useMemo(() =>
    [0, 72, 144, 216, 288].map((angle) => {
      const rad = (angle * Math.PI) / 180
      return [Math.sin(rad) * 0.4, Math.cos(rad) * 0.4] as [number, number]
    }), [])

  return (
    <group ref={groupRef}>
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.6} />

      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.8, 48]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.9} metalness={0} transparent opacity={0.35} />
      </mesh>

      <group position={[0, -1.1, 0]}>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.8, 48]} />
          <meshPhysicalMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 1.05, 48]} />
          <meshPhysicalMaterial color="#cbd5e1" roughness={0.2} metalness={0.4} clearcoat={0.6} />
        </mesh>
      </group>

      <CakeTier bottomR={1.0} topR={0.92} height={0.3} yOffset={-0.9} color="#fbcfe8" hasRim />
      <Sprinkles count={20} radius={0.85} yOffset={-0.6} />

      <CakeTier bottomR={0.85} topR={0.78} height={0.28} yOffset={-0.6} color="#f9a8d4" hasRim />
      <Sprinkles count={18} radius={0.72} yOffset={-0.32} />

      <CakeTier bottomR={0.7} topR={0.64} height={0.26} yOffset={-0.32} color="#f472b6" hasRim />

      <FrostingDrip position={[0.45, -0.65, 0.5]} />
      <FrostingDrip position={[-0.5, -0.67, -0.3]} />
      <FrostingDrip position={[0.3, -0.64, -0.55]} />
      <FrostingDrip position={[-0.35, -0.36, 0.55]} />
      <FrostingDrip position={[0.52, -0.38, -0.35]} />
      <FrostingDrip position={[-0.48, -0.39, -0.4]} />
      <FrostingDrip position={[0.0, -0.07, 0.6]} />
      <FrostingDrip position={[0.55, -0.1, 0.1]} />
      <FrostingDrip position={[-0.5, -0.09, -0.2]} />

      <Rose position={[0.35, -0.58, 0.55]} scale={1.2} />
      <Rose position={[-0.4, -0.6, -0.4]} scale={1} />
      <Rose position={[0.2, -0.3, 0.58]} scale={1.1} />
      <Rose position={[-0.3, -0.31, -0.5]} scale={0.9} />
      <Rose position={[0.5, 0.01, -0.25]} scale={1} />
      <Rose position={[-0.5, 0.0, 0.2]} scale={1.1} />

      <Pearl position={[0.35, -0.58, -0.55]} />
      <Pearl position={[-0.35, -0.6, 0.55]} />
      <Pearl position={[0.5, -0.58, 0.0]} />
      <Pearl position={[-0.5, -0.6, 0.0]} />
      <Pearl position={[0.55, -0.3, 0.0]} />
      <Pearl position={[-0.55, -0.31, 0.0]} />
      <Pearl position={[0.0, 0.01, 0.55]} />
      <Pearl position={[0.0, 0.01, -0.55]} />

      {candlePositions.map((pos, i) => (
        <group key={i} position={[pos[0], -0.06, pos[1]]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.022, 0.22, 8]} />
            <meshPhysicalMaterial color="#fff" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.024, 0.02, 0.015, 8]} />
            <meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.2} />
          </mesh>
          <CandleFlame blown={blown} index={i} />
        </group>
      ))}

      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.51, 0.6, 32]} />
        <meshPhysicalMaterial color="#fce7f3" roughness={0.5} transparent opacity={0.3} />
      </mesh>

      <mesh onClick={handleClick} visible={false}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
      </mesh>

      {detecting && !blown && breathParticles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 4, 4]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function MicButton({ onClick, disabled, detecting }: { onClick: () => void; disabled: boolean; detecting: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`px-8 py-3 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-500 ${
        disabled
          ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
          : 'bg-gradient-to-r from-rose-400/30 to-pink-400/20 text-rose-200 border border-rose-400/30 hover:border-rose-400/50 backdrop-blur-md shadow-lg shadow-rose-500/10'
      }`}
    >
      {disabled ? (
        <span className="flex items-center gap-2">
          <HeartIcon className="w-4 h-4" />
          <span>Wish Made</span>
        </span>
      ) : detecting ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border border-current animate-spin border-t-transparent" />
          <span>Blow...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <span>Blow Candles</span>
        </span>
      )}
    </motion.button>
  )
}

function SongButton({ onClick, playing }: { onClick: () => void; playing: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-rose-200 hover:border-rose-300/30 hover:bg-rose-400/10 transition-all duration-500 font-sans text-xs tracking-widest uppercase backdrop-blur-sm"
    >
      {playing ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border border-current animate-spin border-t-transparent" />
          <span>Playing...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
          </svg>
          <span>Song</span>
        </span>
      )}
    </motion.button>
  )
}

export default function CakeSection() {
  const reducedMotion = useReducedMotion()
  const [blown, setBlown] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handleBlow = useCallback(() => {
    if (blown) return
    setBlown(true)
    setDetecting(false)
    if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null }
    setTimeout(() => {
      setShowConfetti(true)
      soundManager.playCelebration()
    }, 400)
  }, [blown])

  const startBlow = useCallback(async () => {
    if (blown || detecting) return
    setDetecting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStream = stream
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) { handleBlow(); return }
      const ctx = new AudioCtx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      let timeout = setTimeout(() => { handleBlow() }, 8000)
      let stopped = false

      const check = () => {
        if (stopped || blown) return
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i] - 128) / 128
        }
        if (sum / data.length > 0.1) {
          clearTimeout(timeout)
          handleBlow()
          return
        }
        requestAnimationFrame(check)
      }
      check()

      return () => { stopped = true; clearTimeout(timeout) }
    } catch {
      handleBlow()
    }
  }, [blown, detecting, handleBlow])

  const handleSongPlay = useCallback(() => {
    if (playing) return
    setPlaying(true)
    playHappyBirthday()
    setTimeout(() => setPlaying(false), 10000)
  }, [playing])

  useEffect(() => {
    return () => {
      if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null }
    }
  }, [])

  if (reducedMotion) {
    return (
      <SectionWrapper className="bg-rose-garden min-h-[100dvh] relative" id="cake" transitionType="portal">
        <div className="text-center">
          <AnimatedText text="Make a Wish" className="text-4xl md:text-6xl font-heading text-rose-200 mb-4 text-center" />
          <p className="text-rose-100/40 font-sans tracking-widest uppercase text-sm">Blow the candles</p>
          <div className="mt-12 text-white/30 font-script text-2xl">May all your wishes come true</div>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper className="bg-rose-garden min-h-[120dvh] relative" id="cake" transitionType="portal">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${['#fcd34d', '#f472b6', '#fbcfe8', '#fff'][i % 4]}, transparent)`,
            }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-4">
        <AnimatedText text="Make a Wish" className="text-3xl md:text-5xl font-heading text-rose-200 text-center" />
        <p className="text-rose-100/30 font-sans text-xs tracking-widest uppercase mt-2">Blow the candles & make your birthday wish</p>
      </div>

      <div className="w-full h-[400px] md:h-[500px] relative">
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
            <span className="text-white/20 text-xs font-sans tracking-widest uppercase">Baking your cake...</span>
          </div>
        }>
          <Canvas shadows camera={{ position: [0, 1.2, 3], fov: 38 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
            <ambientLight intensity={0.15} />
            <hemisphereLight args={['#fce7f3', '#1a1a2e', 0.3]} />
            <directionalLight position={[2, 4, 3]} intensity={0.6} castShadow />
            <pointLight position={[-2, 2, 3]} intensity={0.2} color="#fcd34d" />
            <pointLight position={[0, 3, -1]} intensity={0.15} color="#f472b6" />
            <spotLight position={[0, 5, 3]} angle={0.3} penumbra={0.8} intensity={0.3} castShadow />
            <PremiumCake3D blown={blown} onBlow={handleBlow} onSongPlay={handleSongPlay} playing={playing} detecting={detecting} />
          </Canvas>
        </Suspense>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <MicButton onClick={startBlow} disabled={blown} detecting={detecting} />
          <SongButton onClick={handleSongPlay} playing={playing} />
        </div>
      </div>

      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center mt-5"
        >
          <p className="text-rose-200/70 font-script text-2xl mb-2">Your wish has been made...</p>
          <div className="flex justify-center gap-3">
            {[StarIcon, HeartIcon, FlowerIcon].map((Icon, i) => (
              <motion.div key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}>
                <Icon className={`w-5 h-5 ${i === 0 ? 'text-gold-300' : i === 1 ? 'text-rose-300' : 'text-pink-300'}`} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 mt-6 max-w-lg mx-auto text-center">
        <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
          <p className="text-white/20 font-sans text-xs leading-relaxed">
            Tap the cake to hear Happy Birthday. Drag to rotate. Speak into your mic to blow the candles.
          </p>
        </div>
      </div>
    </SectionWrapper>
  )
}
