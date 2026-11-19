import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getFlowerData } from './Nature'
import { isTouchDevice, mulberry32, player } from './store'
import { isClearGrass, isGrass } from './terrain'
import { POND, WORLD_RADIUS, resolveCollisions } from './zones'

/* ------------------------------------------------------------------ */
/* Wandering behaviour shared by land animals                          */
/* ------------------------------------------------------------------ */

interface WanderOpts {
  home: [number, number]
  range: number
  speed: number
  /** Distance at which the animal runs from the player (0 = never). */
  flee: number
  fleeSpeed: number
  radius: number
  idle: [number, number]
}

interface WanderState {
  x: number
  z: number
  heading: number
  tx: number
  tz: number
  mode: 'idle' | 'walk' | 'flee'
  timer: number
  speed: number
  phase: number
  rand: () => number
}

function createWander(o: WanderOpts, seed: number): WanderState {
  const rand = mulberry32(seed)
  return {
    x: o.home[0],
    z: o.home[1],
    heading: rand() * Math.PI * 2,
    tx: o.home[0],
    tz: o.home[1],
    mode: 'idle',
    timer: rand() * 3,
    speed: 0,
    phase: rand() * 10,
    rand,
  }
}

function pickTarget(s: WanderState, o: WanderOpts) {
  for (let i = 0; i < 12; i++) {
    const a = s.rand() * Math.PI * 2
    const r = Math.sqrt(s.rand()) * o.range
    const x = o.home[0] + Math.cos(a) * r
    const z = o.home[1] + Math.sin(a) * r
    if (isGrass(x, z) && Math.hypot(x, z) < WORLD_RADIUS - 3) {
      s.tx = x
      s.tz = z
      return
    }
  }
  s.tx = o.home[0]
  s.tz = o.home[1]
}

function turnTowards(current: number, target: number, rate: number) {
  let d = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return current + d * Math.min(1, rate)
}

/** Advances one wandering animal by dt. */
function stepWander(s: WanderState, o: WanderOpts, dt: number) {
  const pdx = s.x - player.pos.x
  const pdz = s.z - player.pos.z
  const pd = Math.hypot(pdx, pdz)
  if (o.flee > 0 && pd < o.flee && s.mode !== 'flee') {
    s.mode = 'flee'
    s.timer = 1.6
    s.tx = s.x + (pdx / (pd || 1)) * 9
    s.tz = s.z + (pdz / (pd || 1)) * 9
  }

  let wanted = 0
  if (s.mode === 'idle') {
    s.timer -= dt
    if (s.timer <= 0) {
      pickTarget(s, o)
      s.mode = 'walk'
    }
  } else {
    const dx = s.tx - s.x
    const dz = s.tz - s.z
    const d = Math.hypot(dx, dz)
    if (s.mode === 'flee') s.timer -= dt
    if (d < 0.4 || (s.mode === 'flee' && s.timer <= 0)) {
      s.mode = 'idle'
      s.timer = o.idle[0] + s.rand() * (o.idle[1] - o.idle[0])
    } else {
      wanted = s.mode === 'flee' ? o.fleeSpeed : o.speed
      s.heading = turnTowards(s.heading, Math.atan2(dx, dz), dt * (s.mode === 'flee' ? 10 : 4))
    }
  }

  s.speed += (wanted - s.speed) * Math.min(1, dt * 5)
  const next = { x: s.x + Math.sin(s.heading) * s.speed * dt, z: s.z + Math.cos(s.heading) * s.speed * dt }
  resolveCollisions(next, o.radius, WORLD_RADIUS - 2)
  const moved = Math.hypot(next.x - s.x, next.z - s.z)
  if (s.mode === 'walk' && s.speed > 0.3 && moved < s.speed * dt * 0.3) pickTarget(s, o) // blocked
  s.x = next.x
  s.z = next.z
  s.phase += dt * (2 + s.speed * 3)
}

function findHome(rand: () => number, rMin: number, rMax: number, clearance: number): [number, number] {
  for (let i = 0; i < 200; i++) {
    const a = rand() * Math.PI * 2
    const r = rMin + rand() * (rMax - rMin)
    const x = Math.sin(a) * r
    const z = Math.cos(a) * r
    if (isClearGrass(x, z, clearance)) return [x, z]
  }
  return [0, rMin]
}

