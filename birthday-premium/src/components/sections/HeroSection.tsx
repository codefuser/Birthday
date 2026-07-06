import { useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import * as THREE from 'three'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'

function ShootingStars() {
  const count = 3
  const stars = useMemo(() => Array.from({ length: count }, () => ({
    progress: Math.random(),
    speed: 0.002 + Math.random() * 0.005,
    startX: Math.random() * 20 - 10,
    startY: Math.random() * 10 - 5,
    length: 2 + Math.random() * 3,
    delay: Math.random() * 100,
  })), [])

  const ref = useRef<THREE.Points>(null!)

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const opacities = ref.current.geometry.attributes.opacity?.array as Float32Array | null

    for (let i = 0; i < count; i++) {
      const s = stars[i]
      s.progress += s.speed
      if (s.progress > 1) {
        s.progress = 0
        s.startX = Math.random() * 20 - 10
        s.startY = Math.random() * 10 - 5
        s.delay = Math.random() * 200
      }

      const x = s.startX + s.progress * 15
      const y = s.startY - s.progress * 5
      const z = -5 + s.progress * 10

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      if (opacities) {
        const alpha = Math.sin(s.progress * Math.PI) * 0.8
        opacities[i] = alpha
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    if (opacities) ref.current.geometry.attributes.opacity.needsUpdate = true
  })

  const positions = new Float32Array(count * 3)
  const opacities = new Float32Array(count)

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-opacity" args={[opacities, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#fcd34d" transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

function Constellations() {
  const ref = useRef<THREE.LineSegments>(null!)
  const count = 200

  const pairs = useMemo(() => {
    const p: number[] = []
    const points: [number, number, number][] = []
    for (let i = 0; i < count; i++) {
      points.push([
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -10 + Math.random() * 5,
      ])
    }
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = points[i][0] - points[j][0]
        const dy = points[i][1] - points[j][1]
        const dz = points[i][2] - points[j][2]
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 2) {
          p.push(points[i][0], points[i][1], points[i][2])
          p.push(points[j][0], points[j][1], points[j][2])
        }
      }
    }
    return new Float32Array(p)
  }, [])

  const starPos = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30
      p[i * 3 + 1] = (Math.random() - 0.5) * 20
      p[i * 3 + 2] = -10 + Math.random() * 5
    }
    return p
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.1
    }
  })

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#fff" transparent opacity={0.6} sizeAttenuation />
      </points>
      <lineSegments ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pairs, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#fff" transparent opacity={0.08} />
      </lineSegments>
    </group>
  )
}

function ParticleField() {
  const count = 1000
  const ref = useRef<THREE.Points>(null!)
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40
      p[i * 3 + 1] = (Math.random() - 0.5) * 30
      p[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return p
  }, [])

  useFrame((state) => {
    const p = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.001
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.01) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#fcd34d" transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const glowRef = useRef<HTMLDivElement>(null!)
  const scrollHintRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        scale: 1.5, opacity: 0.2, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(scrollHintRef.current, {
        y: 10, opacity: 0.3, duration: 1.5, repeat: -1, yoyo: true, ease: 'power1.inOut',
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-night-900">
      <div className="absolute inset-0 bg-gradient-to-b from-night-900 via-rose-950/20 to-night-900/80" />

      <div ref={glowRef} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-rose-500/10 blur-[150px]" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[100px]" />

      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 8], fov: 65 }}>
            <ambientLight intensity={0.1} />
            <ParticleField />
            <Constellations />
            <ShootingStars />
          </Canvas>
        </Suspense>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="mb-4"
        >
          <span className="text-sm tracking-[0.4em] uppercase text-rose-300/70 font-sans font-light">
            Celebrating
          </span>
        </motion.div>

        <AnimatedText
          text={birthdayConfig.friendName !== 'Birthday Star' ? `Happy Birthday,\n${birthdayConfig.friendName}!` : 'Happy Birthday!'}
          className="text-5xl md:text-7xl lg:text-8xl font-display text-white leading-[1.1] mb-6"
          delay={0.6}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: 'easeOut' }}
          className="text-lg md:text-xl text-white/40 font-sans font-light max-w-2xl mx-auto mb-4"
        >
          {birthdayConfig.greetingMessages.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-white/30 font-sans">
            {birthdayConfig.birthdayDate}
          </span>
        </motion.div>
      </div>

      <div ref={scrollHintRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-sans">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-white/30">
          <rect x="1.5" y="1.5" width="13" height="21" rx="6.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor">
            <animate attributeName="cy" values="8;16;8" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </section>
  )
}
