import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import { cam, consumeTeleport, input, player } from './store'
import { STATIONS, Zone, resolveCollisions, toWorld } from './zones'

const WALK_SPEED = 6
const RUN_SPEED = 11.5
const PLAYER_RADIUS = 0.45

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

function angleLerp(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

interface PlayerProps {
  onZoneChange: (zone: Zone | null) => void
}

const Player: React.FC<PlayerProps> = ({ onZoneChange }) => {
  const group = useRef<THREE.Group>(null)
  const marker = useRef<THREE.Mesh>(null)
  const velocity = useRef(new THREE.Vector2())
  const zone = useRef<Zone | null>(null)
  const stuckTime = useRef(0)
  const lookAt = useRef(new THREE.Vector3(player.pos.x, 1.6, player.pos.z))
  const tmp = useRef({ cam: new THREE.Vector3(), look: new THREE.Vector3() })
  const { camera, gl, size } = useThree()

  // Keyboard.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.code in MOVE_KEYS || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        input.keys.add(e.code)
        input.target = null
        if (e.code.startsWith('Arrow')) e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => input.keys.delete(e.code)
    const blur = () => input.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  // Drag to look, wheel / pinch to zoom.
  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let pinchDist = 0

    const zoom = (factor: number) => {
      if (zone.current) cam.focusZoom = THREE.MathUtils.clamp(cam.focusZoom * factor, 0.55, 1.6)
      else cam.dist = THREE.MathUtils.clamp(cam.dist * factor, 4.5, 22)
    }

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 1) {
        if (zone.current) {
          cam.focusYaw = THREE.MathUtils.clamp(cam.focusYaw - dx * 0.004, -0.8, 0.8)
        } else {
          cam.yaw -= dx * 0.006
          cam.pitch = THREE.MathUtils.clamp(cam.pitch + dy * 0.004, 0.08, 1.25)
        }
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchDist > 0 && d > 0) zoom(pinchDist / d)
        pinchDist = d
      }
    }
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      pinchDist = 0
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (input.wheelHandler) input.wheelHandler(e.deltaY)
      else zoom(1 + e.deltaY * 0.0012)
    }

    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.style.touchAction = 'none'
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const g = group.current
    if (!g) return

    const tp = consumeTeleport()
    if (tp) {
      player.pos.set(tp.x, 0, tp.z)
      player.heading = tp.heading
      velocity.current.set(0, 0)
      cam.yaw = tp.heading + Math.PI
    }

    // ---- Input -> desired direction (relative to the camera) ----
    let mx = 0
    let mz = 0
    let running = false
    if (input.enabled) {
      for (const k of input.keys) {
        const m = MOVE_KEYS[k]
        if (m) {
          mx += m[0]
          mz += m[1]
        }
      }
      running = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight')
      if (input.joy.x !== 0 || input.joy.y !== 0) {
        mx += input.joy.x
        mz += input.joy.y
        running = running || Math.hypot(input.joy.x, input.joy.y) > 0.92
        input.target = null
      }
    }

    // Movement is relative to where the camera is looking.
    const viewYaw = zone.current ? zone.current.rot + cam.focusYaw : cam.yaw
    const fx = -Math.sin(viewYaw)
    const fz = -Math.cos(viewYaw)
    const rx = Math.cos(viewYaw)
    const rz = -Math.sin(viewYaw)
    let dirX = rx * mx + fx * mz
    let dirZ = rz * mx + fz * mz

    if (dirX === 0 && dirZ === 0 && input.target && input.enabled) {
      const tx = input.target.x - player.pos.x
      const tz = input.target.z - player.pos.z
      const d = Math.hypot(tx, tz)
      if (d < 0.35) {
        input.target = null
      } else {
        dirX = tx / d
        dirZ = tz / d
        running = d > 12
      }
    }

    const len = Math.hypot(dirX, dirZ)
    const maxSpeed = running ? RUN_SPEED : WALK_SPEED
    let desiredX = 0
    let desiredZ = 0
    if (len > 0.01) {
      const scale = Math.min(len, 1) / len
      desiredX = dirX * scale * maxSpeed
      desiredZ = dirZ * scale * maxSpeed
      player.heading = angleLerp(player.heading, Math.atan2(dirX, dirZ), 1 - Math.exp(-dt * 12))
    }

    const accel = 1 - Math.exp(-dt * (len > 0.01 ? 10 : 14))
    velocity.current.x += (desiredX - velocity.current.x) * accel
    velocity.current.y += (desiredZ - velocity.current.y) * accel

    const prevX = player.pos.x
    const prevZ = player.pos.z
    const next = { x: prevX + velocity.current.x * dt, z: prevZ + velocity.current.y * dt }
    resolveCollisions(next, PLAYER_RADIUS)
    player.pos.x = next.x
    player.pos.z = next.z
    player.speed = Math.hypot(next.x - prevX, next.z - prevZ) / Math.max(dt, 1e-4)

    if (input.target && len > 0.01 && player.speed < 0.8) {
      stuckTime.current += dt
      if (stuckTime.current > 0.6) input.target = null
    } else {
      stuckTime.current = 0
    }

    g.position.set(player.pos.x, 0, player.pos.z)
    g.rotation.y = player.heading

    if (marker.current) {
      const m = marker.current
      m.visible = !!input.target
      if (input.target) {
        m.position.set(input.target.x, 0.06, input.target.z)
        m.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.15)
      }
    }

    // ---- Zone detection (with a little hysteresis) ----
    let found: Zone | null = null
    let best = Infinity
    for (const z of STATIONS) {
      const d = Math.hypot(player.pos.x - z.tx, player.pos.z - z.tz)
      const r = z === zone.current ? z.radius + 1 : z.radius
      if (d < r && d < best) {
        best = d
        found = z
      }
    }
    if (found !== zone.current) {
      const left = zone.current
      zone.current = found
      if (found) {
        cam.focusYaw = 0
        cam.focusZoom = 1
      } else if (left) {
        // Hand back to the follow camera from roughly where the framing camera was.
        cam.yaw = left.rot
      }
      onZoneChange(found)
    }

    // ---- Camera ----
    const { cam: desiredCam, look: desiredLook } = tmp.current
    const z = zone.current
    if (z) {
      // Frame the landmark's screen; portrait screens need to back off further.
      const [lx, lz, ly] = z.look
      const [wx, wz] = toWorld(z, lx, lz)
      const aspect = size.width / size.height
      const fit = THREE.MathUtils.clamp(1.5 / aspect, 1, 2.1)
      const d = z.viewDist * fit * cam.focusZoom
      const yaw = z.rot + cam.focusYaw
      desiredLook.set(wx, ly, wz)
      desiredCam.set(wx + Math.sin(yaw) * d, ly + 1.3 + d * 0.06, wz + Math.cos(yaw) * d)
    } else {
      desiredLook.set(player.pos.x, 1.6, player.pos.z)
      const cp = Math.cos(cam.pitch)
      desiredCam.set(
        player.pos.x + Math.sin(cam.yaw) * cp * cam.dist,
        1.6 + Math.sin(cam.pitch) * cam.dist,
        player.pos.z + Math.cos(cam.yaw) * cp * cam.dist,
      )
    }
    if (tp) {
      camera.position.copy(desiredCam)
      lookAt.current.copy(desiredLook)
    } else {
      const k = z ? 1 - Math.exp(-dt * 2.6) : 1 - Math.exp(-dt * 7)
      camera.position.lerp(desiredCam, k)
      lookAt.current.lerp(desiredLook, z ? k : 1 - Math.exp(-dt * 10))
    }
    camera.lookAt(lookAt.current)
  })

  return (
    <>
      <group ref={group} position={player.pos.toArray()} rotation={[0, player.heading, 0]}>
        <Character />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[0.55, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </>
  )
}

export default Player
