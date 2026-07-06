import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingParticlesProps {
  count?: number
  color?: string
  size?: number
  speed?: number
}

export default function FloatingParticles({
  count = 200,
  color = '#fbbf24',
  size = 0.02,
  speed = 0.2,
}: FloatingParticlesProps) {
  const meshRef = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  const velocities = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * speed * 0.01,
      y: (Math.random() - 0.5) * speed * 0.01,
      z: (Math.random() - 0.5) * speed * 0.01,
    }))
  }, [count, speed])

  useFrame(() => {
    const positionsArr = meshRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      positionsArr[i * 3] += velocities[i].x
      positionsArr[i * 3 + 1] += velocities[i].y
      positionsArr[i * 3 + 2] += velocities[i].z
      if (Math.abs(positionsArr[i * 3]) > 10) velocities[i].x *= -1
      if (Math.abs(positionsArr[i * 3 + 1]) > 10) velocities[i].y *= -1
      if (Math.abs(positionsArr[i * 3 + 2]) > 10) velocities[i].z *= -1
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  const attr = useMemo(() => new THREE.BufferAttribute(positions, 3), [positions])

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={attr} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