/* ------------------------------------------------------------------ */
/* Rabbit                                                              */
/* ------------------------------------------------------------------ */

const Rabbit: React.FC<{ seed: number; home: [number, number]; color: string }> = ({ seed, home, color }) => {
  const ref = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const ears = useRef<THREE.Group>(null)
  const opts = useMemo<WanderOpts>(
    () => ({ home, range: 9, speed: 2.2, flee: 5.5, fleeSpeed: 7, radius: 0.3, idle: [1.5, 5] }),
    [home],
  )
  const s = useMemo(() => createWander(opts, seed), [opts, seed])

  useFrame((state, dt) => {
    stepWander(s, opts, Math.min(dt, 0.05))
    const g = ref.current
    if (!g) return
    g.position.set(s.x, 0, s.z)
    g.rotation.y = s.heading
    const moving = s.speed > 0.3
    if (body.current) {
      body.current.position.y = moving ? Math.abs(Math.sin(s.phase * 1.4)) * 0.32 : 0
      body.current.rotation.x = moving ? Math.sin(s.phase * 1.4) * 0.15 : 0
    }
    if (ears.current) ears.current.rotation.x = -0.2 + Math.sin(state.clock.elapsedTime * 3 + seed) * 0.12
  })

  return (
    <group ref={ref} scale={0.9}>
      <group ref={body}>
        <mesh position={[0, 0.28, 0]} scale={[0.8, 0.75, 1.1]} castShadow>
          <sphereGeometry args={[0.28, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.48, 0.28]} castShadow>
          <sphereGeometry args={[0.17, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <group ref={ears} position={[0, 0.6, 0.24]}>
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.17, 0]} rotation={[0, 0, x * 2]}>
              <capsuleGeometry args={[0.045, 0.24, 3, 6]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.52, 0.42]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        ))}
        <mesh position={[0, 0.5, 0.45]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0, 0.32, -0.3]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Deer                                                                */
/* ------------------------------------------------------------------ */

const Deer: React.FC<{ seed: number; home: [number, number]; antlers: boolean }> = ({ seed, home, antlers }) => {
  const ref = useRef<THREE.Group>(null)
  const neck = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Group | null)[]>([])
  const opts = useMemo<WanderOpts>(
    () => ({ home, range: 14, speed: 1.6, flee: 7, fleeSpeed: 8, radius: 0.6, idle: [3, 8] }),
    [home],
  )
  const s = useMemo(() => createWander(opts, seed), [opts, seed])
  const brown = '#a0673f'

  useFrame((state, dt) => {
    stepWander(s, opts, Math.min(dt, 0.05))
    const g = ref.current
    if (!g) return
    g.position.set(s.x, 0, s.z)
    g.rotation.y = s.heading
    const amt = Math.min(s.speed / 2, 1.4)
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = Math.sin(s.phase * 1.6 + (i % 2 === (i < 2 ? 0 : 1) ? 0 : Math.PI)) * 0.5 * amt
    })
    if (neck.current) {
      // Graze while idle, lift the head when walking.
      const graze = s.mode === 'idle' ? 1.1 + Math.sin(state.clock.elapsedTime * 2 + seed) * 0.08 : 0.1
      neck.current.rotation.x += (graze - neck.current.rotation.x) * Math.min(1, dt * 3)
    }
  })

  return (
    <group ref={ref}>
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.8, 6, 12]} />
        <meshStandardMaterial color={brown} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.85, 1, 0.6]}>
        <capsuleGeometry args={[0.28, 0.6, 4, 10]} />
        <meshStandardMaterial color="#e9cfae" />
      </mesh>
      <mesh position={[0, 1.2, -0.68]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {[
        [0.18, 0.45],
        [-0.18, 0.45],
        [0.18, -0.45],
        [-0.18, -0.45],
      ].map(([x, z], i) => (
        <group key={i} ref={(el) => (legs.current[i] = el)} position={[x, 0.95, z]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.9, 6]} />
            <meshStandardMaterial color={brown} />
          </mesh>
          <mesh position={[0, -0.9, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 6]} />
            <meshStandardMaterial color="#2b1d14" />
          </mesh>
        </group>
      ))}
      <group ref={neck} position={[0, 1.25, 0.55]}>
        <mesh position={[0, 0.3, 0.05]} rotation={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.17, 0.65, 8]} />
          <meshStandardMaterial color={brown} />
        </mesh>
        <group position={[0, 0.62, 0.18]}>
          <mesh scale={[0.85, 0.85, 1.3]} castShadow>
            <sphereGeometry args={[0.19, 12, 10]} />
            <meshStandardMaterial color={brown} />
          </mesh>
          <mesh position={[0, -0.04, 0.24]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#2b1d14" />
          </mesh>
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, 0.04, 0.12]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          ))}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.17, 0.12, -0.05]} rotation={[0, 0, sd * -0.9]} scale={[0.5, 1, 0.3]}>
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshStandardMaterial color={brown} />
            </mesh>
          ))}
          {antlers &&
            [-1, 1].map((sd) => (
              <group key={sd} position={[sd * 0.08, 0.18, -0.02]} rotation={[0, 0, sd * -0.35]}>
                <mesh position={[0, 0.22, 0]}>
                  <cylinderGeometry args={[0.02, 0.03, 0.45, 5]} />
                  <meshStandardMaterial color="#e7d3b0" />
                </mesh>
                <mesh position={[sd * 0.08, 0.3, 0.04]} rotation={[0.3, 0, sd * -0.8]}>
                  <cylinderGeometry args={[0.015, 0.02, 0.22, 5]} />
                  <meshStandardMaterial color="#e7d3b0" />
                </mesh>
                <mesh position={[-sd * 0.04, 0.4, 0.02]} rotation={[0, 0, sd * 0.6]}>
                  <cylinderGeometry args={[0.015, 0.02, 0.2, 5]} />
                  <meshStandardMaterial color="#e7d3b0" />
                </mesh>
              </group>
            ))}
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Sheep                                                               */
/* ------------------------------------------------------------------ */

