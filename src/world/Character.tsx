import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './store'

const SKIN = '#f2c9a0'
const HAIR = '#2a1b12'
const HOODIE = '#7c3aed'
const HOODIE_DARK = '#5b21b6'
const PANTS = '#1f2a44'
const SHOE = '#f8fafc'
const BAG = '#ff8cc6'

/**
 * A stylised low-poly developer: hoodie, jeans, sneakers and a backpack.
 * Built from primitives so there are no model files to download. The limbs
 * hang from pivot groups so a walk cycle is just a rotation per joint.
 */
const Character: React.FC = () => {
  const body = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const kneeL = useRef<THREE.Group>(null)
  const kneeR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const phase = useRef(0)
  const amount = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const speed = player.speed
    // 0 = idle, ~1 = walking, ~1.8 = running.
    const target = Math.min(speed / 5.5, 1.8)
    amount.current += (target - amount.current) * Math.min(1, dt * 10)
    const a = amount.current
    phase.current += dt * (4 + speed * 1.15)
    const s = Math.sin(phase.current)
    const swing = Math.min(a, 1.25)

    if (legL.current && legR.current && kneeL.current && kneeR.current) {
      legL.current.rotation.x = s * 0.75 * swing
      legR.current.rotation.x = -s * 0.75 * swing
      kneeL.current.rotation.x = Math.max(0, -Math.cos(phase.current)) * 0.9 * swing
      kneeR.current.rotation.x = Math.max(0, Math.cos(phase.current)) * 0.9 * swing
    }
    if (armL.current && armR.current) {
      const idleSway = Math.sin(t * 1.6) * 0.04 * (1 - Math.min(a, 1))
      armL.current.rotation.x = -s * 0.8 * swing + idleSway
      armR.current.rotation.x = s * 0.8 * swing - idleSway
      armL.current.rotation.z = 0.12 + a * 0.05
      armR.current.rotation.z = -0.12 - a * 0.05
    }
    if (body.current) {
      const bob = Math.abs(Math.cos(phase.current)) * 0.09 * swing
      const breathe = Math.sin(t * 2) * 0.012 * (1 - Math.min(a, 1))
      body.current.position.y = bob + breathe
    }
    if (torso.current) {
      torso.current.rotation.x = 0.06 * a
      torso.current.rotation.y = s * 0.08 * swing
    }
    if (head.current) {
      head.current.rotation.y = -s * 0.06 * swing + Math.sin(t * 0.7) * 0.08 * (1 - Math.min(a, 1))
      head.current.rotation.x = -0.04 * a
    }
  })

  return (
    <group ref={body}>
      {/* Legs */}
      {[
        { ref: legL, knee: kneeL, x: 0.17 },
        { ref: legR, knee: kneeR, x: -0.17 },
      ].map(({ ref, knee, x }) => (
        <group key={x} ref={ref} position={[x, 0.95, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.3, 4, 10]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} />
          </mesh>
          <group ref={knee} position={[0, -0.47, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.26, 4, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.42, 0.06]} castShadow>
              <boxGeometry args={[0.22, 0.13, 0.36]} />
              <meshStandardMaterial color={SHOE} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.475, 0.06]}>
              <boxGeometry args={[0.23, 0.03, 0.37]} />
              <meshStandardMaterial color="#ff5d8f" />
            </mesh>
          </group>
        </group>
      ))}

      <group ref={torso} position={[0, 0.95, 0]}>
        {/* Hips + hoodie body */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.52, 0.2, 0.3]} />
          <meshStandardMaterial color={PANTS} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.32, 6, 14]} />
          <meshStandardMaterial color={HOODIE} roughness={0.65} />
        </mesh>
        {/* Hoodie pocket + strings */}
        <mesh position={[0, 0.3, 0.27]}>
          <boxGeometry args={[0.34, 0.14, 0.04]} />
          <meshStandardMaterial color={HOODIE_DARK} />
        </mesh>
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.66, 0.29]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
        {/* Hood bunched at the neck */}
        <mesh position={[0, 0.82, -0.08]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.17, 0.07, 8, 16]} />
          <meshStandardMaterial color={HOODIE_DARK} />
        </mesh>

        {/* Backpack */}
        <group position={[0, 0.5, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.55, 0.2]} />
            <meshStandardMaterial color={BAG} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.1, -0.11]}>
            <boxGeometry args={[0.34, 0.22, 0.05]} />
            <meshStandardMaterial color="#ff5d8f" />
          </mesh>
        </group>

        {/* Arms (pivot at the shoulder) */}
        {[
          { ref: armL, x: 0.38 },
          { ref: armR, x: -0.38 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref} position={[x, 0.72, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.095, 0.38, 4, 10]} />
              <meshStandardMaterial color={HOODIE} roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.52, 0]} castShadow>
              <sphereGeometry args={[0.085, 12, 12]} />
              <meshStandardMaterial color={SKIN} roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Head */}
        <group ref={head} position={[0, 0.9, 0]}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.12, 10]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          {/* Hair: cap + fringe */}
          <mesh position={[0, 0.34, -0.03]} scale={[1.06, 0.9, 1.08]} castShadow>
            <sphereGeometry args={[0.26, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          <mesh position={[0.06, 0.45, 0.17]} rotation={[0.9, 0.3, 0.2]}>
            <coneGeometry args={[0.1, 0.2, 6]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Eyes */}
          {[-0.09, 0.09].map((x) => (
            <group key={x} position={[x, 0.29, 0.235]}>
              <mesh>
                <sphereGeometry args={[0.035, 10, 10]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
              <mesh position={[0.012, 0.012, 0.025]}>
                <sphereGeometry args={[0.01, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
          {/* Brows + smile */}
          {[-0.09, 0.09].map((x) => (
            <mesh key={x} position={[x, 0.36, 0.235]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
              <boxGeometry args={[0.08, 0.018, 0.02]} />
              <meshStandardMaterial color={HAIR} />
            </mesh>
          ))}
          <mesh position={[0, 0.19, 0.24]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.045, 0.012, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
          {/* Cheeks */}
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0.22, 0.2]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#ff9eb5" transparent opacity={0.6} />
            </mesh>
          ))}
          {/* Ears */}
          {[-0.26, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.27, 0]} scale={[0.5, 1, 0.8]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

export default Character
