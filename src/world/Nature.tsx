import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isTouchDevice, mulberry32, player } from './store'
import { getGroundCanvas, getMaskCanvas, isClearGrass, isGrass } from './terrain'
import { POND, SPAWN, STATIONS, WORLD_HALF, addCircleCollider, toWorld } from './zones'

/* ------------------------------------------------------------------ */
/* Shared wind uniform for every swaying material                      */
/* ------------------------------------------------------------------ */

const wind = { uTime: { value: 0 } }

/** Adds a gentle height-weighted sway to an instanced material. */
function addSway(material: THREE.Material, strength: number) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = wind.uTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <project_vertex>',
        `vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
         vec4 swayRoot = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
         float sway = sin(uTime * 1.3 + swayRoot.x * 0.15 + swayRoot.z * 0.11) * ${strength.toFixed(3)}
                    * max(mvPosition.y - 1.2, 0.0);
         mvPosition.x += sway;
         mvPosition.z += sway * 0.6;
         mvPosition = modelViewMatrix * mvPosition;
         gl_Position = projectionMatrix * mvPosition;`,
      )
  }
}

/* ------------------------------------------------------------------ */
/* Sky                                                                 */
/* ------------------------------------------------------------------ */

export const SKY_HORIZON = '#ffd9e8'

const Sky: React.FC = () => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color('#4f9dff') },
          mid: { value: new THREE.Color('#a9d6ff') },
          horizon: { value: new THREE.Color(SKY_HORIZON) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 top; uniform vec3 mid; uniform vec3 horizon;
          varying vec3 vPos;
          void main() {
            float h = max(vPos.y, 0.0);
            vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
            c = mix(c, top, smoothstep(0.18, 0.75, h));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  )
  return (
    <>
      <mesh material={material} renderOrder={-1}>
        <sphereGeometry args={[600, 32, 16]} />
      </mesh>
      <mesh position={[240, 300, 150]}>
        <sphereGeometry args={[18, 24, 24]} />
        <meshBasicMaterial color={[2.2, 2, 1.6]} toneMapped={false} fog={false} />
      </mesh>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Ground                                                              */
/* ------------------------------------------------------------------ */

const Ground: React.FC<{ onGroundClick: (e: ThreeEvent<MouseEvent>) => void }> = ({ onGroundClick }) => {
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(getGroundCanvas())
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={onGroundClick}>
        <planeGeometry args={[WORLD_HALF * 2, WORLD_HALF * 2]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
      {/* Beyond the painted area: plain meadow fading into fog. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[480, 48]} />
        <meshStandardMaterial color="#86c95f" roughness={1} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Grass: a tile of blades that wraps around the player (GPU)           */
/* ------------------------------------------------------------------ */

const BLADE_H = 0.55
const TILE = 64

const Grass: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = isTouchDevice ? 12000 : 28000

  const { geometry, material, uniforms } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.1, BLADE_H, 1, 4)
    geometry.translate(0, BLADE_H / 2, 0)
    const pos = geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / BLADE_H
      pos.setX(i, pos.getX(i) * (1 - t * 0.9))
    }
    const mask = new THREE.CanvasTexture(getMaskCanvas())
    const uniforms = {
      uTime: wind.uTime,
      uPlayer: { value: new THREE.Vector3() },
      uMask: { value: mask },
    }
    const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide })
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
           uniform float uTime;
           uniform vec3 uPlayer;
           uniform sampler2D uMask;
           varying float vH;`,
        )
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);')
        .replace(
          '#include <project_vertex>',
          `float h = clamp(position.y / ${BLADE_H.toFixed(2)}, 0.0, 1.0);
           vH = h;
           vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
           // Wrap this blade's tile cell so the field is always centred on the player.
           vec2 shift = ${TILE.toFixed(1)} * floor((uPlayer.xz - root.xz) / ${TILE.toFixed(1)} + 0.5);
           vec2 world = root.xz + shift;
           vec2 mUv = vec2((world.x + ${WORLD_HALF.toFixed(1)}) / ${(WORLD_HALF * 2).toFixed(1)},
                           1.0 - (world.y + ${WORLD_HALF.toFixed(1)}) / ${(WORLD_HALF * 2).toFixed(1)});
           float grassHere = texture2D(uMask, mUv).r;
           float edge = smoothstep(${(TILE / 2).toFixed(1)}, ${(TILE / 2 - 10).toFixed(1)}, length(world - uPlayer.xz));
           float keep = step(0.5, grassHere) * edge;
           vec4 mvPosition = instanceMatrix * vec4(transformed * keep, 1.0);
           mvPosition.xz += shift;
           float w = sin(uTime * 1.6 + world.x * 0.32 + world.y * 0.21) * 0.16
                   + sin(uTime * 3.3 + world.x * 0.9 + world.y * 0.7) * 0.05;
           mvPosition.x += w * h * h * keep;
           mvPosition.z += w * 0.5 * h * h * keep;
           vec2 away = world - uPlayer.xz;
           float push = smoothstep(1.3, 0.0, length(away)) * h * 0.55 * keep;
           mvPosition.xz += normalize(away + vec2(0.0001)) * push;
           mvPosition.y -= push * 0.4;
           mvPosition = modelViewMatrix * mvPosition;
           gl_Position = projectionMatrix * mvPosition;`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vH;')
        .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize(vNormal);')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.62, 1.1, vH);')
    }
    return { geometry, material, uniforms }
  }, [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const rand = mulberry32(42)
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const palette = ['#5fae3e', '#6dbf4a', '#7fd15a', '#4f9a36', '#8fd96a', '#a3df72']
    for (let i = 0; i < count; i++) {
      dummy.position.set((rand() - 0.5) * TILE, 0, (rand() - 0.5) * TILE)
      dummy.rotation.set((rand() - 0.5) * 0.3, rand() * Math.PI, (rand() - 0.5) * 0.3)
      dummy.scale.set(1, 0.6 + rand() * 0.7, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, color.set(palette[Math.floor(rand() * palette.length)]))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [count])

  useFrame(() => {
    uniforms.uPlayer.value.copy(player.pos)
  })

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} receiveShadow />
}

/* ------------------------------------------------------------------ */
/* Placement helpers                                                   */
/* ------------------------------------------------------------------ */

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t))
}

/** Keeps landmarks, their viewing corridors and the entrance free of clutter. */
function isOpenSpot(x: number, z: number, margin: number) {
  for (const s of STATIONS) {
    if (Math.hypot(x - s.x, z - s.z) < 11 + margin) return false
    const [cx, cz] = toWorld(s, s.look[0], s.look[1] + s.viewDist + 2)
    if (distToSegment(x, z, s.x, s.z, cx, cz) < 6 + margin) return false
  }
  if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 2.5 + margin) return false
  if (Math.hypot(x, z) < 12) return false
  if (Math.abs(x - SPAWN[0]) < 5 && z > 18 && z < 62) return false
  return true
}

/* ------------------------------------------------------------------ */
/* Trees: six species, three instanced meshes in total                 */
/* ------------------------------------------------------------------ */

type Species = 'cherry' | 'oak' | 'pine' | 'birch' | 'maple' | 'bush'

interface Blob {
  p: [number, number, number]
  s: [number, number, number]
}

interface SpeciesDef {
  trunk?: { h: number; r: number; color: string }
  blobs?: Blob[]
  cones?: { y: number; r: number; h: number }[]
  palette: string[]
}

const b = (x: number, y: number, z: number, s: number, sy = s): Blob => ({ p: [x, y, z], s: [s, sy, s] })

const SPECIES: Record<Species, SpeciesDef> = {
  cherry: {
    trunk: { h: 3, r: 0.3, color: '#6b4434' },
    blobs: [b(0, 3.4, 0, 1.55), b(1.1, 3, 0.4, 1.1), b(-1, 3.1, -0.3, 1.15), b(0.2, 2.9, -1.1, 1), b(-0.3, 4.3, 0.3, 1)],
    palette: ['#ffb7d5', '#ffc8dd', '#ff9ec7', '#ffd6e8', '#f9a8d4'],
  },
  oak: {
    trunk: { h: 3.2, r: 0.42, color: '#5b3a24' },
    blobs: [b(0, 4.3, 0, 2.1), b(1.5, 3.6, 0.3, 1.5), b(-1.4, 3.7, -0.4, 1.6), b(0.2, 3.5, -1.5, 1.4), b(0.1, 5.4, 0.2, 1.3)],
    palette: ['#4f9a3a', '#5daa45', '#6bb84f', '#468a33'],
  },
  pine: {
    trunk: { h: 1.8, r: 0.3, color: '#5b3a24' },
    cones: [
      { y: 1.2, r: 2.3, h: 3 },
      { y: 3, r: 1.75, h: 2.6 },
      { y: 4.6, r: 1.15, h: 2.2 },
    ],
    palette: ['#2f6b3a', '#3b7d45', '#2a5f34', '#356f3f'],
  },
  birch: {
    trunk: { h: 5.2, r: 0.2, color: '#eeede6' },
    blobs: [b(0, 5.4, 0, 1.1, 1.8), b(0.7, 4.4, 0.3, 0.9, 1.4), b(-0.6, 4.7, -0.3, 0.9, 1.5)],
    palette: ['#b5d65a', '#a3c94d', '#c9e07a', '#9bc142'],
  },
  maple: {
    trunk: { h: 3, r: 0.32, color: '#5e3b28' },
    blobs: [b(0, 3.6, 0, 1.7), b(1.2, 3.1, 0.3, 1.2), b(-1.1, 3.2, -0.3, 1.25), b(0.1, 4.6, 0.2, 1.1)],
    palette: ['#f97316', '#ef4444', '#f59e0b', '#ea580c', '#dc2626'],
  },
  bush: {
    blobs: [b(0, 0.45, 0, 1, 0.75), b(0.65, 0.35, 0.25, 0.7, 0.55), b(-0.55, 0.35, -0.2, 0.65, 0.5)],
    palette: ['#3f8f3a', '#4c9e40', '#5aab47', '#367d33'],
  },
}

interface TreeInst {
  x: number
  z: number
  s: number
  rot: number
  species: Species
}

let treeCache: TreeInst[] | null = null

function pick<T>(rand: () => number, weighted: [T, number][]): T {
  const total = weighted.reduce((a, [, w]) => a + w, 0)
  let r = rand() * total
  for (const [v, w] of weighted) {
    if ((r -= w) <= 0) return v
  }
  return weighted[0][0]
}

/** Species mix depends on the compass direction, so each side of the map feels different. */
function forestSpecies(rand: () => number, x: number, z: number): Species {
  const a = ((Math.atan2(x, -z) * 180) / Math.PI + 360) % 360 // 0 = north, clockwise
  if (a < 60 || a >= 320) return pick(rand, [['pine', 7], ['birch', 2], ['oak', 1]])
  if (a < 140) return pick(rand, [['maple', 6], ['oak', 3], ['birch', 1]])
  if (a < 230) return pick(rand, [['oak', 4], ['cherry', 4], ['pine', 2]])
  return pick(rand, [['birch', 5], ['pine', 3], ['oak', 2]])
}

function getTrees(): TreeInst[] {
  if (treeCache) return treeCache
  const rand = mulberry32(7)
  const out: TreeInst[] = []
  const place = (x: number, z: number, s: number, species: Species, spacing: number) => {
    if (!isClearGrass(x, z, species === 'bush' ? 1 : 2)) return false
    if (species !== 'bush' && !isOpenSpot(x, z, 0)) return false
    if (species === 'bush' && !isOpenSpot(x, z, -3)) return false
    for (const t of out) {
      const min = t.species === 'bush' || species === 'bush' ? 2.2 : spacing
      if (Math.abs(t.x - x) < min && Math.abs(t.z - z) < min && Math.hypot(t.x - x, t.z - z) < min) return false
    }
    out.push({ x, z, s, rot: rand() * Math.PI * 2, species })
    return true
  }
  const polar = (rMin: number, rMax: number): [number, number] => {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rMin * rMin + rand() * (rMax * rMax - rMin * rMin))
    return [Math.sin(a) * r, -Math.cos(a) * r]
  }

  // Forest belt around the edge of the world.
  for (let i = 0, n = 0; i < 2500 && n < (isTouchDevice ? 150 : 230); i++) {
    const [x, z] = polar(58, 96)
    if (place(x, z, 0.9 + rand() * 0.6, forestSpecies(rand, x, z), 4.6)) n++
  }
  // Scattered meadow trees, well spaced.
  for (let i = 0, n = 0; i < 1500 && n < 60; i++) {
    const [x, z] = polar(16, 58)
    const sp = pick<Species>(rand, [['cherry', 4], ['oak', 3], ['maple', 2], ['birch', 2], ['pine', 1]])
    if (place(x, z, 0.85 + rand() * 0.45, sp, 9)) n++
  }
  // A ring of cherry trees framing the plaza.
  for (let i = 0, n = 0; i < 300 && n < 9; i++) {
    const [x, z] = polar(13.5, 17)
    if (isClearGrass(x, z, 2.2) && place(x, z, 0.8 + rand() * 0.2, 'cherry', 6)) n++
  }
  // Undergrowth.
  for (let i = 0, n = 0; i < 2500 && n < (isTouchDevice ? 120 : 220); i++) {
    const [x, z] = polar(14, 92)
    if (place(x, z, 0.7 + rand() * 0.7, 'bush', 0)) n++
  }

  for (const t of out) {
    if (t.species !== 'bush') addCircleCollider(t.x, t.z, (SPECIES[t.species].trunk?.r ?? 0.3) * t.s + 0.25)
  }
  treeCache = out
  return out
}

const Trees: React.FC = () => {
  const trees = useMemo(getTrees, [])
  const trunks = useRef<THREE.InstancedMesh>(null)
  const blobs = useRef<THREE.InstancedMesh>(null)
  const cones = useRef<THREE.InstancedMesh>(null)

  const counts = useMemo(() => {
    let t = 0
    let bl = 0
    let c = 0
    for (const tr of trees) {
      const sp = SPECIES[tr.species]
      if (sp.trunk) t++
      bl += sp.blobs?.length ?? 0
      c += sp.cones?.length ?? 0
    }
    return { t, bl, c }
  }, [trees])

  const geos = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.6, 1, 1, 7)
    trunk.translate(0, 0.5, 0)
    const cone = new THREE.ConeGeometry(1, 1, 8)
    cone.translate(0, 0.5, 0)
    return { trunk, blob: new THREE.IcosahedronGeometry(1, 1), cone }
  }, [])

  const mats = useMemo(() => {
    const blob = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85 })
    const cone = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85 })
    addSway(blob, 0.02)
    addSway(cone, 0.012)
    return { trunk: new THREE.MeshStandardMaterial({ roughness: 0.9 }), blob, cone }
  }, [])

  useLayoutEffect(() => {
    if (!trunks.current || !blobs.current || !cones.current) return
    const rand = mulberry32(3)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const v = new THREE.Vector3()
    const sc = new THREE.Vector3()
    const color = new THREE.Color()
    let ti = 0
    let bi = 0
    let ci = 0
    for (const t of trees) {
      const sp = SPECIES[t.species]
      const cos = Math.cos(t.rot)
      const sin = Math.sin(t.rot)
      const local = (x: number, y: number, z: number) =>
        v.set(t.x + (x * cos + z * sin) * t.s, y * t.s, t.z + (-x * sin + z * cos) * t.s)
      if (sp.trunk) {
        m.compose(local(0, 0, 0), q.setFromEuler(e.set(0, t.rot, 0)), sc.set(sp.trunk.r * t.s, sp.trunk.h * t.s, sp.trunk.r * t.s))
        trunks.current.setMatrixAt(ti, m)
        trunks.current.setColorAt(ti++, color.set(sp.trunk.color))
      }
      for (const bl of sp.blobs ?? []) {
        const j = 0.9 + rand() * 0.2
        m.compose(
          local(...bl.p),
          q.setFromEuler(e.set(rand(), rand() * 6, rand())),
          sc.set(bl.s[0] * t.s * j, bl.s[1] * t.s * j, bl.s[2] * t.s * j),
        )
        blobs.current.setMatrixAt(bi, m)
        blobs.current.setColorAt(bi++, color.set(sp.palette[Math.floor(rand() * sp.palette.length)]))
      }
      for (const c of sp.cones ?? []) {
        m.compose(local(0, c.y, 0), q.setFromEuler(e.set(0, rand() * 6, 0)), sc.set(c.r * t.s, c.h * t.s, c.r * t.s))
        cones.current.setMatrixAt(ci, m)
        cones.current.setColorAt(ci++, color.set(sp.palette[Math.floor(rand() * sp.palette.length)]))
      }
    }
    for (const mesh of [trunks.current, blobs.current, cones.current]) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [trees])

  return (
    <>
      <instancedMesh ref={trunks} args={[geos.trunk, mats.trunk, counts.t]} castShadow />
      <instancedMesh ref={blobs} args={[geos.blob, mats.blob, counts.bl]} castShadow />
      <instancedMesh ref={cones} args={[geos.cone, mats.cone, counts.c]} castShadow />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Flowers: dense beds plus scattered wildflowers                      */
/* ------------------------------------------------------------------ */

interface FlowerData {
  beds: [number, number][]
  flowers: { x: number; z: number; h: number; s: number; color: string }[]
}

let flowerCache: FlowerData | null = null

/** Flower beds are also where butterflies like to hang out. */
export function getFlowerData(): FlowerData {
  if (flowerCache) return flowerCache
  const rand = mulberry32(99)
  const out: FlowerData['flowers'] = []
  const palettes = [
    ['#ff8fab', '#ffc2d1'],
    ['#ffe066', '#fff3b0'],
    ['#cdb4db', '#a78bfa'],
    ['#ffffff', '#fde2e4'],
    ['#ff5d8f', '#ff8fab'],
    ['#bde0fe', '#a2d2ff'],
    ['#f97316', '#fdba74'],
  ]
  const add = (x: number, z: number, color: string) => {
    if (!isGrass(x, z) || !isOpenSpot(x, z, -5)) return
    out.push({ x, z, h: 0.22 + rand() * 0.25, s: 0.8 + rand() * 0.6, color })
  }
  const bedCount = isTouchDevice ? 30 : 55
  const beds: [number, number][] = []
  for (let i = 0, n = 0; i < 600 && n < bedCount; i++) {
    const a = rand() * Math.PI * 2
    const r = 12 + rand() * 70
    const cx = Math.sin(a) * r
    const cz = Math.cos(a) * r
    if (!isClearGrass(cx, cz, 2.5) || !isOpenSpot(cx, cz, -4)) continue
    n++
    beds.push([cx, cz])
    const pal = palettes[Math.floor(rand() * palettes.length)]
    const radius = 1.6 + rand() * 1.8
    const count = 22 + Math.floor(rand() * 26)
    for (let k = 0; k < count; k++) {
      const fa = rand() * Math.PI * 2
      const fr = Math.sqrt(rand()) * radius
      add(cx + Math.cos(fa) * fr, cz + Math.sin(fa) * fr, pal[Math.floor(rand() * pal.length)])
    }
  }
  const all = palettes.flat()
  for (let i = 0; i < (isTouchDevice ? 400 : 900); i++) {
    const a = rand() * Math.PI * 2
    const r = 6 + Math.sqrt(rand()) * 80
    add(Math.sin(a) * r, Math.cos(a) * r, all[Math.floor(rand() * all.length)])
  }
  flowerCache = { beds, flowers: out }
  return flowerCache
}

const Flowers: React.FC = () => {
  const heads = useRef<THREE.InstancedMesh>(null)
  const stems = useRef<THREE.InstancedMesh>(null)
  const flowers = useMemo(() => getFlowerData().flowers, [])

  useLayoutEffect(() => {
    if (!heads.current || !stems.current) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    flowers.forEach((f, i) => {
      dummy.position.set(f.x, f.h, f.z)
      dummy.rotation.set(0, i, 0)
      dummy.scale.setScalar(f.s)
      dummy.updateMatrix()
      heads.current!.setMatrixAt(i, dummy.matrix)
      heads.current!.setColorAt(i, color.set(f.color))
      dummy.position.set(f.x, f.h / 2, f.z)
      dummy.scale.set(1, f.h / 0.5, 1)
      dummy.updateMatrix()
      stems.current!.setMatrixAt(i, dummy.matrix)
    })
    heads.current.instanceMatrix.needsUpdate = true
    stems.current.instanceMatrix.needsUpdate = true
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true
    heads.current.computeBoundingSphere()
    stems.current.computeBoundingSphere()
  }, [flowers])

  return (
    <>
      <instancedMesh ref={heads} args={[undefined, undefined, flowers.length]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={stems} args={[undefined, undefined, flowers.length]}>
        <cylinderGeometry args={[0.012, 0.015, 0.5, 4]} />
        <meshLambertMaterial color="#3f8f2f" />
      </instancedMesh>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Rocks                                                               */
/* ------------------------------------------------------------------ */

const Rocks: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null)
  const rocks = useMemo(() => {
    const rand = mulberry32(55)
    const out: { x: number; z: number; s: [number, number, number]; rot: number }[] = []
    const add = (x: number, z: number, size: number) => {
      if (!isClearGrass(x, z, size) || !isOpenSpot(x, z, -3)) return
      out.push({ x, z, s: [size * (0.8 + rand() * 0.5), size * (0.5 + rand() * 0.4), size * (0.8 + rand() * 0.5)], rot: rand() * 6 })
      if (size > 0.8) addCircleCollider(x, z, size * 0.9)
    }
    for (let i = 0; i < 110; i++) {
      const a = rand() * Math.PI * 2
      const r = 14 + rand() * 76
      add(Math.sin(a) * r, Math.cos(a) * r, 0.3 + rand() * rand() * 1.8)
    }
    // Stones around the pond.
    for (let i = 0; i < 22; i++) {
      const a = rand() * Math.PI * 2
      const r = POND.r + 1.4 + rand() * 1.2
      out.push({ x: POND.x + Math.cos(a) * r, z: POND.z + Math.sin(a) * r, s: [0.5, 0.3, 0.45], rot: rand() * 6 })
    }
    return out
  }, [])

  useLayoutEffect(() => {
    if (!ref.current) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const greys = ['#9ca3af', '#a8a29e', '#8b8f96', '#b5b0a8']
    rocks.forEach((r, i) => {
      dummy.position.set(r.x, r.s[1] * 0.35, r.z)
      dummy.rotation.set(0, r.rot, 0)
      dummy.scale.set(...r.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
      ref.current!.setColorAt(i, color.set(greys[i % greys.length]))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [rocks])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial flatShading roughness={0.95} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/* Petals, clouds, distant hills                                       */
/* ------------------------------------------------------------------ */

const Petals: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = isTouchDevice ? 110 : 220
  const data = useMemo(() => {
    const rand = mulberry32(11)
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 50,
      y: rand() * 16,
      z: (rand() - 0.5) * 50,
      fall: 0.5 + rand() * 0.7,
      sway: rand() * Math.PI * 2,
      spin: 0.6 + rand() * 2,
    }))
  }, [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, dt) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const step = Math.min(dt, 0.05)
    data.forEach((p, i) => {
      p.y -= p.fall * step
      p.x += Math.sin(t * 0.8 + p.sway) * 0.4 * step + 0.35 * step
      if (p.y < 0) p.y += 16
      const rx = ((((p.x - player.pos.x + 25) % 50) + 50) % 50) - 25
      const rz = ((((p.z - player.pos.z + 25) % 50) + 50) % 50) - 25
      dummy.position.set(player.pos.x + rx, p.y, player.pos.z + rz)
      dummy.rotation.set(t * p.spin, t * p.spin * 0.7, p.sway)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[0.14, 0.09]} />
      <meshBasicMaterial color="#ffb7d5" side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  )
}

const Clouds: React.FC = () => {
  const ref = useRef<THREE.Group>(null)
  const clouds = useMemo(() => {
    const rand = mulberry32(5)
    return Array.from({ length: 16 }, () => {
      const a = rand() * Math.PI * 2
      const r = 90 + rand() * 140
      return {
        pos: [Math.sin(a) * r, 45 + rand() * 25, Math.cos(a) * r] as [number, number, number],
        scale: 4 + rand() * 4,
        puffs: Array.from({ length: 5 }, (_, j) => [
          (j - 2) * 1.3 + (rand() - 0.5),
          (rand() - 0.3) * 0.8,
          (rand() - 0.5) * 1.2,
          0.9 + rand() * 0.7,
        ]),
      }
    })
  }, [])
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.004
  })
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos} scale={c.scale}>
          {c.puffs.map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s}>
              <icosahedronGeometry args={[1, 2]} />
              <meshLambertMaterial color="#ffffff" emissive="#ffe4ef" emissiveIntensity={0.35} fog={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

const Hills: React.FC = () => {
  const hills = useMemo(() => {
    const rand = mulberry32(21)
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + rand() * 0.2
      const r = 140 + rand() * 50
      return { x: Math.sin(a) * r, z: Math.cos(a) * r, s: 22 + rand() * 24, h: 0.35 + rand() * 0.35 }
    })
  }, [])
  return (
    <>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, -3, h.z]} scale={[h.s, h.s * h.h, h.s]}>
          <icosahedronGeometry args={[1, 2]} />
          <meshLambertMaterial color={i % 2 ? '#79b85a' : '#6aa84f'} flatShading />
        </mesh>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */

const WindClock: React.FC = () => {
  useFrame((state) => {
    wind.uTime.value = state.clock.elapsedTime
  })
  return null
}

interface NatureProps {
  onGroundClick: (e: ThreeEvent<MouseEvent>) => void
}

const Nature: React.FC<NatureProps> = ({ onGroundClick }) => (
  <>
    <WindClock />
    <Sky />
    <Clouds />
    <Hills />
    <Ground onGroundClick={onGroundClick} />
    <Grass />
    <Flowers />
    <Trees />
    <Rocks />
    <Petals />
  </>
)

export default Nature
