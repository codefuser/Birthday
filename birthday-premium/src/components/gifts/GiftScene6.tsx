import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CREAM_W = new THREE.MeshPhysicalMaterial({
  color: '#FFF5EE', roughness: 0.35, metalness: 0,
  sheen: 0.2, sheenColor: new THREE.Color('#FFF8F0'),
  clearcoat: 0.05,
})

const CREAM_P = new THREE.MeshPhysicalMaterial({
  color: '#FCE4EC', roughness: 0.3, metalness: 0,
  sheen: 0.15,
})

const CREAM_R = new THREE.MeshPhysicalMaterial({
  color: '#F8C8D8', roughness: 0.28, metalness: 0,
  clearcoat: 0.08,
})

const GOLD = new THREE.MeshPhysicalMaterial({
  color: '#D4A843', metalness: 0.9, roughness: 0.12,
  clearcoat: 0.2, envMapIntensity: 2.5,
})

const CANDLE = new THREE.MeshPhysicalMaterial({
  color: '#FEF3C7', roughness: 0.25, metalness: 0,
  clearcoat: 0.05,
})

const FLAME = new THREE.MeshBasicMaterial({
  color: '#FCD34D', transparent: true, opacity: 0.9,
})

const FLAME_INNER = new THREE.MeshBasicMaterial({
  color: '#FEF08A', transparent: true, opacity: 0.7,
})

const BERRY = new THREE.MeshPhysicalMaterial({
  color: '#CC2040', roughness: 0.3, metalness: 0.05,
  clearcoat: 0.6, clearcoatRoughness: 0.1,
})

const BERRY_BLUE = new THREE.MeshPhysicalMaterial({
  color: '#3B4EA0', roughness: 0.25, metalness: 0,
  clearcoat: 0.5,
})

function PipingDots({ y, r, count, mat }: { y: number; r: number; count: number; mat: THREE.MeshPhysicalMaterial }) {
  return (
    <group position={[0, y, 0]}>
      {[...Array(count)].map((_, i) => {
        const a = i / count * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * r, 0, Math.cos(a) * r]}>
            <sphereGeometry args={[0.01, 6, 6]} />
            <primitive object={mat} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

function CandleWithFlame({ pos, phase }: { pos: [number, number, number]; phase: number }) {
  const flameRef = useRef<THREE.Mesh>(null!)
  const flameInnerRef = useRef<THREE.Mesh>(null!)
  const tRef = useRef(0)

  useFrame((_, delta) => {
    tRef.current += delta
    if (flameRef.current) {
      const f = 0.7 + Math.sin(tRef.current * 16 + phase) * 0.2 + Math.sin(tRef.current * 28 + phase * 1.5) * 0.1
      flameRef.current.scale.set(f * 0.8, f, f * 0.8)
    }
    if (flameInnerRef.current) {
      const f = 0.7 + Math.sin(tRef.current * 20 + phase + 1) * 0.15
      flameInnerRef.current.scale.set(f * 0.5, f * 0.7, f * 0.5)
    }
  })

  return (
    <group position={pos}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.004, 0.005, 0.05, 6]} />
        <primitive object={CANDLE} attach="material" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.045, 0]}>
        <coneGeometry args={[0.012, 0.02, 6]} />
        <primitive object={FLAME} attach="material" />
      </mesh>
      <mesh ref={flameInnerRef} position={[0, 0.045, 0]}>
        <coneGeometry args={[0.006, 0.012, 6]} />
        <primitive object={FLAME_INNER} attach="material" />
      </mesh>
      <mesh position={[0, 0.038, 0]}>
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function GiftScene6() {
  const group = useRef<THREE.Group>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const confettiRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(25 * 3)
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.12 + Math.random() * 0.25
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = 0.15 + Math.random() * 0.25
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  const confettiPos = useMemo(() => {
    const p = new Float32Array(35 * 3)
    for (let i = 0; i < 35; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.6
      p[i * 3 + 1] = Math.random() * 0.4
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.6
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 25; i++) {
          op[i] = 0.25 + Math.sin(t.current * 1.5 + i * 1.2) * 0.25
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
    if (confettiRef.current) {
      const pos = confettiRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 35; i++) {
        pos[i * 3 + 1] += Math.sin(t.current * 0.25 + i * 0.4) * 0.0008
      }
      confettiRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.14, 24]} />
        <primitive object={CREAM_W} attach="material" />
      </mesh>
      <PipingDots y={0} r={0.26} count={12} mat={CREAM_P} />
      <mesh position={[0, -0.08, 0]}>
        <torusGeometry args={[0.26, 0.01, 8, 24]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.1, 24]} />
        <primitive object={CREAM_P} attach="material" />
      </mesh>
      <PipingDots y={0.04} r={0.2} count={10} mat={CREAM_R} />
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.2, 0.008, 8, 24]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 24]} />
        <primitive object={CREAM_R} attach="material" />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[0.14, 0.008, 8, 24]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      {[[0.08, 0.18, 0.07], [-0.06, 0.18, -0.09], [0, 0.18, -0.1], [-0.08, 0.18, 0.06], [0.06, 0.18, -0.06]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <primitive object={i % 2 === 0 ? BERRY : BERRY_BLUE} attach="material" />
        </mesh>
      ))}

      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      <CandleWithFlame pos={[-0.07, 0.21, 0.05]} phase={0} />
      <CandleWithFlame pos={[0.07, 0.21, -0.04]} phase={2} />
      <CandleWithFlame pos={[0, 0.21, 0.07]} phase={4} />

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(25).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.008} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      <points ref={confettiRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[confettiPos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.01} color="#f43f5e" transparent opacity={0.35} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
