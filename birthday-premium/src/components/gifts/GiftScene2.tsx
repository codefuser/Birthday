import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Heart({ pos, sc = 1, color = '#f43f5e' }: { pos: [number, number, number]; sc?: number; color?: string }) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.15)
  shape.bezierCurveTo(0.15, 0.3, 0.3, 0.15, 0, -0.15)
  shape.bezierCurveTo(-0.3, 0.15, -0.15, 0.3, 0, 0.15)
  return (
    <mesh position={pos} scale={sc} rotation={[0, 0, Math.PI]}>
      <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 8 }]} />
      <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.3} emissive={color} emissiveIntensity={0.1} />
    </mesh>
  )
}

export function GiftScene2() {
  const group = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const heartRef = useRef<THREE.Group>(null!)
  const t = useRef(0)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (head.current) {
      head.current.rotation.z = Math.sin(t.current * 0.3) * 0.03
      head.current.rotation.x = Math.sin(t.current * 0.2) * 0.02
    }
    if (armL.current) armL.current.rotation.z = 0.2 + Math.sin(t.current * 0.8) * 0.08
    if (armR.current) armR.current.rotation.z = -0.2 + Math.sin(t.current * 0.7 + 1) * 0.08
    if (heartRef.current) {
      heartRef.current.position.y = Math.sin(t.current * 0.9) * 0.04
      heartRef.current.scale.setScalar(1 + Math.sin(t.current * 1.1) * 0.05)
    }
  })

  const brownMat = new THREE.MeshPhysicalMaterial({ color: '#8B5E3C', roughness: 0.7, metalness: 0.05 })
  const lightBrownMat = new THREE.MeshPhysicalMaterial({ color: '#C4956A', roughness: 0.6, metalness: 0.05 })
  const darkMat = new THREE.MeshPhysicalMaterial({ color: '#2a1200', roughness: 0.9 })
  const pinkMat = new THREE.MeshPhysicalMaterial({ color: '#FFB6C1', roughness: 0.5 })

  return (
    <group ref={group}>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#fce7f3', '#1a1a2e', 0.4]} />
      <directionalLight position={[2, 3, 2]} intensity={0.8} />
      <pointLight position={[-1, 0.5, -1]} intensity={0.3} color="#d946ef" />

      <group ref={body}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <primitive object={brownMat} attach="material" />
        </mesh>

        <mesh position={[0, -0.05, 0.18]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <primitive object={lightBrownMat} attach="material" />
        </mesh>

        <group ref={armL} position={[-0.28, 0.1, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 8, 8]} />
            <primitive object={brownMat} attach="material" />
          </mesh>
        </group>

        <group ref={armR} position={[0.28, 0.1, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 8, 8]} />
            <primitive object={brownMat} attach="material" />
          </mesh>
        </group>

        <mesh position={[-0.1, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <primitive object={brownMat} attach="material" />
        </mesh>
        <mesh position={[0.1, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <primitive object={brownMat} attach="material" />
        </mesh>
      </group>

      <group ref={head} position={[0, 0.35, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <primitive object={brownMat} attach="material" />
        </mesh>

        <mesh position={[-0.1, 0.1, 0.1]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <primitive object={brownMat} attach="material" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.1]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <primitive object={brownMat} attach="material" />
        </mesh>

        <mesh position={[-0.07, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <primitive object={darkMat} attach="material" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <primitive object={darkMat} attach="material" />
        </mesh>

        <mesh position={[0, -0.01, 0.14]}>
          <sphereGeometry args={[blink ? 0.001 : 0.018, 8, 8]} />
          <primitive object={pinkMat} attach="material" />
        </mesh>

        <mesh position={[-0.04, -0.05, 0.12]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <primitive object={pinkMat} attach="material" />
        </mesh>
        <mesh position={[0.04, -0.05, 0.12]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <primitive object={pinkMat} attach="material" />
        </mesh>
      </group>

      <group ref={heartRef} position={[0, 0.1, 0.3]}>
        <Heart pos={[0, 0, 0]} sc={0.15} color="#f43f5e" />
      </group>

      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.3, (Math.random() - 0.5) * 0.3]}>
          <sphereGeometry args={[0.008, 4, 4]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.4 + Math.random() * 0.4} />
        </mesh>
      ))}
    </group>
  )
}
