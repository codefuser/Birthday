import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROSE_RED = new THREE.MeshPhysicalMaterial({
  color: '#C41E3A', roughness: 0.3, metalness: 0,
  clearcoat: 0.2, clearcoatRoughness: 0.3, envMapIntensity: 0.8,
})

const ROSE_PINK = new THREE.MeshPhysicalMaterial({
  color: '#D4608A', roughness: 0.3, metalness: 0,
  clearcoat: 0.2, clearcoatRoughness: 0.3, envMapIntensity: 0.8,
})

const ROSE_WHITE = new THREE.MeshPhysicalMaterial({
  color: '#F5ECE0', roughness: 0.25, metalness: 0,
  clearcoat: 0.15, envMapIntensity: 0.6,
})

const ROSE_GOLD = new THREE.MeshPhysicalMaterial({
  color: '#F0C878', roughness: 0.3, metalness: 0.05,
  clearcoat: 0.15, envMapIntensity: 1,
})

const ROSE_BURGUNDY = new THREE.MeshPhysicalMaterial({
  color: '#6E1028', roughness: 0.35, metalness: 0,
  clearcoat: 0.25, envMapIntensity: 0.8,
})

const STEM = new THREE.MeshPhysicalMaterial({
  color: '#2D5A1E', roughness: 0.85, metalness: 0,
})

const LEAF = new THREE.MeshPhysicalMaterial({
  color: '#3A7A2E', roughness: 0.7, metalness: 0,
  clearcoat: 0.08, side: THREE.DoubleSide,
})

const WRAP = new THREE.MeshPhysicalMaterial({
  color: '#EDE0CC', roughness: 0.55, metalness: 0,
  sheen: 0.3, sheenColor: new THREE.Color('#F8F0E0'),
  side: THREE.DoubleSide,
})

const WRAP_INNER = new THREE.MeshPhysicalMaterial({
  color: '#E8D5B8', roughness: 0.7, metalness: 0,
  side: THREE.DoubleSide,
})

const BOW = new THREE.MeshPhysicalMaterial({
  color: '#D44060', roughness: 0.4, metalness: 0.05,
  sheen: 0.5, sheenColor: new THREE.Color('#E86080'),
  sheenRoughness: 0.2, side: THREE.DoubleSide,
})

function RosePetal({ pos, rot, sc, color }: { pos: [number, number, number]; rot: [number, number, number]; sc: number; color: THREE.MeshPhysicalMaterial }) {
  return (
    <mesh position={pos} rotation={rot} scale={sc}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <primitive object={color} attach="material" />
    </mesh>
  )
}

