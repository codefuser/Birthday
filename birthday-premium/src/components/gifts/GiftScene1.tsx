import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function GiftScene1({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  const sparkleRef = useRef<THREE.Points>(null!)
  const heartRef = useRef<THREE.Group>(null!)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(40 * 3)
    for (let i = 0; i < 40; i++) {
      p[i * 3] = (Math.random() - 0.5) * 3
      p[i * 3 + 1] = Math.random() * 2 + 0.3
      p[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    return p
  }, [])

  const chocolatePos = useMemo(() => {
    const pos: [number, number, number][] = []
    for (let x = -0.2; x <= 0.2; x += 0.2) {
      for (let z = -0.2; z <= 0.2; z += 0.2) {
        pos.push([x, 0.09, z])
      }
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.y = Math.sin(t.current * 0.3) * 0.15
      group.current.position.y = Math.sin(t.current * 0.5) * 0.06
      group.current.rotation.x = Math.sin(t.current * 0.2) * 0.02 + mouse.y * 0.05
      group.current.rotation.z = Math.cos(t.current * 0.3) * 0.02 + mouse.x * 0.05
    }
    if (lid.current) {
      lid.current.rotation.x = -0.8 + Math.sin(t.current * 0.4) * 0.05
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 40; i++) {
          op[i] = 0.3 + Math.sin(t.current * 2 + i) * 0.3
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
    if (heartRef.current) {
      heartRef.current.position.y = 0.55 + Math.sin(t.current * 1.2) * 0.08
      heartRef.current.scale.setScalar(1 + Math.sin(t.current * 1.5) * 0.08)
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <pointLight position={[1, 2, 2]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[-1, 0.5, -1]} intensity={0.4} color="#f43f5e" />

      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.18, 0.6]} />
        <meshPhysicalMaterial color="#5c2e16" roughness={0.4} metalness={0.3} clearcoat={0.2} />
      </mesh>

      <mesh ref={lid} position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.62, 0.04, 0.62]} />
        <meshPhysicalMaterial color="#7a3b1a" roughness={0.3} metalness={0.4} clearcoat={0.3} />
      </mesh>

      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshPhysicalMaterial color="#3d1e0c" roughness={0.8} metalness={0.1} />
      </mesh>

      {chocolatePos.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.08]} />
          <meshPhysicalMaterial
            color={['#3d1e0c', '#4a2810', '#2a1508', '#5c2e16'][i % 4]}
            roughness={0.3}
            metalness={0.6}
            emissive={['#fcd34d', '#f43f5e', '#a78bfa', '#34d399'][i % 4]}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(40).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.02} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>

      <group ref={heartRef}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshPhysicalMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  )
}
