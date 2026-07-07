import { useRef, Suspense, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function AutoRotateControls() {
  const controls = useRef<any>(null!)

  useFrame((_, delta) => {
    if (controls.current) {
      controls.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controls}
      autoRotate
      autoRotateSpeed={2}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={0.5}
      maxDistance={3}
      enablePan={false}
      rotateSpeed={0.8}
      target={[0, 0, 0]}
    />
  )
}

export function GiftViewer({ children }: { children: ReactNode }) {
  return (
    <>
      <AutoRotateControls />

      <Environment preset="night" blur={0.5} />
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        scale={3}
        blur={2.5}
        far={1}
      />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <directionalLight
        position={[-1.5, 1, -1]}
        intensity={0.3}
        color="#fcd34d"
      />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.4} color="#fcd34d" />
      <pointLight position={[-1, 0.5, -0.5]} intensity={0.2} color="#f472b6" />

      <Float
        speed={1.2}
        rotationIntensity={0.04}
        floatIntensity={0.06}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Float>
    </>
  )
}