const WOOL: [number, number, number, number][] = [
  [0, 0.75, 0, 0.42],
  [0.22, 0.72, 0.25, 0.3],
  [-0.22, 0.72, 0.25, 0.3],
  [0.22, 0.72, -0.25, 0.3],
  [-0.22, 0.72, -0.25, 0.3],
  [0, 0.95, 0.1, 0.3],
  [0, 0.9, -0.2, 0.3],
]

const Sheep: React.FC<{ seed: number; home: [number, number] }> = ({ seed, home }) => {
  const ref = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Mesh | null)[]>([])
  const opts = useMemo<WanderOpts>(
    () => ({ home, range: 8, speed: 1.1, flee: 2.6, fleeSpeed: 3, radius: 0.55, idle: [2, 7] }),
    [home],
  )
  const s = useMemo(() => createWander(opts, seed), [opts, seed])

  useFrame((state, dt) => {
    stepWander(s, opts, Math.min(dt, 0.05))
    const g = ref.current
    if (!g) return
    g.position.set(s.x, 0, s.z)
    g.rotation.y = s.heading
    const amt = Math.min(s.speed, 1)
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = Math.sin(s.phase * 2 + (i % 3 === 0 ? 0 : Math.PI)) * 0.45 * amt
    })
    if (head.current) {
      const target = s.mode === 'idle' ? 0.6 + Math.sin(state.clock.elapsedTime * 3 + seed) * 0.1 : 0
      head.current.rotation.x += (target - head.current.rotation.x) * Math.min(1, dt * 3)
    }
  })

  return (
    <group ref={ref}>
      {WOOL.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color="#f8f6f0" roughness={1} flatShading />
        </mesh>
      ))}
      {[
        [0.18, 0.3],
        [-0.18, 0.3],
        [0.18, -0.3],
        [-0.18, -0.3],
      ].map(([x, z], i) => (
        <mesh key={i} ref={(el) => (legs.current[i] = el)} position={[x, 0.25, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.85, 0.48]}>
        <mesh position={[0, 0, 0.12]} scale={[0.8, 0.85, 1.1]} castShadow>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
        <mesh position={[0, 0.12, 0.02]}>
          <icosahedronGeometry args={[0.15, 1]} />
          <meshStandardMaterial color="#f8f6f0" flatShading />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.18, 0.02, 0.06]} rotation={[0, 0, sd * 1.2]} scale={[0.4, 1, 0.3]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color="#2b2b2b" />
          </mesh>
        ))}
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.04, 0.29]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Dog companion                                                       */
/* ------------------------------------------------------------------ */

