/**
 * World layout. Landmarks are spread across a large meadow and linked to the
 * central fountain plaza by winding paths. Each landmark's local +Z faces the
 * way the visitor arrives, and its info screens face that way too.
 */

export type StationKind = 'welcome' | 'billboard' | 'lab' | 'tvshop' | 'tower' | 'hall' | 'postoffice'

/** Oriented box in the station's local space: centre (x, z), half extents. */
export interface LocalBox {
  x: number
  z: number
  hw: number
  hd: number
}

export interface Zone {
  id: string
  title: string
  landmark: string
  hint: string
  kind: StationKind
  color: string
  x: number
  z: number
  /** Rotation about Y so local +Z faces the visitor. */
  rot: number
  /** Trigger circle centre (where the visitor stands to read). */
  tx: number
  tz: number
  radius: number
  /** Station-local point [x, z, height] the camera frames while in the zone. */
  look: [number, number, number]
  /** How far in front of `look` the framing camera sits. */
  viewDist: number
  footprint: LocalBox[]
}

interface StationDef extends Omit<Zone, 'rot' | 'tx' | 'tz'> {
  /** Point the landmark faces (usually where its path arrives). */
  face: [number, number]
  /** Distance of the trigger in front of the landmark. */
  triggerOffset: number
}

const DEFS: StationDef[] = [
  {
    id: 'home',
    title: 'Welcome',
    landmark: 'Welcome Board',
    hint: 'Click the buttons on the board for my résumé and socials',
    kind: 'welcome',
    color: '#ff5d8f',
    x: 9,
    z: 30,
    face: [2, 38],
    triggerOffset: 6.5,
    radius: 4,
    look: [0, 0, 4.3],
    viewDist: 12,
    footprint: [
      { x: -4.6, z: 0, hw: 0.35, hd: 0.35 },
      { x: 4.6, z: 0, hw: 0.35, hd: 0.35 },
    ],
  },
  {
    id: 'about',
    title: 'About Me',
    landmark: 'The Billboard',
    hint: 'Hover the screen to pause it · scroll to read at your pace',
    kind: 'billboard',
    color: '#ff9f43',
    x: -40,
    z: 2,
    face: [-28, 2],
    triggerOffset: 9,
    radius: 4.5,
    look: [0, 0.3, 7.4],
    viewDist: 15.5,
    footprint: [{ x: 0, z: 0, hw: 7.2, hd: 0.9 }],
  },
  {
    id: 'skills',
    title: 'Skills',
    landmark: 'Tech Lab',
    hint: 'Hover a screen to pause · click a coding profile to visit it',
    kind: 'lab',
    color: '#2ec4b6',
    x: -34,
    z: -36,
    face: [-24, -24],
    triggerOffset: 11,
    radius: 4.5,
    look: [0, 3.4, 3.4],
    viewDist: 13.5,
    footprint: [
      { x: 0, z: -3, hw: 3.8, hd: 3.8 },
      { x: 0, z: 3.2, hw: 6.4, hd: 0.5 },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    landmark: 'TV Shop',
    hint: 'Click a TV to open its live demo · the GitHub button opens the code',
    kind: 'tvshop',
    color: '#7c3aed',
    x: 0,
    z: -48,
    face: [0, -30],
    triggerOffset: 10,
    radius: 4.8,
    look: [0, 2.6, 3.9],
    viewDist: 13,
    footprint: [{ x: 0, z: -1, hw: 7.8, hd: 3.4 }],
  },
  {
    id: 'experience',
    title: 'Experience',
    landmark: 'Office Tower',
    hint: 'Hover the screen to pause it · scroll to read at your pace',
    kind: 'tower',
    color: '#3a86ff',
    x: 36,
    z: -34,
    face: [24, -22],
    triggerOffset: 10,
    radius: 4.5,
    look: [0, 2.7, 6.4],
    viewDist: 12.5,
    footprint: [{ x: 0, z: -1, hw: 5.2, hd: 3.6 }],
  },
  {
    id: 'certifications',
    title: 'Certifications',
    landmark: 'Trophy Hall',
    hint: 'Click a certificate to view it full size',
    kind: 'hall',
    color: '#f4b400',
    x: 42,
    z: 4,
    face: [28, 4],
    triggerOffset: 10.5,
    radius: 4.8,
    look: [0, 4, 2.7],
    viewDist: 13,
    footprint: [{ x: 0, z: -2.4, hw: 5.6, hd: 3.4 }],
  },
  {
    id: 'contact',
    title: 'Contact',
    landmark: 'Post Office',
    hint: 'Click a line on the board — or the mailbox — to get in touch',
    kind: 'postoffice',
    color: '#ef476f',
    x: 32,
    z: 36,
    face: [22, 26],
    triggerOffset: 10,
    radius: 4.5,
    look: [1.2, 3.4, 3.3],
    viewDist: 10.5,
    footprint: [
      { x: 0, z: -2, hw: 4, hd: 3 },
      { x: -4.6, z: 3, hw: 0.4, hd: 0.4 },
      { x: 1.6, z: 3.4, hw: 4.1, hd: 0.4 },
    ],
  },
]

export const STATIONS: Zone[] = DEFS.map(({ face, triggerOffset, ...d }) => {
  const dx = face[0] - d.x
  const dz = face[1] - d.z
  const len = Math.hypot(dx, dz)
  return {
    ...d,
    rot: Math.atan2(dx, dz),
    tx: d.x + (dx / len) * triggerOffset,
    tz: d.z + (dz / len) * triggerOffset,
  }
})

export const zoneById = (id: string) => STATIONS.find((s) => s.id === id)

/* ------------------------------------------------------------------ */
/* Terrain features                                                    */
/* ------------------------------------------------------------------ */

export const WORLD_HALF = 100 // ground texture covers [-100, 100]
export const WORLD_RADIUS = 86 // walkable radius
export const SPAWN: [number, number] = [0, 44]

export const PLAZA = { x: 0, z: 0, r: 10 }
export const FOUNTAIN_R = 3.4
export const POND = { x: -30, z: 34, r: 9.5 }

/** Path centre lines (smoothed with Catmull-Rom when drawn). */
export const PATHS: [number, number][][] = [
  // South entrance → plaza (passes under the torii).
  [
    [0, 58],
    [0, 44],
    [1, 34],
    [0, 20],
    [0, 9],
  ],
  // Spur to the Welcome Board.
  [
    [1, 36],
    [4.8, 34.3],
  ],
  // About
  [
    [-9, 1],
    [-18, 4],
    [-26, 1],
    [-31, 2],
  ],
  // Skills
  [
    [-6, -7],
    [-13, -14],
    [-17, -22],
    [-27, -28],
  ],
  // Projects
  [
    [0, -9],
    [3, -18],
    [-2, -28],
    [0, -38],
  ],
  // Experience
  [
    [6, -7],
    [12, -16],
    [20, -18],
    [28, -27],
  ],
  // Certifications
  [
    [9, 2],
    [18, 6],
    [26, 3],
    [31.5, 4],
  ],
  // Contact
  [
    [7, 7],
    [12, 16],
    [20, 20],
    [25, 28],
  ],
  // A lazy loop through the southern meadow, past the pond.
  [
    [-7, 7],
    [-14, 16],
    [-18, 26],
    [-20, 40],
    [-12, 50],
    [0, 52],
  ],
  [
    [0, 52],
    [12, 50],
    [20, 42],
    [24.5, 31],
  ],
]

export const PATH_WIDTH = 3.4

/* ------------------------------------------------------------------ */
/* Collision                                                           */
/* ------------------------------------------------------------------ */

export interface CircleCollider {
  type: 'circle'
  x: number
  z: number
  r: number
}

export interface BoxCollider {
  type: 'box'
  x: number
  z: number
  hw: number
  hd: number
  cos: number
  sin: number
}

export type Collider = CircleCollider | BoxCollider

export const colliders: Collider[] = [
  { type: 'circle', x: PLAZA.x, z: PLAZA.z, r: FOUNTAIN_R + 0.2 },
  { type: 'circle', x: POND.x, z: POND.z, r: POND.r - 1.2 },
]

/** Converts a station-local point to world space. */
export function toWorld(s: { x: number; z: number; rot: number }, lx: number, lz: number): [number, number] {
  const c = Math.cos(s.rot)
  const sn = Math.sin(s.rot)
  return [s.x + lx * c + lz * sn, s.z - lx * sn + lz * c]
}

for (const s of STATIONS) {
  const c = Math.cos(s.rot)
  const sn = Math.sin(s.rot)
  for (const b of s.footprint) {
    const [x, z] = toWorld(s, b.x, b.z)
    colliders.push({ type: 'box', x, z, hw: b.hw, hd: b.hd, cos: c, sin: sn })
  }
}

export function addCircleCollider(x: number, z: number, r: number) {
  colliders.push({ type: 'circle', x, z, r })
}

export function addBoxCollider(x: number, z: number, hw: number, hd: number, rot: number) {
  colliders.push({ type: 'box', x, z, hw, hd, cos: Math.cos(rot), sin: Math.sin(rot) })
}

/** Pushes a circle of radius `r` at (p.x, p.z) out of every collider. */
export function resolveCollisions(p: { x: number; z: number }, r: number, limit = WORLD_RADIUS) {
  for (const col of colliders) {
    if (col.type === 'circle') {
      const dx = p.x - col.x
      const dz = p.z - col.z
      const min = col.r + r
      const d2 = dx * dx + dz * dz
      if (d2 < min * min && d2 > 1e-8) {
        const d = Math.sqrt(d2)
        p.x = col.x + (dx / d) * min
        p.z = col.z + (dz / d) * min
      }
    } else {
      const dx = p.x - col.x
      const dz = p.z - col.z
      // Quick reject before the rotation maths.
      const reach = col.hw + col.hd + r
      if (dx * dx + dz * dz > reach * reach) continue
      const lx = dx * col.cos - dz * col.sin
      const lz = dx * col.sin + dz * col.cos
      const cx = Math.max(-col.hw, Math.min(col.hw, lx))
      const cz = Math.max(-col.hd, Math.min(col.hd, lz))
      const ox = lx - cx
      const oz = lz - cz
      const d2 = ox * ox + oz * oz
      let nx: number
      let nz: number
      if (d2 > 1e-8) {
        if (d2 >= r * r) continue
        const d = Math.sqrt(d2)
        nx = cx + (ox / d) * r
        nz = cz + (oz / d) * r
      } else {
        const px = col.hw - Math.abs(lx)
        const pz = col.hd - Math.abs(lz)
        if (px < pz) {
          nx = Math.sign(lx || 1) * (col.hw + r)
          nz = lz
        } else {
          nx = lx
          nz = Math.sign(lz || 1) * (col.hd + r)
        }
      }
      p.x = col.x + nx * col.cos + nz * col.sin
      p.z = col.z - nx * col.sin + nz * col.cos
    }
  }
  const len = Math.hypot(p.x, p.z)
  if (len > limit) {
    p.x *= limit / len
    p.z *= limit / len
  }
}
