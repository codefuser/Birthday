import { useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { soundManager } from '../../lib/sound'

function PremiumCake3D({ blown }: { blown: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)
  const flameRefs = useRef<THREE.Mesh[]>([])
  const smokeRef = useRef<THREE.Points>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const cameraRef = useRef({ zoom: 1 })

  const sparklePos = useMemo(() => {
    const p = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 0.5 + Math.random() * 0.5
      p[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      p[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r + 1.2
      p[i * 3 + 2] = Math.cos(phi) * r
    }
    return p
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.2
      if (!blown) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      }
    }

    if (!blown) {
      flameRefs.current.forEach((flame, i) => {
        if (flame) {
          flame.scale.x = 1 + Math.sin(state.clock.elapsedTime * 12 + i * 2) * 0.12
          flame.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10 + i * 1.5) * 0.15
          flame.position.x = Math.sin(state.clock.elapsedTime * 4 + i * 3) * 0.01
        }
      })
    } else {
      flameRefs.current.forEach((flame) => {
        if (flame) {
          flame.scale.x *= 0.95
          flame.scale.y *= 0.95
        }
      })
    }

    if (sparkleRef.current) {
      sparkleRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const candleCount = 5

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.3, 32]} />
        <meshPhysicalMaterial color="#fce7f3" roughness={0.8} metalness={0} />
      </mesh>
      {[...Array(3)].map((_, i) => {
        const y = i * 0.35
        const radius = 0.9 - i * 0.12
        const narrow = 0.85 - i * 0.15
        return (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[narrow, radius, 0.35, 48]} />
              <meshPhysicalMaterial
                color={['#fbcfe8', '#f9a8d4', '#f472b6'][i]}
                roughness={0.4}
                metalness={0.05}
                clearcoat={0.1}
              />
            </mesh>
            <mesh position={[0, y + 0.17, 0]}>
              <cylinderGeometry args={[narrow + 0.02, narrow + 0.05, 0.04, 48]} />
              <meshPhysicalMaterial color="#fce7f3" roughness={0.6} />
            </mesh>
            <mesh position={[0.25, y + 0.02, 0.25]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshPhysicalMaterial color="#fcd34d" roughness={0.1} metalness={0.3} />
            </mesh>
            <mesh position={[-0.2, y + 0.03, -0.2]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshPhysicalMaterial color="#fcd34d" roughness={0.1} metalness={0.3} />
            </mesh>
          </group>
        )
      })}
      {[...Array(candleCount)].map((_, i) => {
        const angle = (i / candleCount) * Math.PI * 2 + 0.2
        const radius = 0.55
        return (
          <group key={i} position={[Math.sin(angle) * radius, 1.0, Math.cos(angle) * radius]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.018, 0.25, 8]} />
              <meshPhysicalMaterial color="#fff" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.18, 0]} castShadow>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshPhysicalMaterial color="#f97316" emissive="#f97316" emissiveIntensity={blown ? 0 : 3} />
            </mesh>
            <pointLight
              color="#f97316"
              intensity={blown ? 0 : 0.5}
              distance={0.8}
              ref={(ref) => { if (ref) flameRefs.current[i] = ref as unknown as THREE.Mesh }}
            />
          </group>
        )
      })}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 0.35
        return (
          <mesh key={`rose-${i}`} position={[Math.sin(angle) * r, 1.02, Math.cos(angle) * r]} rotation={[Math.random(), Math.random(), Math.random()]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshPhysicalMaterial color="#f472b6" roughness={0.3} metalness={0} clearcoat={0.2} />
          </mesh>
        )
      })}
      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#fcd34d" transparent opacity={0.7} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <AnimatePresence>
        {blown && (
          <points ref={smokeRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[
                new Float32Array(Array.from({ length: 50 }, () => (Math.random() - 0.5) * 0.3)), 3
              ]} />
            </bufferGeometry>
            <pointsMaterial size={0.04} color="#ccc" transparent opacity={0.3} sizeAttenuation />
          </points>
        )}
      </AnimatePresence>
    </group>
  )
}

export default function CakeSection() {
  const reducedMotion = useReducedMotion()
  const [blown, setBlown] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleBlow = () => {
    if (blown) return
    setBlown(true)
    setTimeout(() => { setShowConfetti(true); soundManager.playCelebration() }, 300)
  }

  const candleCount = birthdayConfig.cakeTheme?.candles || 5

  return (
    <SectionWrapper className="bg-rose-garden min-h-[120dvh] relative" id="cake" transitionType="portal">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-300/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatedText
        text="Make a Wish"
        className="text-4xl md:text-6xl font-heading text-rose-200 mb-3 text-center"
      />
      <p className="text-rose-100/40 font-sans text-sm tracking-widest uppercase mb-10">
        Blow the candles
      </p>

      <div className="w-full h-[450px] md:h-[550px] relative">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
          </div>
        }>
          <Canvas shadows camera={{ position: [0, 1.5, 3.5], fov: 40 }} gl={{ antialias: true }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[3, 3, 3]} intensity={0.4} />
            <pointLight position={[-3, 2, 3]} intensity={0.3} color="#fcd34d" />
            <pointLight position={[0, 0, -2]} intensity={0.2} color="#f472b6" />
            <spotLight position={[0, 4, 4]} angle={0.2} penumbra={0.5} intensity={0.6} castShadow />
            <PremiumCake3D blown={blown} />
          </Canvas>
        </Suspense>

        <motion.button
          onClick={handleBlow}
          disabled={blown}
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-500 ${
            blown
              ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
              : 'bg-rose-400/20 text-rose-200 border border-rose-400/30 hover:bg-rose-400/30 hover:border-rose-400/50 cursor-pointer backdrop-blur-sm'
          }`}
        >
          {blown ? 'Wish Made' : 'Blow Candles'}
        </motion.button>
      </div>

      {showConfetti && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-rose-200/50 font-script text-2xl mt-6"
        >
          Your wish has been made...
        </motion.p>
      )}
    </SectionWrapper>
  )
}
