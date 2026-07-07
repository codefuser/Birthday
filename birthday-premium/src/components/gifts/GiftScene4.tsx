import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CONE = new THREE.MeshPhysicalMaterial({
  color: '#D4A05A', roughness: 0.85, metalness: 0,
  clearcoat: 0.02, bumpScale: 0.03,
})

const VANILLA = new THREE.MeshPhysicalMaterial({
  color: '#FFF5E6', roughness: 0.18, metalness: 0,
  clearcoat: 0.1, clearcoatRoughness: 0.3, envMapIntensity: 1.2,
})

const STRAWBERRY = new THREE.MeshPhysicalMaterial({
  color: '#F5C4D0', roughness: 0.2, metalness: 0,
  clearcoat: 0.08, envMapIntensity: 1,
})

const CHOCOLATE = new THREE.MeshPhysicalMaterial({
  color: '#3A1F0A', roughness: 0.2, metalness: 0.08,
  clearcoat: 0.5, clearcoatRoughness: 0.08, envMapIntensity: 1.5,
})

const SAUCE = new THREE.MeshPhysicalMaterial({
  color: '#2A1506', roughness: 0.25, metalness: 0.05,
  clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.3,
})

const CHERRY = new THREE.MeshPhysicalMaterial({
  color: '#CC2040', roughness: 0.3, metalness: 0.05,
  clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 2,
})

const WAFER = new THREE.MeshPhysicalMaterial({
  color: '#E8C888', roughness: 0.7, metalness: 0,
  side: THREE.DoubleSide,
})

export function GiftScene4() {
  const group = useRef<THREE.Group>(null!)
  const scoop1 = useRef<THREE.Mesh>(null!)
  const scoop2 = useRef<THREE.Mesh>(null!)
  const scoop3 = useRef<THREE.Mesh>(null!)
  const cherryRef = useRef<THREE.Mesh>(null!)
  const mistRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const mistPos = useMemo(() => {
    const p = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.06 + Math.random() * 0.18
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = 0.15 + Math.random() * 0.4
      p[i * 3 + 2] = Math.sin(a) * r
    }
    return p
  }, [])

  const drizzlePos = useMemo(() => {
    const p = new Float32Array(8 * 3)
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2
      p[i * 3] = Math.sin(a) * 0.13
      p[i * 3 + 1] = 0
      p[i * 3 + 2] = Math.cos(a) * 0.13
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (scoop1.current) {
      scoop1.current.position.y = 0.2 + Math.sin(t.current * 0.35) * 0.006
    }
    if (scoop2.current) {
      scoop2.current.position.y = 0.32 + Math.sin(t.current * 0.45 + 1) * 0.006
    }
    if (scoop3.current) {
      scoop3.current.position.y = 0.42 + Math.sin(t.current * 0.55 + 2) * 0.006
    }
    if (cherryRef.current) {
      cherryRef.current.position.y = 0.52 + Math.sin(t.current * 0.5) * 0.005
    }
    if (mistRef.current) {
      const op = mistRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 50; i++) {
          op[i] = 0.06 + Math.sin(t.current * 0.6 + i * 0.3) * 0.05
        }
        mistRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.18, 0.28, 20, 1, true]} />
        <primitive object={CONE} attach="material" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.03, 0.17, 0.28, 20]} />
        <meshBasicMaterial color="#C4944A" transparent opacity={0.25} />
      </mesh>

      {[...Array(8)].map((_, i) => {
        const a = i / 8 * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.13, -0.06, Math.cos(a) * 0.13]} rotation={[0.3, 0, a]}>
            <boxGeometry args={[0.003, 0.04, 0.003]} />
            <meshBasicMaterial color="#B88A44" />
          </mesh>
        )
      })}

      <mesh ref={scoop1} position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.12, 20, 20]} />
        <primitive object={VANILLA} attach="material" />
      </mesh>

      <mesh ref={scoop2} position={[0.01, 0.32, -0.01]} castShadow>
        <sphereGeometry args={[0.1, 20, 20]} />
        <primitive object={STRAWBERRY} attach="material" />
      </mesh>

      <mesh ref={scoop3} position={[-0.01, 0.42, 0.01]} castShadow>
        <sphereGeometry args={[0.085, 20, 20]} />
        <primitive object={CHOCOLATE} attach="material" />
      </mesh>

      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.015, 16]} />
        <primitive object={SAUCE} attach="material" />
      </mesh>

      {[...Array(5)].map((_, i) => {
        const a = i / 5 * Math.PI * 2 + 0.3
        return (
          <mesh key={i} position={[Math.sin(a) * 0.1, 0.16, Math.cos(a) * 0.1]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <primitive object={SAUCE} attach="material" />
          </mesh>
        )
      })}

      <mesh ref={cherryRef} position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.025, 10, 10]} />
        <primitive object={CHERRY} attach="material" />
      </mesh>

      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.015, 4]} />
        <meshBasicMaterial color="#2A5A1E" />
      </mesh>

      <mesh position={[0.06, 0.46, -0.04]} rotation={[0.2, -0.3, 0.5]}>
        <boxGeometry args={[0.07, 0.002, 0.04]} />
        <primitive object={WAFER} attach="material" />
      </mesh>

      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(50).fill(0.12), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} color="#fff" transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