function Rose({ pos, color, centerColor, phase }: { pos: [number, number, number]; color: THREE.MeshPhysicalMaterial; centerColor: THREE.MeshPhysicalMaterial; phase: number }) {
  const g = useRef<THREE.Group>(null!)
  const t = useRef(0)

  const petals = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number]; sc: number }[] = []

    for (let ring = 0; ring < 5; ring++) {
      const count = 4 + ring * 2
      const r = 0.02 + ring * 0.008
      const yOff = ring * 0.004
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2 + ring * 0.5
        arr.push({
          pos: [Math.sin(a) * r, yOff, Math.cos(a) * r] as [number, number, number],
          rot: [0.1 + ring * 0.02, 0, a + 0.2] as [number, number, number],
          sc: 0.6 + ring * 0.08,
        })
      }
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (g.current) {
      g.current.rotation.z = Math.sin(t.current * 0.25 + phase) * 0.03
      g.current.rotation.x = Math.sin(t.current * 0.2 + phase * 1.2) * 0.025
    }
  })

  return (
    <group ref={g} position={pos}>
      {petals.map((p, i) => (
        <RosePetal key={i} pos={p.pos} rot={p.rot} sc={p.sc} color={color} />
      ))}
      <mesh position={[0, 0.008, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <primitive object={centerColor} attach="material" />
      </mesh>
    </group>
  )
}

function Leaf({ pos, rot }: { pos: [number, number, number]; rot: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={rot}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <primitive object={LEAF} attach="material" />
    </mesh>
  )
}

export function GiftScene5() {
  const group = useRef<THREE.Group>(null!)
  const wrapRef = useRef<THREE.Mesh>(null!)
  const petalRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const flowers = useMemo(() => [
    { pos: [0, 0.2, 0] as [number, number, number], color: ROSE_RED, center: ROSE_BURGUNDY, phase: 0 },
    { pos: [-0.08, 0.15, 0.09] as [number, number, number], color: ROSE_PINK, center: ROSE_RED, phase: 1.5 },
    { pos: [0.08, 0.15, -0.08] as [number, number, number], color: ROSE_WHITE, center: ROSE_GOLD, phase: 3 },
    { pos: [-0.07, 0.12, -0.1] as [number, number, number], color: ROSE_GOLD, center: ROSE_WHITE, phase: 4.5 },
    { pos: [0.07, 0.12, 0.1] as [number, number, number], color: ROSE_PINK, center: ROSE_RED, phase: 2 },
    { pos: [0, 0.25, 0.06] as [number, number, number], color: ROSE_BURGUNDY, center: ROSE_RED, phase: 1 },
    { pos: [0.06, 0.22, -0.07] as [number, number, number], color: ROSE_WHITE, center: ROSE_GOLD, phase: 3.5 },
  ], [])

  const leafPos = useMemo(() => [
    { pos: [0.04, 0.06, 0.07] as [number, number, number], rot: [0.2, 0.3, 0.4] as [number, number, number] },
    { pos: [-0.04, 0.06, -0.07] as [number, number, number], rot: [-0.2, -0.3, -0.4] as [number, number, number] },
    { pos: [0.07, 0.05, -0.03] as [number, number, number], rot: [0.3, -0.2, 0.5] as [number, number, number] },
    { pos: [-0.07, 0.05, 0.03] as [number, number, number], rot: [-0.3, 0.2, -0.5] as [number, number, number] },
    { pos: [0.03, 0.08, -0.06] as [number, number, number], rot: [0.4, 0.1, 0.6] as [number, number, number] },
    { pos: [-0.03, 0.08, 0.06] as [number, number, number], rot: [-0.4, -0.1, -0.6] as [number, number, number] },
  ], [])

  const petalPos = useMemo(() => {
    const p = new Float32Array(16 * 3)
    for (let i = 0; i < 16; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.35
      p[i * 3 + 1] = Math.random() * 0.35
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.35
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (wrapRef.current) {
      wrapRef.current.rotation.y = Math.sin(t.current * 0.08) * 0.02
    }
    if (petalRef.current) {
      const op = petalRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 16; i++) {
          op[i] = 0.05 + Math.sin(t.current * 0.3 + i * 0.5) * 0.05
        }
        petalRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      {flowers.map((f, i) => (
        <Rose key={i} pos={f.pos} color={f.color} centerColor={f.center} phase={f.phase} />
      ))}

      {leafPos.map((l, i) => (
        <Leaf key={i} pos={l.pos} rot={l.rot} />
      ))}

      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.08, 0.04, 0.18, 12]} />
        <primitive object={STEM} attach="material" />
      </mesh>

      <mesh ref={wrapRef} position={[0, -0.06, 0]}>
        <coneGeometry args={[0.12, 0.12, 24]} />
        <primitive object={WRAP} attach="material" />
      </mesh>

      <mesh position={[0, -0.02, 0]} rotation={[0, 0.2, 0]}>
        <coneGeometry args={[0.1, 0.08, 24]} />
        <primitive object={WRAP_INNER} attach="material" />
      </mesh>

      <mesh position={[-0.04, -0.01, 0.08]} rotation={[0.1, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.003, 0.02]} />
        <primitive object={BOW} attach="material" />
      </mesh>
      <mesh position={[0.04, -0.01, 0.08]} rotation={[0.1, 0, -0.3]}>
        <boxGeometry args={[0.08, 0.003, 0.02]} />
        <primitive object={BOW} attach="material" />
      </mesh>
      <mesh position={[0, -0.01, 0.09]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshBasicMaterial color="#C83050" />
      </mesh>

      <points ref={petalRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(16).fill(0.1), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.006} color="#D4608A" transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
