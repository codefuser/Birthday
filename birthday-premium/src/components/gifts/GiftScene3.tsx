import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GOLD = new THREE.MeshPhysicalMaterial({
  color: '#D4A843', metalness: 0.95, roughness: 0.08,
  clearcoat: 0.3, clearcoatRoughness: 0.1, envMapIntensity: 3.5,
})

const GOLD_DARK = new THREE.MeshPhysicalMaterial({
  color: '#B8922E', metalness: 0.95, roughness: 0.15, envMapIntensity: 2.5,
})

const GEM = new THREE.MeshPhysicalMaterial({
  color: '#E84070', roughness: 0.05, metalness: 0,
  clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 4,
  transmission: 0.35, thickness: 0.6, ior: 2.5,
})

const GEM_GLOW = new THREE.MeshPhysicalMaterial({
  color: '#FF6088', roughness: 0.1, metalness: 0,
  clearcoat: 0.5, envMapIntensity: 2, transparent: true, opacity: 0.35,
})

const INNER_GLOW = new THREE.MeshBasicMaterial({
  color: '#FCD34D', transparent: true, opacity: 0.2,
})

const CHAIN = new THREE.MeshPhysicalMaterial({
  color: '#C8A05C', metalness: 0.9, roughness: 0.25, envMapIntensity: 2,
})

function HeartExtrude({ sc = 1, mat, depth = 0.05 }: { sc?: number; mat: THREE.MeshPhysicalMaterial; depth?: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0.25)
    s.bezierCurveTo(0.25, 0.5, 0.5, 0.25, 0, -0.25)
    s.bezierCurveTo(-0.5, 0.25, -0.25, 0.5, 0, 0.25)
    return s
  }, [])
  return (
    <mesh scale={sc}>
      <extrudeGeometry args={[shape, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 8 }]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function ChainLink({ pos, rot }: { pos: [number, number, number]; rot: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={rot}>
      <torusGeometry args={[0.008, 0.003, 6, 8]} />
      <primitive object={CHAIN} attach="material" />
    </mesh>
  )
}

export function GiftScene3() {
  const group = useRef<THREE.Group>(null!)
  const leftDoor = useRef<THREE.Group>(null!)
  const rightDoor = useRef<THREE.Group>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const gemRef = useRef<THREE.Mesh>(null!)
  const sparkleRef = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const sparklePos = useMemo(() => {
    const p = new Float32Array(25 * 3)
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.1 + Math.random() * 0.35
      p[i * 3] = Math.cos(a) * r
      p[i * 3 + 1] = Math.sin(a) * r
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.06
    }
    return p
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (leftDoor.current) {
      leftDoor.current.rotation.y = -0.4 + Math.sin(t.current * 0.25) * 0.04
    }
    if (rightDoor.current) {
      rightDoor.current.rotation.y = 0.4 + Math.sin(t.current * 0.25 + Math.PI) * 0.04
    }
    if (glowRef.current) {
      const s = 0.6 + Math.sin(t.current * 0.5) * 0.1
      glowRef.current.scale.setScalar(s)
    }
    if (gemRef.current) {
      gemRef.current.position.y = 0.03 + Math.sin(t.current * 0.4) * 0.005
    }
    if (sparkleRef.current) {
      const op = sparkleRef.current.geometry.attributes.opacity?.array as Float32Array
      if (op) {
        for (let i = 0; i < 25; i++) {
          op[i] = 0.15 + Math.sin(t.current * 1.0 + i * 0.6) * 0.25
        }
        sparkleRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    }
  })

  return (
    <group ref={group}>
      {[-0.07, -0.03, 0.03, 0.07].map((x, i) => (
        <ChainLink key={i} pos={[x, 0.42, 0]} rot={[0, 0, i % 2 === 0 ? 0.5 : -0.5]} />
      ))}
      {[-0.05, 0.05].map((x, i) => (
        <ChainLink key={i + 4} pos={[x, 0.45, 0]} rot={[0, 0, 0]} />
      ))}
      <ChainLink pos={[0, 0.47, 0]} rot={[Math.PI / 2, 0, 0]} />

      <group position={[0, 0.32, 0]}>
        <torusGeometry args={[0.028, 0.007, 8, 12]} />
        <primitive object={GOLD} attach="material" />
      </group>

      <group position={[0, 0, 0]}>
        <group ref={leftDoor} position={[-0.11, 0, 0]}>
          <HeartExtrude mat={GOLD} depth={0.045} />
          <mesh position={[0, 0, -0.024]}>
            <HeartExtrude mat={GOLD_DARK} depth={0.008} sc={0.8} />
          </mesh>
        </group>
        <group ref={rightDoor} position={[0.11, 0, 0]}>
          <HeartExtrude mat={GOLD} depth={0.045} />
          <mesh position={[0, 0, -0.024]}>
            <HeartExtrude mat={GOLD_DARK} depth={0.008} sc={0.8} />
          </mesh>
        </group>
      </group>

      <mesh ref={glowRef} position={[0, 0, 0.04]}>
        <planeGeometry args={[0.18, 0.22]} />
        <primitive object={INNER_GLOW} attach="material" />
      </mesh>

      <mesh ref={gemRef} position={[0, 0.03, 0.065]}>
        <octahedronGeometry args={[0.025, 0]} />
        <primitive object={GEM} attach="material" />
      </mesh>

      <mesh position={[0, 0.03, 0.065]}>
        <octahedronGeometry args={[0.038, 0]} />
        <primitive object={GEM_GLOW} attach="material" />
      </mesh>

      <mesh position={[0, -0.01, 0.055]}>
        <ringGeometry args={[0.002, 0.012, 16]} />
        <primitive object={GOLD_DARK} attach="material" />
      </mesh>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePos, 3]} />
          <bufferAttribute attach="attributes-opacity" args={[new Float32Array(25).fill(0.4), 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.006} color="#fcd34d" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
