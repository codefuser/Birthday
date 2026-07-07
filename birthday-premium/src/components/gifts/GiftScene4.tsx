import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function GiftScene4({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null!)
  const scoop1 = useRef<THREE.Mesh>(null!)
  const scoop2 = useRef<THREE.Mesh>(null!)
  const mistRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const mistPos = useMemo(() => {
    const p = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.05 + Math.random() * 0.25
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = 0.25 + Math.random() * 0.2
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.y = Math.sin(t.current * 0.25) * 0.2 + mouse.x * 0.08
      group.current.rotation.x = Math.sin(t.current * 0.1) * 0.03 + mouse.y * 0.04
      group.current.position.y = Math.sin(t.current * 0.45) * 0.05
    }
    if (scoop1.current) {
      scoop1.current.position.y = 0.22 + Math.sin(t.current * 0.6) * 0.01
      scoop1.current.scale.setScalar(1 + Math.sin(t.current * 0.5) * 0.02)
    }
    if (scoop2.current) {
      scoop2.current.position.y = 0.34 + Math.sin(t.current * 0.7 + 1) * 0.01
      scoop2.current.scale.setScalar(1 + Math.sin(t.current * 0.6 + 1) * 0.02)
    }
    if (mistRef.current) {
      const op = mistRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 50; i++) {
          op[i] = 0.1 + Math.sin(t.current + i * 0.3) * 0.06
        }
        mistRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#fce7f3', '#0a0a1a', 0.5]} />
      <directionalLight position={[2, 3, 2]} intensity={0.7} />
      <pointLight position={[0, 0.5, 1.5]} intensity={0.3} color="#34d399" />

      <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.18, 0.3, 16, 1, true]} />
        <meshPhysicalMaterial color="#D4A574" roughness={0.8} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.01, 0.3, 16]} />
        <meshBasicMaterial color="#C4956A" transparent opacity={0.3} />
      </mesh>

      <mesh ref={scoop1} position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial color="#FFB5C5" roughness={0.2} metalness={0.05} clearcoat={0.2} />
      </mesh>

      <mesh ref={scoop2} position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial color="#FFD4A8" roughness={0.2} metalness={0.05} clearcoat={0.2} />
      </mesh>

      {[...Array(4)].map((_, i) => {
        const a = i / 4 * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.08, 0.18, Math.cos(a) * 0.08]} rotation={[0, 0, 0.3]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshPhysicalMaterial color="#5c2e16" roughness={0.3} metalness={0.1} />
          </mesh>
        )
      })}

      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(50).fill(0.2), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#fff" transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
