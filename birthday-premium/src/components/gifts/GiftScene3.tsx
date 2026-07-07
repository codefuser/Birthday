import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GOLD = new THREE.MeshPhysicalMaterial({
  color: '#D4A843', metalness: 0.95, roughness: 0.08,
  clearcoat: 0.3, clearcoatRoughness: 0.1,
  envMapIntensity: 3,
})

const GOLD_DARK = new THREE.MeshPhysicalMaterial({
  color: '#B8922E', metalness: 0.95, roughness: 0.12,
  envMapIntensity: 2.5,
})

const GLOW_INNER = new THREE.MeshPhysicalMaterial({
  color: '#2A1A00', roughness: 0.6, metalness: 0.4,
  envMapIntensity: 1,
})

const GEM_MAT = new THREE.MeshPhysicalMaterial({
  color: '#E84070', roughness: 0.1, metalness: 0,
  clearcoat: 1, clearcoatRoughness: 0.02,
  envMapIntensity: 3,
  transmission: 0.3, thickness: 0.5,
})

function createHeartShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0.25)
  s.bezierCurveTo(0.25, 0.5, 0.5, 0.25, 0, -0.25)
  s.bezierCurveTo(-0.5, 0.25, -0.25, 0.5, 0, 0.25)
  return s
}

export function GiftScene3() {
  const group = useRef<THREE.Group>(null!)
  const locketLeft = useRef<THREE.Mesh>(null!)
  const locketRight = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const heartShape = useMemo(() => createHeartShape(), [])
  const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.012, bevelSegments: 8 }

  const sparklePos = useMemo(() => {
    const p = new Float32Array(30 * 3)
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.1 + Math.random() * 0.4
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = Math.sin(a) * r
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.08
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (locketLeft.current) {
      locketLeft.current.rotation.y = -0.35 + Math.sin(t.current * 0.4) * 0.04
    }
    if (locketRight.current) {
      locketRight.current.rotation.y = 0.35 + Math.sin(t.current * 0.4 + Math.PI) * 0.04
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.7 + Math.sin(t.current * 0.6) * 0.15)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.12 + Math.sin(t.current * 0.8) * 0.06
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 30; i++) {
          op[i] = 0.2 + Math.sin(t.current * 1.2 + i * 0.7) * 0.3
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.035, 0.008, 8, 12]} />
        <primitive object={GOLD} attach="material" />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh ref={locketLeft} position={[-0.1, 0, 0]}>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
        <mesh ref={locketRight} position={[0.1, 0, 0]}>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <primitive object={GOLD} attach="material" />
        </mesh>
      </group>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.14, 0.18]} />
        <primitive object={GLOW_INNER} attach="material" />
      </mesh>

      <mesh position={[0, 0.03, 0.07]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <primitive object={GEM_MAT} attach="material" />
      </mesh>

      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.3} />
      </mesh>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(30).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.008} color="#fcd34d" transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
