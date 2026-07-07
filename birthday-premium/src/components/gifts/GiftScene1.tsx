import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VELVET = new THREE.MeshPhysicalMaterial({
  color: '#7A1A2A', roughness: 0.88, metalness: 0,
  sheen: 0.6, sheenColor: new THREE.Color('#5C1018'),
  sheenRoughness: 0.35, clearcoat: 0.02,
})

const GOLD = new THREE.MeshPhysicalMaterial({
  color: '#C8A45C', metalness: 0.88, roughness: 0.12,
  clearcoat: 0.35, clearcoatRoughness: 0.15, envMapIntensity: 2.8,
})

const GOLD_DIM = new THREE.MeshPhysicalMaterial({
  color: '#B8923E', metalness: 0.85, roughness: 0.25, envMapIntensity: 1.8,
})

const FOIL = new THREE.MeshPhysicalMaterial({
  color: '#E8D5A0', metalness: 0.45, roughness: 0.35,
  sheen: 0.5, sheenColor: new THREE.Color('#F5E8C0'),
})

const DARK = new THREE.MeshPhysicalMaterial({
  color: '#2A1506', roughness: 0.2, metalness: 0.08,
  clearcoat: 0.7, clearcoatRoughness: 0.08, envMapIntensity: 1.8,
})

const MILK = new THREE.MeshPhysicalMaterial({
  color: '#4A2810', roughness: 0.18, metalness: 0.04,
  clearcoat: 0.75, clearcoatRoughness: 0.08, envMapIntensity: 1.8,
})

const WHITE = new THREE.MeshPhysicalMaterial({
  color: '#F5E6D0', roughness: 0.12, metalness: 0,
  clearcoat: 0.85, clearcoatRoughness: 0.04, envMapIntensity: 1.8,
})

const TRUFFLE = new THREE.MeshPhysicalMaterial({
  color: '#3A2010', roughness: 0.4, metalness: 0.02,
  clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1.5,
})

const RIBBON = new THREE.MeshPhysicalMaterial({
  color: '#D44060', roughness: 0.45, metalness: 0.05,
  sheen: 0.5, sheenColor: new THREE.Color('#E86080'),
  sheenRoughness: 0.2, side: THREE.DoubleSide,
})

function Chocolate({ pos, mat, roundTop = false }: { pos: [number, number, number]; mat: THREE.MeshPhysicalMaterial; roundTop?: boolean }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.11, 0.035, 0.11]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {roundTop && (
        <mesh position={[0, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.052, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <primitive object={mat} attach="material" />
        </mesh>
      )}
      <mesh position={[0, 0.018, 0]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.04} />
      </mesh>
    </group>
  )
}

function Bow() {
  return (
    <group position={[0, 0.1, 0.13]}>
      <mesh position={[-0.03, 0.02, 0]} rotation={[0.2, -0.4, 0.8]}>
        <boxGeometry args={[0.07, 0.025, 0.01]} />
        <primitive object={RIBBON} attach="material" />
      </mesh>
      <mesh position={[0.03, 0.02, 0]} rotation={[0.2, 0.4, -0.8]}>
        <boxGeometry args={[0.07, 0.025, 0.01]} />
        <primitive object={RIBBON} attach="material" />
      </mesh>
      <mesh position={[-0.035, -0.01, 0]} rotation={[-0.1, -0.5, 1.5]}>
        <boxGeometry args={[0.055, 0.02, 0.01]} />
        <primitive object={RIBBON} attach="material" />
      </mesh>
      <mesh position={[0.035, -0.01, 0]} rotation={[-0.1, 0.5, -1.5]}>
        <boxGeometry args={[0.055, 0.02, 0.01]} />
        <primitive object={RIBBON} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <primitive object={new THREE.MeshPhysicalMaterial({ color: '#C83050', roughness: 0.3, metalness: 0 })} attach="material" />
      </mesh>
    </group>
  )
}

export function GiftScene1() {
  const group = useRef<THREE.Group>(null!)
  const lidRef = useRef<THREE.Group>(null!)
  const bowRef = useRef<THREE.Group>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(40 * 3)
    for (let i = 0; i < 40; i++) {
      p[i * 3] = (Math.random() - 0.5) * 1.0
      p[i * 3 + 1] = Math.random() * 0.7
      p[i * 3 + 2] = (Math.random() - 0.5) * 1.0
    }
    return p
  }, [])

  const chocData = useMemo(() => [
    { pos: [-0.16, 0.045, -0.16] as [number, number, number], mat: DARK, round: true },
    { pos: [0, 0.045, -0.16] as [number, number, number], mat: MILK, round: false },
    { pos: [0.16, 0.045, -0.16] as [number, number, number], mat: WHITE, round: true },
    { pos: [-0.16, 0.045, 0] as [number, number, number], mat: TRUFFLE, round: false },
    { pos: [0, 0.045, 0] as [number, number, number], mat: DARK, round: true },
    { pos: [0.16, 0.045, 0] as [number, number, number], mat: MILK, round: false },
    { pos: [-0.16, 0.045, 0.16] as [number, number, number], mat: WHITE, round: true },
    { pos: [0, 0.045, 0.16] as [number, number, number], mat: TRUFFLE, round: false },
    { pos: [0.16, 0.045, 0.16] as [number, number, number], mat: DARK, round: true },
  ], [])

  useFrame((_, delta) => {
    t.current += delta
    if (lidRef.current) {
      lidRef.current.rotation.x = -0.85 + Math.sin(t.current * 0.2) * 0.03
    }
    if (bowRef.current) {
      bowRef.current.position.y = 0.12 + Math.sin(t.current * 0.3) * 0.008
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 40; i++) {
          op[i] = 0.15 + Math.sin(t.current * 1.2 + i * 0.8) * 0.2
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.015, 0]} castShadow>
        <boxGeometry args={[0.56, 0.05, 0.56]} />
        <primitive object={VELVET} attach="material" />
      </mesh>

      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.48, 0.02, 0.48]} />
        <primitive object={FOIL} attach="material" />
      </mesh>

      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.56, 0.005, 0.56]} />
        <primitive object={GOLD_DIM} attach="material" />
      </mesh>

      {chocData.map((c, i) => (
        <Chocolate key={i} pos={c.pos} mat={c.mat} roundTop={c.round} />
      ))}

      <group ref={lidRef} position={[0, 0.09, 0]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <boxGeometry args={[0.58, 0.03, 0.58]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.29]}>
          <boxGeometry args={[0.46, 0.006, 0.008]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
        <mesh position={[0, 0, -0.29]}>
          <boxGeometry args={[0.46, 0.006, 0.008]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
        <mesh position={[0.29, 0, 0]}>
          <boxGeometry args={[0.008, 0.006, 0.46]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
      </group>

      <mesh position={[0, 0.04, 0.28]}>
        <torusGeometry args={[0.24, 0.006, 8, 32]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      <group ref={bowRef}>
        <Bow />
      </group>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(40).fill(0.4), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.01} color="#fcd34d" transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
