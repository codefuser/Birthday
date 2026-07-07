import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GOLD_MAT = new THREE.MeshPhysicalMaterial({
  color: '#C8A45C', metalness: 0.85, roughness: 0.15,
  clearcoat: 0.4, clearcoatRoughness: 0.2,
  envMapIntensity: 2.5,
})

const VELVET_MAT = new THREE.MeshPhysicalMaterial({
  color: '#8B1A1A', roughness: 0.85, metalness: 0,
  clearcoat: 0.05, sheen: 0.6, sheenColor: new THREE.Color('#5C1010'),
  sheenRoughness: 0.3,
})

const DARK_CHOC = new THREE.MeshPhysicalMaterial({
  color: '#2A1506', roughness: 0.25, metalness: 0.1,
  clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.5,
})

const MILK_CHOC = new THREE.MeshPhysicalMaterial({
  color: '#4A2810', roughness: 0.2, metalness: 0.05,
  clearcoat: 0.7, clearcoatRoughness: 0.1, envMapIntensity: 1.5,
})

const WHITE_CHOC = new THREE.MeshPhysicalMaterial({
  color: '#F5E6D0', roughness: 0.15, metalness: 0,
  clearcoat: 0.8, clearcoatRoughness: 0.05, envMapIntensity: 1.5,
})

const BOX_INNER = new THREE.MeshPhysicalMaterial({
  color: '#1A0A05', roughness: 0.9, metalness: 0,
})

export function GiftScene1() {
  const group = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Group>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      p[i * 3] = (Math.random() - 0.5) * 1.2
      p[i * 3 + 1] = Math.random() * 1.0
      p[i * 3 + 2] = (Math.random() - 0.5) * 1.2
    }
    return p
  }, [])

  const chocData = useMemo(() => [
    { pos: [-0.18, 0.07, -0.18], mat: DARK_CHOC, s: [0.08, 0.04, 0.08] },
    { pos: [0.18, 0.07, -0.18], mat: MILK_CHOC, s: [0.08, 0.04, 0.08] },
    { pos: [-0.18, 0.07, 0.18], mat: WHITE_CHOC, s: [0.08, 0.04, 0.08] },
    { pos: [0.18, 0.07, 0.18], mat: DARK_CHOC, s: [0.08, 0.04, 0.08] },
    { pos: [0, 0.07, -0.1], mat: MILK_CHOC, s: [0.06, 0.035, 0.06] },
    { pos: [0, 0.07, 0.1], mat: WHITE_CHOC, s: [0.06, 0.035, 0.06] },
    { pos: [-0.1, 0.07, 0], mat: DARK_CHOC, s: [0.06, 0.035, 0.06] },
    { pos: [0.1, 0.07, 0], mat: MILK_CHOC, s: [0.06, 0.035, 0.06] },
  ], [])

  useFrame((_, delta) => {
    t.current += delta
    if (lid.current) {
      lid.current.rotation.x = -1.0 + Math.sin(t.current * 0.3) * 0.04
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 50; i++) {
          op[i] = 0.2 + Math.sin(t.current * 1.5 + i * 0.9) * 0.25
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[0.52, 0.06, 0.52]} />
        <primitive object={VELVET_MAT} attach="material" />
      </mesh>

      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.44, 0.02, 0.44]} />
        <primitive object={BOX_INNER} attach="material" />
      </mesh>

      {chocData.map((c, i) => (
        <mesh key={i} position={c.pos as [number, number, number]} castShadow>
          <boxGeometry args={c.s as [number, number, number]} />
          <primitive object={c.mat} attach="material" />
        </mesh>
      ))}

      <group ref={lid} position={[0, 0.08, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.54, 0.04, 0.54]} />
          <primitive object={GOLD_MAT} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.27]}>
          <boxGeometry args={[0.1, 0.006, 0.01]} />
          <primitive object={GOLD_MAT} attach="material" />
        </mesh>
      </group>

      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.24, 0.008, 8, 24]} />
        <primitive object={new THREE.MeshPhysicalMaterial({ color: '#C8A45C', metalness: 0.9, roughness: 0.1, envMapIntensity: 2 })} attach="material" />
      </mesh>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(50).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
