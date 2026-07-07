import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WAFFLE = new THREE.MeshPhysicalMaterial({
  color: '#D4A05A', roughness: 0.9, metalness: 0,
  clearcoat: 0.05, bumpMap: undefined,
  bumpScale: 0.02,
})

const VANILLA = new THREE.MeshPhysicalMaterial({
  color: '#FFF5E6', roughness: 0.2, metalness: 0,
  clearcoat: 0.15, clearcoatRoughness: 0.3,
  envMapIntensity: 1.2,
})

const CHOCOLATE = new THREE.MeshPhysicalMaterial({
  color: '#3A1F0A', roughness: 0.25, metalness: 0.1,
  clearcoat: 0.5, clearcoatRoughness: 0.1,
  envMapIntensity: 1.5,
})

const MIST_MAT = new THREE.PointsMaterial({
  size: 0.02, color: '#fff', transparent: true,
  opacity: 0.25, sizeAttenuation: true,
  blending: THREE.AdditiveBlending, depthWrite: false,
})

export function GiftScene4() {
  const group = useRef<THREE.Group>(null!)
  const scoop1 = useRef<THREE.Mesh>(null!)
  const scoop2 = useRef<THREE.Mesh>(null!)
  const mistRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const mistPos = useMemo(() => {
    const p = new Float32Array(60 * 3)
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.05 + Math.random() * 0.2
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = 0.15 + Math.random() * 0.25
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (scoop1.current) {
      scoop1.current.position.y = 0.22 + Math.sin(t.current * 0.5) * 0.01
      const s = 1 + Math.sin(t.current * 0.4) * 0.015
      scoop1.current.scale.set(s, s, s)
    }
    if (scoop2.current) {
      scoop2.current.position.y = 0.33 + Math.sin(t.current * 0.6 + 1) * 0.01
      const s = 1 + Math.sin(t.current * 0.5 + 1) * 0.015
      scoop2.current.scale.set(s, s, s)
    }
    if (mistRef.current) {
      const op = mistRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 60; i++) {
          op[i] = 0.08 + Math.sin(t.current * 0.8 + i * 0.4) * 0.06
        }
        mistRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.18, 0.3, 20, 1, true]} />
        <primitive object={WAFFLE} attach="material" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.17, 0.3, 20]} />
        <meshBasicMaterial color="#C4944A" transparent opacity={0.3} />
      </mesh>

      <mesh ref={scoop1} position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.12, 20, 20]} />
        <primitive object={VANILLA} attach="material" />
      </mesh>

      <mesh ref={scoop2} position={[0, 0.33, 0]} castShadow>
        <sphereGeometry args={[0.1, 20, 20]} />
        <primitive object={VANILLA} attach="material" />
      </mesh>

      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.13, 0.14, 0.02, 16]} />
        <primitive object={CHOCOLATE} attach="material" />
      </mesh>

      {[...Array(5)].map((_, i) => {
        const a = i / 5 * Math.PI * 2 + 0.2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.09, 0.17, Math.cos(a) * 0.09]} rotation={[0.3, 0, a]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <primitive object={CHOCOLATE} attach="material" />
          </mesh>
        )
      })}

      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(60).fill(0.15), 1]} />
        </bufferGeometry>
        <primitive object={MIST_MAT} attach="material" />
      </points>
    </group>
  )
}
