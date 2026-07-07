import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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
      p[i * 3 + 1] = 0.1 + Math.random() * 0.3
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  const confettiPos = useMemo(() => {
    const p = new Float32Array(40 * 3)
    for (let i = 0; i < 40; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.8
      p[i * 3 + 1] = Math.random() * 0.5
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.8
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (flame1.current) {
      const flicker = 0.6 + Math.sin(t.current * 15) * 0.2 + Math.sin(t.current * 25) * 0.1
      flame1.current.scale.setScalar(flicker)
      flame1.current.position.y = 0.06 + Math.sin(t.current * 20) * 0.01
    }
    if (flame2.current) {
      const flicker = 0.6 + Math.sin(t.current * 12 + 3) * 0.2 + Math.sin(t.current * 22 + 2) * 0.1
      flame2.current.scale.setScalar(flicker)
      flame2.current.position.y = 0.06 + Math.sin(t.current * 18 + 1) * 0.01
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 30; i++) {
          op[i] = 0.3 + Math.sin(t.current * 2 + i * 1.5) * 0.3
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
    if (confettiRef.current) {
      const pos = confettiRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 40; i++) {
        pos[i * 3 + 1] += Math.sin(t.current + i) * 0.002
      }
      confettiRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0.3, 1.5]} intensity={0.6} color="#fcd34d" />
      <pointLight position={[0, 0.5, -1]} intensity={0.3} color="#f472b6" />
      <directionalLight position={[1, 2, 1]} intensity={0.5} />

      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.22, 0.15, 20]} />
        <meshPhysicalMaterial color="#fce7f3" roughness={0.5} metalness={0.05} clearcoat={0.1} />
      </mesh>

      <mesh position={[0, -0.12, 0]}>
        <torusGeometry args={[0.23, 0.015, 8, 20]} />
        <meshPhysicalMaterial color="#f472b6" roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.12, 20]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.5} metalness={0.05} clearcoat={0.1} />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.17, 0.012, 8, 20]} />
        <meshPhysicalMaterial color="#fcd34d" roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.1, 20]} />
        <meshPhysicalMaterial color="#f9a8d4" roughness={0.4} metalness={0.05} clearcoat={0.15} />
      </mesh>

      {[...Array(2)].map((_, i) => {
        const posX = i === 0 ? -0.05 : 0.05
        return (
          <group key={i} position={[posX, 0.28, 0]}>
            <mesh>
              <cylinderGeometry args={[0.005, 0.008, 0.07, 6]} />
              <meshPhysicalMaterial color="#fef3c7" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh ref={i === 0 ? flame1 : flame2} position={[0, 0.045, 0]}>
              <coneGeometry args={[0.015, 0.025, 6]} />
              <meshBasicMaterial color="#fcd34d" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.008, 6, 6]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
            </mesh>
          </group>
        )
      })}

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(30).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>

      <points ref={confettiRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[confettiPos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#f43f5e" transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
