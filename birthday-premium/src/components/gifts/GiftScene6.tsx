import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CREAM_WHITE = new THREE.MeshPhysicalMaterial({
  color: '#FFF5EE', roughness: 0.4, metalness: 0,
  clearcoat: 0.05, sheen: 0.2, sheenColor: new THREE.Color('#FFF8F0'),
})

const CREAM_PINK = new THREE.MeshPhysicalMaterial({
  color: '#FCE4EC', roughness: 0.35, metalness: 0,
  clearcoat: 0.08, sheen: 0.15,
})

const CREAM_ROSE = new THREE.MeshPhysicalMaterial({
  color: '#F8C8D8', roughness: 0.3, metalness: 0,
  clearcoat: 0.1,
})

const GOLD_DECOR = new THREE.MeshPhysicalMaterial({
  color: '#D4A843', metalness: 0.9, roughness: 0.12,
  clearcoat: 0.2, envMapIntensity: 2,
})

const CANDLE_WAX = new THREE.MeshPhysicalMaterial({
  color: '#FEF3C7', roughness: 0.3, metalness: 0,
  clearcoat: 0.1,
})

const FLAME_MAT = new THREE.MeshBasicMaterial({
  color: '#FCD34D', transparent: true, opacity: 0.9,
})

export function GiftScene6() {
  const group = useRef<THREE.Group>(null!)
  const flame1 = useRef<THREE.Mesh>(null!)
  const flame2 = useRef<THREE.Mesh>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const confettiRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(30 * 3)
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.1 + Math.random() * 0.3
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = 0.1 + Math.random() * 0.35
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  const confettiPos = useMemo(() => {
    const p = new Float32Array(40 * 3)
    for (let i = 0; i < 40; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.7
      p[i * 3 + 1] = Math.random() * 0.5
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.7
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (flame1.current) {
      const f = 0.7 + Math.sin(t.current * 18) * 0.2 + Math.sin(t.current * 30) * 0.1
      flame1.current.scale.set(f, f * 1.2, f)
    }
    if (flame2.current) {
      const f = 0.7 + Math.sin(t.current * 15 + 3) * 0.2 + Math.sin(t.current * 25 + 2) * 0.1
      flame2.current.scale.set(f, f * 1.2, f)
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 30; i++) {
          op[i] = 0.3 + Math.sin(t.current * 1.8 + i * 1.5) * 0.3
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
    if (confettiRef.current) {
      const pos = confettiRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 40; i++) {
        pos[i * 3 + 1] += Math.sin(t.current * 0.3 + i * 0.5) * 0.001
      }
      confettiRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.12, 24]} />
        <primitive object={CREAM_WHITE} attach="material" />
      </mesh>

      <mesh position={[0, -0.06, 0]}>
        <torusGeometry args={[0.24, 0.012, 8, 24]} />
        <primitive object={GOLD_DECOR} attach="material" />
      </mesh>

      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.20, 0.1, 24]} />
        <primitive object={CREAM_PINK} attach="material" />
      </mesh>

      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[0.18, 0.01, 8, 24]} />
        <primitive object={GOLD_DECOR} attach="material" />
      </mesh>

      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 24]} />
        <primitive object={CREAM_ROSE} attach="material" />
      </mesh>

      <mesh position={[0, 0.17, 0]}>
        <torusGeometry args={[0.12, 0.008, 8, 24]} />
        <primitive object={GOLD_DECOR} attach="material" />
      </mesh>

      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <primitive object={GOLD_DECOR} attach="material" />
      </mesh>

      {[[-0.06, 0.23, 0], [0.06, 0.23, 0]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.005, 0.007, 0.06, 6]} />
            <primitive object={CANDLE_WAX} attach="material" />
          </mesh>
          <mesh ref={i === 0 ? flame1 : flame2} position={[0, 0.04, 0]}>
            <coneGeometry args={[0.014, 0.022, 6]} />
            <primitive object={FLAME_MAT} attach="material" />
          </mesh>
          <mesh position={[0, 0.035, 0]}>
            <sphereGeometry args={[0.006, 6, 6]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(30).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.01} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      <points ref={confettiRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[confettiPos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} color="#f43f5e" transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
