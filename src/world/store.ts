import * as THREE from 'three'

/**
 * Mutable, per-frame state shared between the 3D scene and the DOM HUD.
 * Kept outside React on purpose: these values change every frame and
 * re-rendering React for them would be wasteful.
 */

export const SPAWN = new THREE.Vector3(0, 0, 44)

export const input = {
  keys: new Set<string>(),
  /** Virtual joystick, x = right, y = forward, each in [-1, 1]. */
  joy: { x: 0, y: 0 },
  /** Click / tap-to-walk destination. */
  target: null as THREE.Vector3 | null,
  /** Set while the pointer is over a scrolling screen: wheel scrolls it instead of zooming. */
  wheelHandler: null as ((deltaY: number) => void) | null,
  enabled: true,
}

export const player = {
  pos: SPAWN.clone(),
  /** Rotation about Y; 0 faces +Z, PI faces -Z (north). */
  heading: Math.PI,
  /** Current horizontal speed, used to drive the walk animation. */
  speed: 0,
}

export const cam = {
  yaw: 0,
  pitch: 0.36,
  dist: 10,
  /** While framing a landmark: drag swings the view a little, wheel zooms. */
  focusYaw: 0,
  focusZoom: 1,
}

type TeleportRequest = { x: number; z: number; heading: number }
let pendingTeleport: TeleportRequest | null = null

export function requestTeleport(t: TeleportRequest) {
  pendingTeleport = t
  input.target = null
}

export function consumeTeleport(): TeleportRequest | null {
  const t = pendingTeleport
  pendingTeleport = null
  return t
}

export const isTouchDevice =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(pointer: coarse)').matches

/** Small deterministic PRNG so the world layout is identical on every visit. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
