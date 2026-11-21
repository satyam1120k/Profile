import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './store'

const SKIN = '#f7d4bf'
const SKIN_SHADE = '#eebfa6'
const HAIR = '#2e1b14'
const HAIR_LIGHT = '#4a2c20'
const BLOUSE = '#fff6f0'
const SKIRT = '#c23b6c'
const SKIRT_DARK = '#8f2450'
const RIBBON = '#e11d48'
const SOCK = '#ffffff'
const SHOE = '#3b1d2a'
const GOLD = '#f5c56b'
const IRIS = '#5b3420'
const IRIS_LIGHT = '#c48a5a'
const LIPS = '#e0587c'
const BLUSH = '#ff8fab'
const PETAL = '#ffb3c8'

const hair = <meshStandardMaterial color={HAIR} roughness={0.45} metalness={0.08} />
const skin = <meshStandardMaterial color={SKIN} roughness={0.6} />

/**
 * A stylised anime-style young woman: long flowing hair, big expressive eyes,
 * a blouse with a ribbon bow, pleated skirt, knee socks and Mary-Janes.
 * Built from primitives so there are no model files to download. The limbs
 * hang from pivot groups so a walk cycle is just a rotation per joint.
 */
const Character: React.FC = () => {
  const body = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const hairBack = useRef<THREE.Group>(null)
  const skirt = useRef<THREE.Group>(null)
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
    const idle = 1 - Math.min(a, 1)
    phase.current += dt * (4 + speed * 1.15)
    const s = Math.sin(phase.current)
    const swing = Math.min(a, 1.25)

    if (legL.current && legR.current && kneeL.current && kneeR.current) {
      legL.current.rotation.x = s * 0.7 * swing
      legR.current.rotation.x = -s * 0.7 * swing
      kneeL.current.rotation.x = Math.max(0, -Math.cos(phase.current)) * 0.9 * swing
      kneeR.current.rotation.x = Math.max(0, Math.cos(phase.current)) * 0.9 * swing
    }
    if (armL.current && armR.current) {
      const idleSway = Math.sin(t * 1.6) * 0.04 * idle
      armL.current.rotation.x = -s * 0.7 * swing + idleSway
      armR.current.rotation.x = s * 0.7 * swing - idleSway
      armL.current.rotation.z = 0.16 + a * 0.06
      armR.current.rotation.z = -0.16 - a * 0.06
    }
    if (body.current) {
      const bob = Math.abs(Math.cos(phase.current)) * 0.08 * swing
      const breathe = Math.sin(t * 2) * 0.01 * idle
      body.current.position.y = bob + breathe
    }
    if (torso.current) {
      torso.current.rotation.x = 0.06 * a
      torso.current.rotation.y = s * 0.09 * swing
      // A gentle hip sway while standing.
      torso.current.rotation.z = Math.sin(t * 0.9) * 0.02 * idle
    }
    if (head.current) {
      head.current.rotation.y = -s * 0.07 * swing + Math.sin(t * 0.7) * 0.1 * idle
      head.current.rotation.x = -0.04 * a
      head.current.rotation.z = Math.sin(t * 0.55) * 0.05 * idle
    }
    if (hairBack.current) {
      // Hair streams back with speed and bounces with each step.
      hairBack.current.rotation.x =
        0.05 + a * 0.28 + Math.sin(phase.current * 2) * 0.05 * swing + Math.sin(t * 1.3) * 0.02
      hairBack.current.rotation.z = -s * 0.06 * swing
    }
    if (skirt.current) {
      skirt.current.rotation.y = -s * 0.08 * swing
      const flare = 1 + a * 0.06 + Math.abs(Math.cos(phase.current)) * 0.04 * swing
      skirt.current.scale.set(flare, 1, flare)
    }
    if (eyes.current) {
      // Blink every few seconds.
      const bt = t % 3.7
      eyes.current.scale.y = bt < 0.14 ? 0.12 + (Math.abs(bt - 0.07) / 0.07) * 0.88 : 1
    }
  })

  return (
    <group ref={body}>
      {/* Legs */}
      {[
        { ref: legL, knee: kneeL, x: 0.1 },
        { ref: legR, knee: kneeR, x: -0.1 },
      ].map(({ ref, knee, x }) => (
        <group key={x} ref={ref} position={[x, 0.95, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.32, 4, 12]} />
            {skin}
          </mesh>
          <group ref={knee} position={[0, -0.47, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.26, 4, 12]} />
              {skin}
            </mesh>
            {/* Knee sock with a ribbed top */}
            <mesh position={[0, -0.27, 0]} castShadow>
              <capsuleGeometry args={[0.077, 0.17, 4, 12]} />
              <meshStandardMaterial color={SOCK} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.077, 0.012, 6, 16]} />
              <meshStandardMaterial color={SKIRT} roughness={0.8} />
            </mesh>
            {/* Mary-Jane shoe */}
            <mesh position={[0, -0.425, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.072, 0.14, 4, 12]} />
              <meshStandardMaterial color={SHOE} roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.478, 0.04]}>
              <boxGeometry args={[0.13, 0.02, 0.27]} />
              <meshStandardMaterial color="#1a0d13" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.37, 0.06]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.15, 6]} />
              <meshStandardMaterial color={SHOE} roughness={0.3} />
            </mesh>
            <mesh position={[x > 0 ? 0.075 : -0.075, -0.37, 0.06]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
            </mesh>
          </group>
        </group>
      ))}

      <group ref={torso} position={[0, 0.95, 0]}>
        {/* Shorts under the skirt so it never looks hollow */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.2, 0.16, 16]} />
          <meshStandardMaterial color={SKIRT_DARK} roughness={0.8} />
        </mesh>

        {/* Pleated skirt (flat-shaded facets read as pleats) */}
        <group ref={skirt} position={[0, 0.12, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.205, 0.36, 0.4, 18, 1, true]} />
            <meshStandardMaterial color={SKIRT} roughness={0.7} flatShading side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.39, 0]}>
            <cylinderGeometry args={[0.352, 0.362, 0.03, 18, 1, true]} />
            <meshStandardMaterial color={SOCK} roughness={0.7} flatShading side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* Waistband */}
        <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.028, 8, 20]} />
          <meshStandardMaterial color={SKIRT_DARK} roughness={0.7} />
        </mesh>

        {/* Blouse: narrow waist rising into the chest */}
        <mesh position={[0, 0.25, 0]} scale={[1, 1, 0.86]} castShadow>
          <cylinderGeometry args={[0.2, 0.19, 0.24, 18]} />
          <meshStandardMaterial color={BLOUSE} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[1, 1, 0.82]} castShadow>
          <capsuleGeometry args={[0.215, 0.18, 8, 18]} />
          <meshStandardMaterial color={BLOUSE} roughness={0.75} />
        </mesh>
        {/* Buttons */}
        {[0.32, 0.42, 0.52].map((y) => (
          <mesh key={y} position={[0, y, y > 0.4 ? 0.178 : 0.19]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#f3d7e0" />
          </mesh>
        ))}
        {/* Collar */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.06, 0.74, 0.12]}
            rotation={[0.9, 0, side * -0.9]}
            scale={[1, 1, 0.35]}
          >
            <coneGeometry args={[0.07, 0.12, 3]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        ))}
        {/* Ribbon bow */}
        <group position={[0, 0.7, 0.17]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.05, 0, 0]} rotation={[0, 0, side * Math.PI / 2]} scale={[1, 1, 0.45]}>
              <coneGeometry args={[0.04, 0.09, 12]} />
              <meshStandardMaterial color={RIBBON} roughness={0.4} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color={RIBBON} roughness={0.4} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.025, -0.06, 0]} rotation={[0, 0, side * 0.35]} scale={[1, 1, 0.4]}>
              <boxGeometry args={[0.025, 0.1, 0.02]} />
              <meshStandardMaterial color={RIBBON} roughness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Arms (pivot at the shoulder) */}
        {[
          { ref: armL, x: 0.27 },
          { ref: armR, x: -0.27 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref} position={[x, 0.7, 0]}>
            {/* Puff sleeve */}
            <mesh position={[0, -0.05, 0]} scale={[1, 1.15, 1]} castShadow>
              <sphereGeometry args={[0.085, 14, 14]} />
              <meshStandardMaterial color={BLOUSE} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.135, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.012, 6, 14]} />
              <meshStandardMaterial color={RIBBON} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow>
              <capsuleGeometry args={[0.05, 0.36, 4, 10]} />
              {skin}
            </mesh>
            {/* Bracelet */}
            <mesh position={[0, -0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.052, 0.009, 6, 16]} />
              <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.545, 0]} scale={[0.8, 1.2, 0.6]} castShadow>
              <sphereGeometry args={[0.055, 12, 12]} />
              {skin}
            </mesh>
          </group>
        ))}

        {/* Head */}
        <group ref={head} position={[0, 0.82, 0]}>
          {/* Neck */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.055, 0.065, 0.14, 12]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.6} />
          </mesh>
          {/* Face + soft chin */}
          <mesh position={[0, 0.28, 0]} scale={[0.98, 1.06, 0.97]} castShadow>
            <sphereGeometry args={[0.24, 32, 32]} />
            {skin}
          </mesh>

          {/* Eyes (grouped so they blink together) */}
          <group ref={eyes} position={[0, 0.255, 0]}>
            {[-0.088, 0.088].map((x) => (
              <group key={x} position={[x, 0, 0.205]} rotation={[0, x * 2, 0]}>
                <mesh scale={[1, 1.2, 0.5]}>
                  <sphereGeometry args={[0.052, 16, 16]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.004, 0.012]} scale={[1, 1.2, 0.45]}>
                  <sphereGeometry args={[0.04, 16, 16]} />
                  <meshStandardMaterial color={IRIS} roughness={0.25} />
                </mesh>
                <mesh position={[0, -0.022, 0.024]} scale={[1.3, 0.7, 0.3]}>
                  <sphereGeometry args={[0.02, 10, 10]} />
                  <meshStandardMaterial color={IRIS_LIGHT} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.002, 0.026]} scale={[1, 1.2, 0.4]}>
                  <sphereGeometry args={[0.019, 10, 10]} />
                  <meshStandardMaterial color="#160b07" roughness={0.2} />
                </mesh>
                {/* Sparkles */}
                <mesh position={[x > 0 ? 0.014 : -0.014, 0.02, 0.032]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[x > 0 ? -0.012 : 0.012, -0.016, 0.031]}>
                  <sphereGeometry args={[0.006, 6, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Upper lash line with a winged outer corner */}
                <mesh position={[0, 0.002, 0.02]} scale={[1, 1.22, 1]}>
                  <torusGeometry args={[0.054, 0.011, 6, 16, Math.PI]} />
                  <meshStandardMaterial color="#120806" roughness={0.5} />
                </mesh>
                <mesh
                  position={[x > 0 ? 0.058 : -0.058, 0.018, 0.012]}
                  rotation={[0, 0, x > 0 ? -0.9 : 0.9]}
                >
                  <coneGeometry args={[0.008, 0.04, 5]} />
                  <meshStandardMaterial color="#120806" />
                </mesh>
              </group>
            ))}
          </group>

          {/* Thin arched brows */}
          {[-0.09, 0.09].map((x) => (
            <mesh key={x} position={[x, 0.335, 0.215]} rotation={[0, x * 2, x > 0 ? 0.55 : 0.95]}>
              <torusGeometry args={[0.055, 0.006, 4, 12, Math.PI * 0.55]} />
              <meshStandardMaterial color={HAIR} />
            </mesh>
          ))}
          {/* Nose */}
          <mesh position={[0, 0.205, 0.228]} scale={[1, 0.8, 0.7]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color={SKIN_SHADE} />
          </mesh>
          {/* Lips: a soft closed smile */}
          <mesh position={[0, 0.16, 0.214]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.02, 0.0055, 6, 14, Math.PI]} />
            <meshStandardMaterial color={LIPS} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.145, 0.21]} scale={[1.5, 0.6, 0.5]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color={LIPS} roughness={0.35} />
          </mesh>
          {/* Blush */}
          {[-0.135, 0.135].map((x) => (
            <mesh key={x} position={[x, 0.205, 0.172]} rotation={[0, x * 4, 0]} scale={[1.2, 0.7, 0.3]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={BLUSH} transparent opacity={0.5} />
            </mesh>
          ))}
          {/* Ears + dangling earrings */}
          {[-0.235, 0.235].map((x) => (
            <group key={x} position={[x, 0.25, 0]}>
              <mesh scale={[0.45, 1, 0.75]}>
                <sphereGeometry args={[0.055, 8, 8]} />
                {skin}
              </mesh>
              <mesh position={[x > 0 ? 0.008 : -0.008, -0.06, 0]}>
                <sphereGeometry args={[0.011, 8, 8]} />
                <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[x > 0 ? 0.008 : -0.008, -0.095, 0]} scale={[1, 1.4, 1]}>
                <sphereGeometry args={[0.016, 10, 10]} />
                <meshStandardMaterial color="#ffd6e7" metalness={0.3} roughness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Hair: crown, its front edge forming a straight-cut fringe */}
          <mesh position={[0, 0.3, -0.02]} scale={[1.08, 1.02, 1.08]} castShadow>
            <sphereGeometry args={[0.262, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
            {hair}
          </mesh>
          {/* Back of the head */}
          <mesh position={[0, 0.27, -0.03]} scale={[1.08, 1.05, 1.05]} castShadow>
            <sphereGeometry args={[0.262, 24, 20, Math.PI, Math.PI, 0, Math.PI * 0.85]} />
            {hair}
          </mesh>
          {/* Side locks framing the face */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.215, 0.3, 0.06]} rotation={[0.08, 0, side * 0.08]}>
              <mesh position={[0, -0.14, 0]} scale={[0.75, 1, 0.75]} castShadow>
                <capsuleGeometry args={[0.055, 0.3, 6, 12]} />
                {hair}
              </mesh>
              <mesh position={[side * -0.01, -0.34, 0.01]} rotation={[Math.PI, 0, side * 0.15]}>
                <coneGeometry args={[0.04, 0.1, 8]} />
                {hair}
              </mesh>
            </group>
          ))}
          {/* Flower hair clip */}
          <group position={[0.2, 0.43, 0.1]} rotation={[0, 0.9, -0.3]}>
            {[0, 1, 2, 3, 4].map((i) => {
              const ang = (i / 5) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(ang) * 0.028, Math.sin(ang) * 0.028, 0]} scale={[1, 1, 0.4]}>
                  <sphereGeometry args={[0.024, 10, 10]} />
                  <meshStandardMaterial color={PETAL} roughness={0.4} />
                </mesh>
              )
            })}
            <mesh position={[0, 0, 0.01]}>
              <sphereGeometry args={[0.017, 8, 8]} />
              <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.3} />
            </mesh>
          </group>

          {/* Long flowing hair, pivoting from the back of the head */}
          <group ref={hairBack} position={[0, 0.34, -0.1]}>
            <mesh position={[0, -0.4, -0.07]} scale={[1.12, 1, 0.5]} castShadow>
              <capsuleGeometry args={[0.2, 0.55, 8, 20]} />
              {hair}
            </mesh>
            {/* Softer layered strands so the silhouette isn't one block */}
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.17, -0.4, -0.03]}
                rotation={[0, 0, side * 0.05]}
                scale={[0.8, 1, 0.7]}
                castShadow
              >
                <capsuleGeometry args={[0.075, 0.6, 6, 12]} />
                {hair}
              </mesh>
            ))}
            {[-0.09, 0.09].map((x) => (
              <mesh key={x} position={[x, -0.5, -0.12]} scale={[0.9, 1, 0.55]}>
                <capsuleGeometry args={[0.09, 0.6, 6, 12]} />
                <meshStandardMaterial color={HAIR_LIGHT} roughness={0.4} metalness={0.08} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

export default Character