const Dog: React.FC = () => {
  const ref = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Group | null)[]>([])
  const s = useRef({ x: player.pos.x + 1.5, z: player.pos.z + 1.5, heading: Math.PI, speed: 0, phase: 0 })

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const d = s.current
    // Trot to a spot just behind and beside the player.
    const tx = player.pos.x - Math.sin(player.heading) * 1.8 + Math.cos(player.heading) * 1.1
    const tz = player.pos.z - Math.cos(player.heading) * 1.8 - Math.sin(player.heading) * 1.1
    const dx = tx - d.x
    const dz = tz - d.z
    const dist = Math.hypot(dx, dz)
    // Too far behind (e.g. after fast travel): just catch up.
    if (dist > 25) {
      d.x = tx
      d.z = tz
    }
    const wanted = dist > 0.6 ? Math.min(dist * 2.2, 12.5) : 0
    d.speed += (wanted - d.speed) * Math.min(1, dt * 6)
    if (dist > 0.6) d.heading = turnTowards(d.heading, Math.atan2(dx, dz), dt * 8)
    else d.heading = turnTowards(d.heading, Math.atan2(player.pos.x - d.x, player.pos.z - d.z), dt * 3)
    const next = { x: d.x + Math.sin(d.heading) * d.speed * dt, z: d.z + Math.cos(d.heading) * d.speed * dt }
    resolveCollisions(next, 0.3)
    d.x = next.x
    d.z = next.z
    d.phase += dt * (3 + d.speed * 2.2)

    const g = ref.current
    if (!g) return
    g.position.set(d.x, 0, d.z)
    g.rotation.y = d.heading
    const amt = Math.min(d.speed / 3, 1.2)
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = Math.sin(d.phase * 1.8 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.6 * amt
    })
    const t = state.clock.elapsedTime
    if (tail.current) tail.current.rotation.y = Math.sin(t * (d.speed > 0.5 ? 14 : 8)) * 0.6
    if (head.current) head.current.rotation.y = d.speed < 0.5 ? Math.sin(t * 0.8) * 0.3 : 0
    g.position.y = d.speed > 0.5 ? Math.abs(Math.sin(d.phase * 1.8)) * 0.05 : 0
  })

  const tan = '#d19a5b'
  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.5, 6, 12]} />
        <meshStandardMaterial color={tan} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.44, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 1, 0.7]}>
        <capsuleGeometry args={[0.17, 0.4, 4, 10]} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>
      {[
        [0.12, 0.28],
        [-0.12, 0.28],
        [0.12, -0.28],
        [-0.12, -0.28],
      ].map(([x, z], i) => (
        <group key={i} ref={(el) => (legs.current[i] = el)} position={[x, 0.45, z]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.45, 6]} />
            <meshStandardMaterial color={tan} />
          </mesh>
          <mesh position={[0, -0.43, 0.03]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#f5e6d3" />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 0.78, 0.42]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 14, 12]} />
          <meshStandardMaterial color={tan} />
        </mesh>
        <mesh position={[0, -0.05, 0.17]} scale={[0.8, 0.7, 1]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#f5e6d3" />
        </mesh>
        <mesh position={[0, 0, 0.29]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.07, 0.16]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        ))}
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.17, 0.06, -0.02]} rotation={[0, 0, sd * 0.4]} scale={[0.35, 1, 0.6]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial color="#7c4a26" />
          </mesh>
        ))}
        <mesh position={[0, -0.13, 0.18]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.1]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
      </group>
      {/* Collar */}
      <mesh position={[0, 0.66, 0.32]} rotation={[1.1, 0, 0]}>
        <torusGeometry args={[0.15, 0.025, 6, 16]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
      <group ref={tail} position={[0, 0.62, -0.42]}>
        <mesh position={[0, 0.12, -0.08]} rotation={[-0.7, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.22, 3, 6]} />
          <meshStandardMaterial color={tan} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Ducks, birds, butterflies                                           */
/* ------------------------------------------------------------------ */

const Duck: React.FC<{ seed: number }> = ({ seed }) => {
  const ref = useRef<THREE.Group>(null)
  const p = useMemo(() => {
    const rand = mulberry32(seed)
    return { r: 2.5 + rand() * (POND.r - 4.5), speed: (0.15 + rand() * 0.15) * (rand() < 0.5 ? -1 : 1), a: rand() * 6, wob: rand() * 6 }
  }, [seed])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const a = p.a + t * p.speed
    const r = p.r + Math.sin(t * 0.3 + p.wob) * 1.2
    const g = ref.current
    if (!g) return
    g.position.set(POND.x + Math.cos(a) * r, 0.1 + Math.sin(t * 2 + p.wob) * 0.02, POND.z + Math.sin(a) * r)
    // Face along the direction of travel (tangent to the circle).
    g.rotation.y = Math.atan2(-Math.sin(a) * Math.sign(p.speed), Math.cos(a) * Math.sign(p.speed))
    g.rotation.z = Math.sin(t * 2 + p.wob) * 0.05
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.12, 0]} scale={[0.8, 0.6, 1.2]} castShadow>
        <sphereGeometry args={[0.25, 12, 10]} />
        <meshStandardMaterial color={seed % 2 ? '#f8fafc' : '#8b6b4a'} />
      </mesh>
      <mesh position={[0, 0.35, 0.22]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={seed % 2 ? '#f8fafc' : '#166534'} />
      </mesh>
      <mesh position={[0, 0.32, 0.37]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.38, 0.32]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[0, 0.2, -0.3]} rotation={[0.6, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 6]} />
        <meshStandardMaterial color={seed % 2 ? '#f8fafc' : '#8b6b4a'} />
      </mesh>
    </group>
  )
}

