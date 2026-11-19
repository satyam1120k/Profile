import * as THREE from 'three'
import { mulberry32 } from './store'
import { PATHS, PATH_WIDTH, PLAZA, POND, STATIONS, WORLD_HALF } from './zones'

/**
 * The ground is painted onto a canvas once (grass tones, paths, plaza, pond
 * shore). A second low-res "mask" canvas marks where open meadow is, which the
 * grass shader, tree/flower placement and animal wandering all consult.
 */

const COLOR_PX = 2048
const MASK_PX = 512

export function smoothPath(points: [number, number][], spacing = 1): THREE.Vector2[] {
  if (points.length < 2) return []
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'centripetal',
  )
  const n = Math.max(2, Math.ceil(curve.getLength() / spacing))
  return curve.getSpacedPoints(n).map((p) => new THREE.Vector2(p.x, p.z))
}

export const SMOOTH_PATHS = PATHS.map((p) => smoothPath(p, 0.8))

type Painter = (ctx: CanvasRenderingContext2D, scale: number) => void

function makeCanvas(px: number, paint: Painter) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = px
  const ctx = canvas.getContext('2d')!
  const scale = px / (WORLD_HALF * 2)
  // World (x, z) -> canvas pixels, with north (-z) at the top.
  ctx.setTransform(scale, 0, 0, scale, WORLD_HALF * scale, WORLD_HALF * scale)
  paint(ctx, scale)
  return canvas
}

function strokePaths(ctx: CanvasRenderingContext2D, width: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const path of SMOOTH_PATHS) {
    ctx.beginPath()
    path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
  }
}

/** Paved pad under each landmark, drawn in its local frame. */
function stationPads(ctx: CanvasRenderingContext2D, pad: number, color: string) {
  ctx.fillStyle = color
  for (const s of STATIONS) {
    ctx.save()
    ctx.translate(s.x, s.z)
    // Canvas rotation is clockwise in a y-down space, the opposite of our Y rotation.
    ctx.rotate(-s.rot)
    for (const b of s.footprint) {
      ctx.fillRect(b.x - b.hw - pad, b.z - b.hd - pad, (b.hw + pad) * 2, (b.hd + pad) * 2)
    }
    ctx.restore()
  }
}

function circle(ctx: CanvasRenderingContext2D, x: number, z: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, z, r, 0, Math.PI * 2)
  ctx.fill()
}

let colorCanvas: HTMLCanvasElement | null = null
let maskData: Uint8ClampedArray | null = null
let maskCanvas: HTMLCanvasElement | null = null

export function getGroundCanvas() {
  if (colorCanvas) return colorCanvas
  colorCanvas = makeCanvas(COLOR_PX, (ctx) => {
    const rand = mulberry32(1234)
    ctx.fillStyle = '#86c95f'
    ctx.fillRect(-WORLD_HALF, -WORLD_HALF, WORLD_HALF * 2, WORLD_HALF * 2)
    // Soft tonal patches so the meadow isn't one flat colour.
    const tones = ['#7dbf55', '#93d36a', '#a0d872', '#78b850', '#8fcc5e', '#b5dd78']
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = 0.18 + rand() * 0.25
      circle(ctx, (rand() - 0.5) * 200, (rand() - 0.5) * 200, 0.6 + rand() * 5, tones[Math.floor(rand() * tones.length)])
    }
    ctx.globalAlpha = 1

    // Pond shore.
    circle(ctx, POND.x, POND.z, POND.r + 1.8, '#e3d2a8')
    circle(ctx, POND.x, POND.z, POND.r + 0.4, '#c8b48a')

    // Paths: dark edge, then the path itself, then pebble speckles.
    strokePaths(ctx, PATH_WIDTH + 0.7, '#c8ad87')
    strokePaths(ctx, PATH_WIDTH, '#ecdcc0')
    for (const path of SMOOTH_PATHS) {
      for (const p of path) {
        if (rand() < 0.5) continue
        ctx.globalAlpha = 0.35
        circle(ctx, p.x + (rand() - 0.5) * PATH_WIDTH * 0.8, p.y + (rand() - 0.5) * PATH_WIDTH * 0.8, 0.08 + rand() * 0.12, '#bfa37c')
      }
    }
    ctx.globalAlpha = 1

    // Landmark pads.
    stationPads(ctx, 1.6, '#d9c9b1')
    stationPads(ctx, 1.2, '#efe5d6')

    // Plaza with a tiled rosette.
    circle(ctx, PLAZA.x, PLAZA.z, PLAZA.r + 0.4, '#d8c3a5')
    circle(ctx, PLAZA.x, PLAZA.z, PLAZA.r, '#f4e9da')
    ctx.strokeStyle = '#e7d6be'
    ctx.lineWidth = 0.12
    for (let r = 4.6; r < PLAZA.r; r += 1.4) {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * 4.6, Math.sin(a) * 4.6)
      ctx.lineTo(Math.cos(a) * PLAZA.r, Math.sin(a) * PLAZA.r)
      ctx.stroke()
    }
    ctx.lineWidth = 0.35
    ctx.strokeStyle = '#f9a8d4'
    ctx.beginPath()
    ctx.arc(0, 0, 7.6, 0, Math.PI * 2)
    ctx.stroke()
  })
  return colorCanvas
}

export function getMaskCanvas() {
  if (maskCanvas) return maskCanvas
  maskCanvas = makeCanvas(MASK_PX, (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-WORLD_HALF, -WORLD_HALF, WORLD_HALF * 2, WORLD_HALF * 2)
    strokePaths(ctx, PATH_WIDTH + 0.4, '#000000')
    stationPads(ctx, 1.4, '#000000')
    circle(ctx, PLAZA.x, PLAZA.z, PLAZA.r + 0.5, '#000000')
    circle(ctx, POND.x, POND.z, POND.r + 1.2, '#000000')
  })
  maskData = maskCanvas.getContext('2d')!.getImageData(0, 0, MASK_PX, MASK_PX).data
  return maskCanvas
}

/** True when (x, z) is open meadow (not a path, plaza, pond or building pad). */
export function isGrass(x: number, z: number) {
  if (!maskData) getMaskCanvas()
  const s = MASK_PX / (WORLD_HALF * 2)
  const px = Math.floor((x + WORLD_HALF) * s)
  const pz = Math.floor((z + WORLD_HALF) * s)
  if (px < 0 || pz < 0 || px >= MASK_PX || pz >= MASK_PX) return true
  return maskData![(pz * MASK_PX + px) * 4] > 127
}

/** True when the whole disc of radius r around (x, z) is meadow. */
export function isClearGrass(x: number, z: number, r: number) {
  if (!isGrass(x, z)) return false
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    if (!isGrass(x + Math.cos(a) * r, z + Math.sin(a) * r)) return false
  }
  return true
}
