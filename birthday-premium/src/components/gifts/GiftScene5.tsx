import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROSE_RED = new THREE.MeshPhysicalMaterial({
  color: '#C41E3A', roughness: 0.3, metalness: 0,
  clearcoat: 0.2, clearcoatRoughness: 0.3,
  envMapIntensity: 0.8,
})

const ROSE_PINK = new THREE.MeshPhysicalMaterial({
  color: '#D4608A', roughness: 0.3, metalness: 0,
  clearcoat: 0.2, clearcoatRoughness: 0.3,
  envMapIntensity: 0.8,
})

const ROSE_GOLD = new THREE.MeshPhysicalMaterial({
  color: '#E8B878', roughness: 0.3, metalness: 0.05,
  clearcoat: 0.15,
})

const ROSE_WHITE = new THREE.MeshPhysicalMaterial({
  color: '#F5ECE0', roughness: 0.25, metalness: 0,
  clearcoat: 0.15,
})

const STEM_MAT = new THREE.MeshPhysicalMaterial({
  color: '#2D5A1E', roughness: 0.85, metalness: 0,
})

const LEAF_MAT = new THREE.MeshPhysicalMaterial({
  color: '#3A7A2E', roughness: 0.7, metalness: 0,
  clearcoat: 0.1,
})

const WRAP_MAT = new THREE.MeshPhysicalMaterial({
  color: '#F5E6D0', roughness: 0.6, metalness: 0,
  clearcoat: 0.05, sheen: 0.3, sheenColor: new THREE.Color('#FFF5E6'),
  side: THREE.DoubleSide,
})

function Petal(pos: [number, number, number], color: THREE.MeshPhysicalMaterial, rot: [number, number, number], sc = 1) {
  return (
    <mesh key={`${pos[0]}-${pos[1]}`} position={pos} rotation={rot} scale={sc}>
      <sphereGeometry args={[0.028, 8, 8]} />
      <primitive object={color} attach="material" />
    </mesh>
  )
}

function Rose({ pos, color, phase }: { pos: [number, number, number]; color: THREE.MeshPhysicalMaterial; phase: number }) {
  const group = useRef<THREE.Group>(null!)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.z = Math.sin(t.current * 0.3 + phase) * 0.04
      group.current.rotation.x = Math.sin(t.current * 0.25 + phase * 1.2) * 0.03
    }
  })

  return (
    <group ref={group} position={pos}>
      {[...Array(6)].map((_, i) => {
        const a = i / 6 * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.035, 0, Math.cos(a) * 0.035]} rotation={[0.1, 0, a]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <primitive object={color} attach="material" />
          </mesh>
        )
      })}
      <mesh position={[0, 0.005, 0]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <primitive object={ROSE_GOLD} attach="material" />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <primitive object={STEM_MAT} attach="material" />
      </mesh>
    </group>
  )
}

export function GiftScene5() {
  const group = useRef<THREE.Group>(null!)
  const leafRef = useRef<THREE.Group>(null!)
  const petalRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const flowers = useMemo(() => [
    { pos: [0, 0.2, 0] as [number, number, number], color: ROSE_RED, phase: 0 },
    { pos: [-0.09, 0.15, 0.08] as [number, number, number], color: ROSE_PINK, phase: 1.5 },
    { pos: [0.09, 0.15, -0.07] as [number, number, number], color: ROSE_WHITE, phase: 3 },
    { pos: [-0.06, 0.12, -0.09] as [number, number, number], color: ROSE_GOLD, phase: 4.5 },
    { pos: [0.07, 0.12, 0.09] as [number, number, number], color: ROSE_PINK, phase: 2 },
    { pos: [0, 0.25, 0.05] as [number, number, number], color: ROSE_RED, phase: 1 },
    { pos: [0.05, 0.22, -0.06] as [number, number, number], color: ROSE_WHITE, phase: 3.5 },
  ], [])

  const petalPos = useMemo(() => {
    const p = new Float32Array(20 * 3)
    for (let i = 0; i < 20; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.3
      p[i * 3 + 1] = Math.random() * 0.35
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (leafRef.current) {
      leafRef.current.rotation.y = Math.sin(t.current * 0.15) * 0.06
    }
    if (petalRef.current) {
      const op = petalRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 20; i++) {
          op[i] = 0.08 + Math.sin(t.current * 0.4 + i) * 0.08
        }
        petalRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      {flowers.map((f, i) => (
        <Rose key={i} pos={f.pos} color={f.color} phase={f.phase} />
      ))}

      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.1, 0.06, 0.14, 12]} />
        <primitive object={STEM_MAT} attach="material" />
      </mesh>

      <group ref={leafRef}>
        {[...Array(4)].map((_, i) => {
          const a = i / 4 * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(a) * 0.08, 0.08, Math.cos(a) * 0.08]} rotation={[0.3, a, 0.2]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <primitive object={LEAF_MAT} attach="material" />
            </mesh>
          )
        })}
      </group>

      <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.12, 0.1, 16]} />
        <primitive object={WRAP_MAT} attach="material" />
      </mesh>

      <points ref={petalRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(20).fill(0.15), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.008} color="#D4608A" transparent opacity={0.25} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
