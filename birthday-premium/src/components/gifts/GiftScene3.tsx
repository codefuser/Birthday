import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function createHeartShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0.2)
  s.bezierCurveTo(0.2, 0.4, 0.4, 0.2, 0, -0.2)
  s.bezierCurveTo(-0.4, 0.2, -0.2, 0.4, 0, 0.2)
  return s
}

export function GiftScene3({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null!)
  const locketLeft = useRef<THREE.Mesh>(null!)
  const locketRight = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const heartShape = useMemo(() => createHeartShape(), [])

  const extrudeSettings = {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.015,
    bevelSegments: 10,
  }

  const sparklePos = useMemo(() => {
    const p = new Float32Array(30 * 3)
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.15 + Math.random() * 0.35
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = Math.sin(a) * r
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (group.current) {
      group.current.rotation.y = Math.sin(t.current * 0.3) * 0.2 + mouse.x * 0.1
      group.current.rotation.x = Math.sin(t.current * 0.15) * 0.05 + mouse.y * 0.06
      group.current.position.y = Math.sin(t.current * 0.4) * 0.05
    }
    if (locketLeft.current) {
      locketLeft.current.rotation.y = -0.3 + Math.sin(t.current * 0.5) * 0.05
    }
    if (locketRight.current) {
      locketRight.current.rotation.y = 0.3 + Math.sin(t.current * 0.5 + Math.PI) * 0.05
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.8 + Math.sin(t.current * 0.8) * 0.15)
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 30; i++) {
          op[i] = 0.2 + Math.sin(t.current * 1.5 + i * 0.7) * 0.3
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 1, 2]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[0, -0.5, -1]} intensity={0.3} color="#fbbf24" />

      <group position={[0, 0, 0]}>
        <mesh ref={locketLeft} position={[-0.12, 0, 0]}>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <meshPhysicalMaterial color="#fcd34d" roughness={0.15} metalness={0.9} clearcoat={0.5} envMapIntensity={2} />
        </mesh>

        <mesh ref={locketRight} position={[0.12, 0, 0]}>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <meshPhysicalMaterial color="#fcd34d" roughness={0.15} metalness={0.9} clearcoat={0.5} envMapIntensity={2} />
        </mesh>
      </group>

      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.04, 0.01, 8, 12]} />
        <meshPhysicalMaterial color="#fcd34d" roughness={0.2} metalness={0.9} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.15} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.4} />
      </mesh>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(30).fill(0.5), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
