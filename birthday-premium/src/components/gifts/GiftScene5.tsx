import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Flower({ pos, color, phase, stemH = 0.3 }: { pos: [number, number, number]; color: string; phase: number; stemH?: number }) {
  const group = useRef<THREE.Group>(null!)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.z = Math.sin(t.current * 0.4 + phase) * 0.04
      group.current.rotation.x = Math.sin(t.current * 0.3 + phase) * 0.03
    }
  })

  return (
    <group ref={group} position={pos}>
      <mesh position={[0, -stemH / 2, 0]}>
        <cylinderGeometry args={[0.01, 0.012, stemH, 6]} />
        <meshPhysicalMaterial color="#2d5a1e" roughness={0.8} />
      </mesh>

      {[...Array(6)].map((_, i) => {
        const a = i / 6 * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.04, 0, Math.cos(a) * 0.04]} rotation={[0, 0, a]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.2} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.005, 0]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshPhysicalMaterial color="#fcd34d" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function GiftScene5({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null!)
  const leafRef = useRef<THREE.Group>(null!)
  const petalRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const flowers = useMemo(() => [
    { pos: [0, 0.15, 0] as [number, number, number], color: '#f43f5e', phase: 0, stemH: 0.25 },
    { pos: [-0.08, 0.12, 0.07] as [number, number, number], color: '#f472b6', phase: 1, stemH: 0.22 },
    { pos: [0.08, 0.12, -0.06] as [number, number, number], color: '#fb7185', phase: 2, stemH: 0.22 },
    { pos: [-0.05, 0.1, -0.08] as [number, number, number], color: '#fcd34d', phase: 3, stemH: 0.2 },
    { pos: [0.06, 0.1, 0.08] as [number, number, number], color: '#a78bfa', phase: 4, stemH: 0.2 },
  ], [])

  const petalPos = useMemo(() => {
    const p = new Float32Array(20 * 3)
    for (let i = 0; i < 20; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.4
      p[i * 3 + 1] = Math.random() * 0.4
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.y = Math.sin(t.current * 0.15) * 0.25 + mouse.x * 0.1
      group.current.rotation.x = Math.sin(t.current * 0.08) * 0.03 + mouse.y * 0.06
      group.current.position.y = Math.sin(t.current * 0.35) * 0.04
    }
    if (leafRef.current) {
      leafRef.current.rotation.y = Math.sin(t.current * 0.2) * 0.05
    }
    if (petalRef.current) {
      const op = petalRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 20; i++) {
          op[i] = 0.1 + Math.sin(t.current * 0.5 + i) * 0.1
        }
        petalRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#fce7f3', '#1a1a2e', 0.4]} />
      <directionalLight position={[2, 3, 2]} intensity={0.6} />
      <pointLight position={[-0.5, 0.5, 1]} intensity={0.3} color="#f472b6" />

      {flowers.map((f, i) => (
        <Flower key={i} pos={f.pos} color={f.color} phase={f.phase} stemH={f.stemH} />
      ))}

      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.08, 0.15, 12]} />
        <meshPhysicalMaterial color="#4a7c3f" roughness={0.8} metalness={0} />
      </mesh>

      <group ref={leafRef}>
        {[...Array(3)].map((_, i) => {
          const a = i / 3 * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(a) * 0.1, 0.08, Math.cos(a) * 0.1]} rotation={[0, a, 0.4]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshPhysicalMaterial color="#3a6b2e" roughness={0.8} />
            </mesh>
          )
        })}
      </group>

      <points ref={petalRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(20).fill(0.2), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} color="#f472b6" transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