const Bird: React.FC<{ seed: number }> = ({ seed }) => {
  const ref = useRef<THREE.Group>(null)
  const wingL = useRef<THREE.Group>(null)
  const wingR = useRef<THREE.Group>(null)
  const p = useMemo(() => {
    const rand = mulberry32(seed)
    const a = rand() * Math.PI * 2
    const r = rand() * 60
    return {
      cx: Math.cos(a) * r,
      cz: Math.sin(a) * r,
      radius: 10 + rand() * 18,
      h: 16 + rand() * 12,
      speed: (0.12 + rand() * 0.12) * (rand() < 0.5 ? -1 : 1),
      phase: rand() * 6,
      color: ['#334155', '#1e293b', '#7c2d12', '#f8fafc'][Math.floor(rand() * 4)],
    }
  }, [seed])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const a = p.phase + t * p.speed
    const g = ref.current
    if (!g) return
    g.position.set(p.cx + Math.cos(a) * p.radius, p.h + Math.sin(t * 0.7 + p.phase) * 1.5, p.cz + Math.sin(a) * p.radius)
    g.rotation.y = Math.atan2(-Math.sin(a) * Math.sign(p.speed), Math.cos(a) * Math.sign(p.speed))
    g.rotation.z = -Math.sign(p.speed) * 0.25
    // Flap, with the occasional glide.
    const flap = Math.sin(t * 12 + p.phase) * (Math.sin(t * 0.5 + p.phase) > 0.3 ? 0.15 : 0.7)
    if (wingL.current) wingL.current.rotation.z = flap
    if (wingR.current) wingR.current.rotation.z = -flap
  })
  return (
    <group ref={ref}>
      <mesh scale={[0.5, 0.45, 1.2]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color={p.color} />
      </mesh>
      <mesh position={[0, 0.03, 0.27]}>
        <coneGeometry args={[0.04, 0.12, 5]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {/* Wings hinge at the body, so the pivot groups sit at the shoulders. */}
      <group ref={wingL} position={[0.06, 0.02, 0]}>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.22]} />
          <meshStandardMaterial color={p.color} />
        </mesh>
      </group>
      <group ref={wingR} position={[-0.06, 0.02, 0]}>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.22]} />
          <meshStandardMaterial color={p.color} />
        </mesh>
      </group>
    </group>
  )
}

