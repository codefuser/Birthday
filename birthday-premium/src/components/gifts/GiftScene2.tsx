import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FUR_MAT = new THREE.MeshPhysicalMaterial({
  color: '#D4A574', roughness: 0.85, metalness: 0,
  clearcoat: 0.02, sheen: 0.7, sheenColor: new THREE.Color('#E8C9A0'),
  sheenRoughness: 0.4,
})

const DARK_FUR = new THREE.MeshPhysicalMaterial({
  color: '#B8885A', roughness: 0.8, metalness: 0,
  clearcoat: 0.02, sheen: 0.6, sheenColor: new THREE.Color('#D4A574'),
  sheenRoughness: 0.4,
})

const LIGHT_FUR = new THREE.MeshPhysicalMaterial({
  color: '#E8C9A0', roughness: 0.8, metalness: 0,
  clearcoat: 0.02, sheen: 0.6, sheenColor: new THREE.Color('#F0DCC0'),
  sheenRoughness: 0.4,
})

const EYE_MAT = new THREE.MeshPhysicalMaterial({
  color: '#1A0A00', roughness: 0.1, metalness: 0.8,
  envMapIntensity: 2,
})

const NOSE_MAT = new THREE.MeshPhysicalMaterial({
  color: '#2A1506', roughness: 0.4, metalness: 0.1,
})

const PINK_FELT = new THREE.MeshPhysicalMaterial({
  color: '#D4607A', roughness: 0.7, metalness: 0,
  clearcoat: 0.1, sheen: 0.3,
})

function HeartShape({ sc = 1 }: { sc?: number }) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.2)
  shape.bezierCurveTo(0.2, 0.4, 0.4, 0.2, 0, -0.2)
  shape.bezierCurveTo(-0.4, 0.2, -0.2, 0.4, 0, 0.2)
  return (
    <mesh scale={sc} rotation={[0, 0, Math.PI]}>
      <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.008, bevelSegments: 6 }]} />
      <primitive object={PINK_FELT} attach="material" />
    </mesh>
  )
}

export function GiftScene2() {
  const group = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const heartRef = useRef<THREE.Group>(null!)
  const t = useRef(0)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
    }, 2500 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (head.current) {
      head.current.rotation.z = Math.sin(t.current * 0.25) * 0.04
      head.current.rotation.x = Math.sin(t.current * 0.18) * 0.02
    }
    if (armL.current) armL.current.rotation.z = 0.4 + Math.sin(t.current * 0.6) * 0.12
    if (armR.current) armR.current.rotation.z = -0.4 + Math.sin(t.current * 0.55 + 1.2) * 0.12
    if (heartRef.current) {
      heartRef.current.position.y = Math.sin(t.current * 0.8) * 0.02
      heartRef.current.scale.setScalar(1 + Math.sin(t.current * 1.0) * 0.04)
    }
  })

  return (
    <group ref={group}>
      <group ref={head} position={[0, 0.32, 0]}>
        <mesh position={[0, 0.01, 0]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <primitive object={FUR_MAT} attach="material" />
        </mesh>

        <mesh position={[-0.09, 0.1, 0.08]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <primitive object={DARK_FUR} attach="material" />
        </mesh>
        <mesh position={[0.09, 0.1, 0.08]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <primitive object={DARK_FUR} attach="material" />
        </mesh>

        <mesh position={[-0.09, 0.08, 0.05]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <primitive object={LIGHT_FUR} attach="material" />
        </mesh>
        <mesh position={[0.09, 0.08, 0.05]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <primitive object={LIGHT_FUR} attach="material" />
        </mesh>

        <mesh position={[-0.05, 0.02, 0.12]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <primitive object={EYE_MAT} attach="material" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.12]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <primitive object={EYE_MAT} attach="material" />
        </mesh>

        <mesh position={[0, -0.01, 0.12]}>
          <sphereGeometry args={[blink ? 0.001 : 0.015, 6, 6]} />
          <primitive object={NOSE_MAT} attach="material" />
        </mesh>

        <mesh position={[-0.03, -0.04, 0.11]} rotation={[0, 0, 0.4]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <primitive object={new THREE.MeshPhysicalMaterial({ color: '#D4607A', roughness: 0.5 })} attach="material" />
        </mesh>
        <mesh position={[0.03, -0.04, 0.11]} rotation={[0, 0, -0.4]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <primitive object={new THREE.MeshPhysicalMaterial({ color: '#D4607A', roughness: 0.5 })} attach="material" />
        </mesh>
      </group>

      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <primitive object={FUR_MAT} attach="material" />
      </mesh>

      <mesh position={[0, 0, 0.16]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <primitive object={LIGHT_FUR} attach="material" />
      </mesh>

      <group ref={armL} position={[-0.25, 0.08, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 10, 10]} />
          <primitive object={DARK_FUR} attach="material" />
        </mesh>
      </group>

      <group ref={armR} position={[0.25, 0.08, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 10, 10]} />
          <primitive object={DARK_FUR} attach="material" />
        </mesh>
      </group>

      <mesh position={[-0.08, -0.06, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <primitive object={DARK_FUR} attach="material" />
      </mesh>
      <mesh position={[0.08, -0.06, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <primitive object={DARK_FUR} attach="material" />
      </mesh>

      <group ref={heartRef} position={[0, 0.08, 0.28]}>
        <HeartShape sc={0.12} />
      </group>
    </group>
  )
}
