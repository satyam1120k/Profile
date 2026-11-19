import React, { Suspense, useRef } from 'react'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Nature, { SKY_HORIZON } from './Nature'
import Stations from './Stations'
import Props from './Props'
import Animals from './Animals'
import Player from './Player'
import { input, isTouchDevice, player } from './store'
import { Zone } from './zones'

/** Sun that follows the player so shadows stay crisp wherever they walk. */
const Sun: React.FC = () => {
  const light = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    l.position.set(player.pos.x + 20, 32, player.pos.z + 14)
    l.target.position.set(player.pos.x, 0, player.pos.z)
    l.target.updateMatrixWorld()
  })
  const size = isTouchDevice ? 1024 : 2048
  return (
    <directionalLight
      ref={light}
      color="#fff1dc"
      intensity={2.2}
      castShadow
      shadow-mapSize-width={size}
      shadow-mapSize-height={size}
      shadow-camera-left={-34}
      shadow-camera-right={34}
      shadow-camera-top={34}
      shadow-camera-bottom={-34}
      shadow-camera-near={1}
      shadow-camera-far={100}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
    />
  )
}

interface WorldProps {
  activeZoneId: string | null
  onZoneChange: (zone: Zone | null) => void
}

const World: React.FC<WorldProps> = ({ activeZoneId, onZoneChange }) => {
  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6 || !input.enabled) return // ignore camera drags
    input.target = new THREE.Vector3(e.point.x, 0, e.point.z)
  }

  return (
    <Canvas
      shadows
      dpr={isTouchDevice ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 6, 54], fov: 55, near: 0.1, far: 1400 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[SKY_HORIZON]} />
      <fog attach="fog" args={[SKY_HORIZON, 60, 210]} />
      <hemisphereLight args={['#d8ecff', '#7fb069', 0.9]} />
      <ambientLight intensity={0.15} />
      <Sun />

      <Suspense fallback={null}>
        <Nature onGroundClick={handleGroundClick} />
        <Props />
        <Stations activeZoneId={activeZoneId} />
        <Animals />
      </Suspense>
      <Player onZoneChange={onZoneChange} />

      {!isTouchDevice && (
        <EffectComposer multisampling={4}>
          {/* High threshold: only emissive accents glow, never screen text. */}
          <Bloom intensity={0.7} luminanceThreshold={1} luminanceSmoothing={0.1} mipmapBlur />
          <Vignette offset={0.25} darkness={0.4} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

export default World