// Wings pivot from the body: shift the geometry so rotation happens at the root.
const wingGeo = (() => {
  const g = new THREE.PlaneGeometry(0.22, 0.18)
  g.translate(0.11, 0, 0)
  return g
})()

const Butterfly: React.FC<{ seed: number; center: [number, number] }> = ({ seed, center }) => {
  const ref = useRef<THREE.Group>(null)
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  const p = useMemo(() => {
    const rand = mulberry32(seed)
    return {
      color: ['#f472b6', '#facc15', '#60a5fa', '#a78bfa', '#fb923c', '#ffffff'][Math.floor(rand() * 6)],
      fx: 0.3 + rand() * 0.3,
      fz: 0.25 + rand() * 0.3,
      ph: rand() * 6,
      r: 1.5 + rand() * 1.5,
    }
  }, [seed])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const g = ref.current
    if (!g) return
    const x = center[0] + Math.sin(t * p.fx + p.ph) * p.r
    const z = center[1] + Math.sin(t * p.fz + p.ph * 1.3) * p.r
    const nx = center[0] + Math.sin((t + 0.05) * p.fx + p.ph) * p.r
    const nz = center[1] + Math.sin((t + 0.05) * p.fz + p.ph * 1.3) * p.r
    g.position.set(x, 0.8 + Math.sin(t * 2.3 + p.ph) * 0.35, z)
    g.rotation.y = Math.atan2(nx - x, nz - z)
    // Inside the rotated wing group, local Y is the body's long axis.
    const flap = Math.sin(t * 22 + p.ph) * 1.1
    if (left.current) left.current.rotation.y = flap
    if (right.current) right.current.rotation.y = Math.PI - flap
  })
  return (
    <group ref={ref}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={left} geometry={wingGeo}>
          <meshStandardMaterial color={p.color} side={THREE.DoubleSide} emissive={p.color} emissiveIntensity={0.25} />
        </mesh>
        <mesh ref={right} geometry={wingGeo}>
          <meshStandardMaterial color={p.color} side={THREE.DoubleSide} emissive={p.color} emissiveIntensity={0.25} />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.02, 0.12, 2, 4]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */

const Animals: React.FC = () => {
  const herd = useMemo(() => {
    const rand = mulberry32(2024)
    const few = isTouchDevice
    const rabbitColors = ['#f5f5f4', '#d6b48c', '#a8a29e', '#f5f5f4', '#c08457']
    const rabbits = Array.from({ length: few ? 5 : 9 }, (_, i) => ({
      seed: 100 + i,
      home: findHome(rand, 16, 62, 1.5),
      color: rabbitColors[i % rabbitColors.length],
    }))
    const deer = Array.from({ length: few ? 3 : 6 }, (_, i) => ({
      seed: 200 + i,
      home: findHome(rand, 48, 74, 2.5),
      antlers: i % 2 === 0,
    }))
    const flockHome = findHome(rand, 58, 68, 6)
    const sheep = Array.from({ length: few ? 4 : 7 }, (_, i) => ({
      seed: 300 + i,
      home: [flockHome[0] + (rand() - 0.5) * 6, flockHome[1] + (rand() - 0.5) * 6] as [number, number],
    }))
    const beds = getFlowerData().beds
    const butterflies = Array.from({ length: Math.min(beds.length, few ? 8 : 18) }, (_, i) => ({
      seed: 400 + i,
      center: beds[(i * 3) % beds.length],
    }))
    return { rabbits, deer, sheep, butterflies }
  }, [])

  return (
    <>
      {herd.rabbits.map((r) => (
        <Rabbit key={r.seed} {...r} />
      ))}
      {herd.deer.map((d) => (
        <Deer key={d.seed} {...d} />
      ))}
      {herd.sheep.map((s) => (
        <Sheep key={s.seed} {...s} />
      ))}
      {herd.butterflies.map((b) => (
        <Butterfly key={b.seed} {...b} />
      ))}
      {[1, 2, 3, 4, 5].map((s) => (
        <Duck key={s} seed={s} />
      ))}
      {Array.from({ length: isTouchDevice ? 6 : 12 }, (_, i) => (
        <Bird key={i} seed={500 + i} />
      ))}
      <Dog />
    </>
  )
}

export default Animals
