import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FUR = new THREE.MeshPhysicalMaterial({
  color: '#D4A574', roughness: 0.75, metalness: 0,
  clearcoat: 0.01, sheen: 0.8, sheenColor: new THREE.Color('#E8C9A0'),
  sheenRoughness: 0.3,
})

const FUR_DARK = new THREE.MeshPhysicalMaterial({
  color: '#B8885A', roughness: 0.7, metalness: 0,
  sheen: 0.7, sheenColor: new THREE.Color('#D4A574'),
  sheenRoughness: 0.3,
})

const FUR_LIGHT = new THREE.MeshPhysicalMaterial({
  color: '#F0DCC0', roughness: 0.7, metalness: 0,
  sheen: 0.6, sheenColor: new THREE.Color('#F5E8D0'),
  sheenRoughness: 0.3,
})

const EYE_WHITE = new THREE.MeshPhysicalMaterial({
  color: '#FFFFFF', roughness: 0.1, metalness: 0,
})

const EYE_PUPIL = new THREE.MeshPhysicalMaterial({
  color: '#1A0A00', roughness: 0.2, metalness: 0.6,
  envMapIntensity: 1.5,
})

const NOSE_MAT = new THREE.MeshPhysicalMaterial({
  color: '#2A1506', roughness: 0.5, metalness: 0.1,
})

const HEART_MAT = new THREE.MeshPhysicalMaterial({
  color: '#D44060', roughness: 0.4, metalness: 0.05,
  clearcoat: 0.3, clearcoatRoughness: 0.2,
  envMapIntensity: 1.2,
})

function HeartShape({ sc = 1 }: { sc?: number }) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.15)
  shape.bezierCurveTo(0.15, 0.3, 0.3, 0.15, 0, -0.15)
  shape.bezierCurveTo(-0.3, 0.15, -0.15, 0.3, 0, 0.15)
  return (
    <mesh scale={sc} rotation={[0, 0, Math.PI]}>
      <extrudeGeometry args={[shape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.008, bevelSegments: 6 }]} />
      <primitive object={HEART_MAT} attach="material" />
    </mesh>
  )
}

export function GiftScene2() {
  const group = useRef<THREE.Group>(null!)
  const headGroup = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const heartRef = useRef<THREE.Group>(null!)
  const t = useRef(0)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 100)
    }, 2800 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    if (headGroup.current) {
      headGroup.current.rotation.z = Math.sin(t.current * 0.2) * 0.03
      headGroup.current.rotation.x = Math.sin(t.current * 0.15) * 0.02
    }
    if (armL.current) {
      armL.current.rotation.z = 0.3 + Math.sin(t.current * 0.5) * 0.1
    }
    if (armR.current) {
      armR.current.rotation.z = -0.3 + Math.sin(t.current * 0.45 + 1) * 0.1
    }
    if (heartRef.current) {
      heartRef.current.position.y = Math.sin(t.current * 0.7) * 0.02
      const s = 1 + Math.sin(t.current * 0.9) * 0.03
      heartRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.24, 20, 20]} />
        <primitive object={FUR} attach="material" />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.1, -0.14, 0.04]} castShadow>
        <sphereGeometry args={[0.09, 14, 14]} />
        <primitive object={FUR_DARK} attach="material" />
      </mesh>
      <mesh position={[-0.1, -0.2, 0.06]} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
        <primitive object={FUR_DARK} attach="material" />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.1, -0.14, 0.04]} castShadow>
        <sphereGeometry args={[0.09, 14, 14]} />
        <primitive object={FUR_DARK} attach="material" />
      </mesh>
      <mesh position={[0.1, -0.2, 0.06]} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
        <primitive object={FUR_DARK} attach="material" />
      </mesh>

      {/* Head */}
      <group ref={headGroup} position={[0, 0.34, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <primitive object={FUR} attach="material" />
        </mesh>

        {/* Left Ear */}
        <mesh position={[-0.12, 0.1, 0.04]} castShadow>
          <sphereGeometry args={[0.055, 12, 12]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
        <mesh position={[-0.12, 0.1, 0.04]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <primitive object={FUR_LIGHT} attach="material" />
        </mesh>

        {/* Right Ear */}
        <mesh position={[0.12, 0.1, 0.04]} castShadow>
          <sphereGeometry args={[0.055, 12, 12]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
        <mesh position={[0.12, 0.1, 0.04]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <primitive object={FUR_LIGHT} attach="material" />
        </mesh>

        {/* Muzzle */}
        <mesh position={[0, -0.02, 0.14]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <primitive object={FUR_LIGHT} attach="material" />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.055, 0.04, 0.14]}>
          <mesh>
            <sphereGeometry args={[0.022, 10, 10]} />
            <primitive object={EYE_WHITE} attach="material" />
          </mesh>
          {!blink && (
            <mesh position={[0.004, -0.002, 0.015]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <primitive object={EYE_PUPIL} attach="material" />
            </mesh>
          )}
          {!blink && (
            <mesh position={[0.008, 0.006, 0.018]}>
              <sphereGeometry args={[0.005, 6, 6]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.7} />
            </mesh>
          )}
        </group>

        {/* Right Eye */}
        <group position={[0.055, 0.04, 0.14]}>
          <mesh>
            <sphereGeometry args={[0.022, 10, 10]} />
            <primitive object={EYE_WHITE} attach="material" />
          </mesh>
          {!blink && (
            <mesh position={[-0.004, -0.002, 0.015]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <primitive object={EYE_PUPIL} attach="material" />
            </mesh>
          )}
          {!blink && (
            <mesh position={[-0.008, 0.006, 0.018]}>
              <sphereGeometry args={[0.005, 6, 6]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.7} />
            </mesh>
          )}
        </group>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.18]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <primitive object={NOSE_MAT} attach="material" />
        </mesh>

        {/* Mouth - small smile */}
        <mesh position={[-0.015, -0.045, 0.17]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <primitive object={NOSE_MAT} attach="material" />
        </mesh>
        <mesh position={[0.015, -0.045, 0.17]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <primitive object={NOSE_MAT} attach="material" />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={armL} position={[-0.26, 0.08, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
        <mesh position={[0, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.075, 10, 10]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={armR} position={[0.26, 0.08, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
        <mesh position={[0, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.075, 10, 10]} />
          <primitive object={FUR_DARK} attach="material" />
        </mesh>
      </group>

      {/* Heart held by arms */}
      <group ref={heartRef} position={[0, 0.06, 0.28]}>
        <HeartShape sc={0.13} />
        <mesh position={[0, 0, -0.02]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  )
}
