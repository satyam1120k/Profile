import React, { useMemo, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { Billboard, Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  about,
  certifications,
  codingProfiles,
  competencies,
  contactLinks,
  education,
  experience,
  expertise,
  homeBio,
  profile,
  projects,
  Project,
} from '../data/portfolio'
import {
  CanvasScreen,
  LinkRegion,
  ScrollScreen,
  drawChips,
  drawCover,
  drawParagraph,
  font,
  imageReady,
  openLink,
  roundRect,
  useImages,
  wrapLines,
} from './screens'
import { input } from './store'
import { STATIONS, Zone, addBoxCollider, toWorld, zoneById } from './zones'

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

const glow = (color: string, intensity = 2) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
)

const setCursor = (c: string) => (document.body.style.cursor = c)

/** Glowing ring where the visitor stands, plus a light beam to find it from afar. */
const TriggerMarker: React.FC<{ zone: Zone; active: boolean }> = ({ zone, active }) => {
  const ring = useRef<THREE.Mesh>(null)
  const beamMat = useRef<THREE.MeshBasicMaterial>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (ring.current) {
      ring.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04)
      ring.current.rotation.z += dt * 0.4
    }
    if (ringMat.current) {
      const target = active ? 0.9 : 0.55
      ringMat.current.opacity += (target - ringMat.current.opacity) * Math.min(1, dt * 6)
    }
    if (beamMat.current) {
      const target = active ? 0 : 0.15 + Math.sin(t * 1.5) * 0.04
      beamMat.current.opacity += (target - beamMat.current.opacity) * Math.min(1, dt * 4)
    }
  })

  return (
    <group position={[zone.tx, 0, zone.tz]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[zone.radius - 0.35, zone.radius - 0.1, 64, 1, 0, Math.PI * 1.85]} />
        <meshBasicMaterial ref={ringMat} color={zone.color} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[zone.radius - 0.35, 48]} />
        <meshBasicMaterial color={zone.color} transparent opacity={active ? 0.14 : 0.07} depthWrite={false} />
      </mesh>
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[0.55, 0.9, 18, 20, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color={zone.color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

const LABEL_HEIGHT: Record<Zone['kind'], number> = {
  welcome: 9.6,
  billboard: 13.2,
  lab: 11.6,
  tvshop: 12.6,
  tower: 20.6,
  hall: 10.4,
  postoffice: 10.8,
}

const FloatingLabel: React.FC<{ zone: Zone; hidden: boolean }> = ({ zone, hidden }) => {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.position.y = LABEL_HEIGHT[zone.kind] + Math.sin(state.clock.elapsedTime * 1.4) * 0.15
  })
  // While the visitor is reading this landmark, the HUD banner names it instead.
  return (
    <group ref={ref} visible={!hidden}>
      <Billboard>
        <mesh position={[0, 0.05, -0.02]}>
          <planeGeometry args={[Math.max(4.2, zone.title.length * 0.62 + 1.4), 1.75]} />
          <meshBasicMaterial color="#1e1b2e" transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <Text fontSize={0.78} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0.25, 0]} outlineWidth={0.02} outlineColor={zone.color}>
          {zone.title.toUpperCase()}
        </Text>
        <Text fontSize={0.34} color={zone.color} anchorX="center" anchorY="middle" position={[0, -0.45, 0]}>
          {zone.landmark}
        </Text>
      </Billboard>
    </group>
  )
}

/** Shared "card" look for the dark info screens. */
function darkBackdrop(ctx: CanvasRenderingContext2D, W: number, H: number, from: string, to: string) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2)
}

function screenHeader(ctx: CanvasRenderingContext2D, eyebrow: string, title: string, accent: string, x: number, y: number) {
  ctx.textBaseline = 'top'
  ctx.fillStyle = accent
  ctx.font = font(600, 24)
  ctx.fillText(eyebrow.toUpperCase(), x, y)
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 44)
  ctx.fillText(title, x, y + 32)
}

/** Converts a pixel rectangle on a canvas board to a plane placed on that board. */
function regionOnBoard(
  boardW: number,
  boardH: number,
  W: number,
  H: number,
  rect: { x: number; y: number; w: number; h: number },
) {
  return {
    width: (rect.w / W) * boardW,
    height: (rect.h / H) * boardH,
    x: ((rect.x + rect.w / 2) / W - 0.5) * boardW,
    y: (0.5 - (rect.y + rect.h / 2) / H) * boardH,
  }
}

/* ------------------------------------------------------------------ */
/* Home: Welcome board                                                 */
/* ------------------------------------------------------------------ */

const WelcomeBoard: React.FC = () => {
  const [photo] = useImages([profile.photo])
  const BW = 10
  const BH = 6.2

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number): LinkRegion[] => {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#fff7fb')
    g.addColorStop(1, '#f3e8ff')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(255, 93, 143, 0.07)'
    for (let i = 0; i < 9; i++) {
      ctx.beginPath()
      ctx.arc(W - 120 - i * 40, 90 + i * 70, 40 + i * 12, 0, Math.PI * 2)
      ctx.fill()
    }

    // Portrait.
    const cx = 70 + 125
    const cy = 60 + 125
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 125, 0, Math.PI * 2)
    ctx.clip()
    if (imageReady(photo)) drawCover(ctx, photo, cx - 125, cy - 125, 250, 250)
    ctx.restore()
    ctx.lineWidth = 8
    ctx.strokeStyle = '#ff8cc6'
    ctx.beginPath()
    ctx.arc(cx, cy, 129, 0, Math.PI * 2)
    ctx.stroke()

    ctx.textBaseline = 'top'
    ctx.fillStyle = '#a855f7'
    ctx.font = font(600, 24)
    ctx.fillText('WELCOME TO MY WORLD', 380, 66)
    ctx.fillStyle = '#1e1b2e'
    ctx.font = font(700, 62)
    ctx.fillText(`Hi, I'm ${profile.name} 👋`, 380, 100)
    const rg = ctx.createLinearGradient(380, 0, 900, 0)
    rg.addColorStop(0, '#ff5d8f')
    rg.addColorStop(1, '#7c3aed')
    ctx.fillStyle = rg
    ctx.font = font(600, 36)
    ctx.fillText(profile.role, 380, 182)
    ctx.fillStyle = '#6b7280'
    ctx.font = font(400, 24)
    ctx.fillText(`📍 ${profile.location}  ·  Open to opportunities`, 380, 236)

    ctx.fillStyle = '#374151'
    ctx.font = font(400, 25)
    let y = 330
    for (const p of homeBio) y = drawParagraph(ctx, p, 70, y, W - 140, 38) + 14

    drawChips(ctx, competencies, 70, y + 4, W - 140, { size: 22, bg: '#f3e8ff', fg: '#6d28d9' })

    // Buttons.
    const links: LinkRegion[] = []
    const buttons = [
      { label: '📄  Résumé', url: profile.resume, primary: true },
      { label: '🐙  GitHub', url: profile.github },
      { label: '💼  LinkedIn', url: profile.linkedin },
      { label: '📧  Email', url: `mailto:${profile.email}` },
    ]
    const by = H - 150
    const bh = 76
    const bw = (W - 140 - 3 * 22) / 4
    buttons.forEach((b, i) => {
      const bx = 70 + i * (bw + 22)
      if (b.primary) {
        const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0)
        bg.addColorStop(0, '#ff5d8f')
        bg.addColorStop(1, '#7c3aed')
        ctx.fillStyle = bg
      } else {
        ctx.fillStyle = '#ffffff'
      }
      roundRect(ctx, bx, by, bw, bh, 20)
      ctx.fill()
      if (!b.primary) {
        ctx.lineWidth = 3
        ctx.strokeStyle = '#d8b4fe'
        ctx.stroke()
      }
      ctx.fillStyle = b.primary ? '#ffffff' : '#6d28d9'
      ctx.font = font(600, 28)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(b.label, bx + bw / 2, by + bh / 2 + 2)
      ctx.textAlign = 'left'
      links.push({ x: bx, y: by, w: bw, h: bh, url: b.url })
    })

    ctx.fillStyle = '#9ca3af'
    ctx.font = font(400, 22)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Follow the paths → every landmark in this village tells part of my story', W / 2, H - 54)
    ctx.textAlign = 'left'
    return links
  }

  return (
    <group>
      {[-4.6, 4.6].map((x) => (
        <mesh key={x} position={[x, 3.8, -0.25]} castShadow>
          <boxGeometry args={[0.4, 7.6, 0.4]} />
          <meshStandardMaterial color="#8b5a3c" />
        </mesh>
      ))}
      <mesh position={[0, 4.3, -0.22]} castShadow>
        <boxGeometry args={[BW + 0.6, BH + 0.6, 0.3]} />
        <meshStandardMaterial color="#a86b45" />
      </mesh>
      {/* Little roof */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.9, 8.05, -0.2]} rotation={[0, 0, s * -0.2]} castShadow>
          <boxGeometry args={[6.2, 0.25, 1.3]} />
          <meshStandardMaterial color="#ff5d8f" />
        </mesh>
      ))}
      <CanvasScreen width={BW} height={BH} px={1400} position={[0, 4.3, -0.05]} draw={draw} deps={[photo]} />
      {/* Planters */}
      {[-4.6, 4.6].map((x) => (
        <group key={x} position={[x, 0, 0.5]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.4, 0.6, 0.8]} />
            <meshStandardMaterial color="#8b5a3c" />
          </mesh>
          {[-0.4, 0, 0.4].map((fx) => (
            <mesh key={fx} position={[fx, 0.75, 0]}>
              <icosahedronGeometry args={[0.24, 0]} />
              <meshStandardMaterial color={fx === 0 ? '#ffd166' : '#ff8fab'} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* About: LED billboard with auto-scrolling story                      */
/* ------------------------------------------------------------------ */

const ABOUT_PANEL = '#2b1442'

const AboutBillboard: React.FC = () => {
  const [photo] = useImages([profile.photo])
  const BW = 14
  const BH = 7
  const W = 1600
  const H = 800
  const panel = { x: 600, y: 190, w: 940, h: 560 }
  const inner = { x: panel.x + 18, y: panel.y + 18, w: panel.w - 36, h: panel.h - 36 }
  const region = regionOnBoard(BW, BH, W, H, inner)

  const drawBase = (ctx: CanvasRenderingContext2D) => {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#ff9f43')
    g.addColorStop(0.55, '#ff6b9a')
    g.addColorStop(1, '#a855f7')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    for (let i = 0; i < 14; i++) {
      ctx.beginPath()
      ctx.arc(300 + Math.cos(i) * 380, 400 + Math.sin(i * 1.7) * 300, 30 + i * 6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, 50, 60, 480, 480, 28)
    ctx.fill()
    ctx.save()
    roundRect(ctx, 62, 72, 456, 456, 20)
    ctx.clip()
    if (imageReady(photo)) drawCover(ctx, photo, 62, 72, 456, 456)
    ctx.restore()

    ctx.textBaseline = 'top'
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 46)
    ctx.fillText(profile.name, 52, 572)
    ctx.fillStyle = '#fff7ed'
    ctx.font = font(500, 27)
    ctx.fillText(profile.role, 52, 632)
    drawChips(ctx, ['Computer Vision', 'ML', 'Agentic AI'], 52, 684, 520, { size: 20, bg: 'rgba(255,255,255,0.22)', fg: '#ffffff' })

    screenHeader(ctx, 'About me', 'My story', '#ffe4f1', panel.x, 70)
    ctx.fillStyle = ABOUT_PANEL
    roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 26)
    ctx.fill()
  }

  const drawStory = (ctx: CanvasRenderingContext2D, w: number) => {
    let y = 30
    ctx.font = font(400, 30)
    about.forEach((p, i) => {
      ctx.fillStyle = i === about.length - 1 ? '#ffd6e8' : '#ffffff'
      y = drawParagraph(ctx, p, 34, y, w - 68, 46) + 28
    })
    return y + 10
  }

  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[14.4, 0.9, 1.8]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-6.6 + i * 0.78, 1.05, (i % 2) * 0.5 - 0.25]}>
          <icosahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color={['#ff8fab', '#ffd166', '#ffffff', '#cdb4db'][i % 4]} flatShading />
        </mesh>
      ))}
      {[-4.5, 4.5].map((x) => (
        <mesh key={x} position={[x, 2.4, -0.3]} castShadow>
          <boxGeometry args={[0.45, 3.4, 0.45]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 7.4, -0.3]} castShadow>
        <boxGeometry args={[BW + 0.5, BH + 0.5, 0.45]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.6} />
      </mesh>
      <CanvasScreen width={BW} height={BH} px={W} position={[0, 7.4, -0.06]} draw={drawBase} deps={[photo]} />
      <ScrollScreen
        width={region.width}
        height={region.height}
        px={inner.w}
        background={ABOUT_PANEL}
        draw={drawStory}
        speed={34}
        position={[region.x, 7.4 + region.y, -0.04]}
      />
      {[-4.6, 0, 4.6].map((x) => (
        <group key={x} position={[x, 11.2, 0.2]}>
          <mesh rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.5, 10]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, -0.12, 0.17]} rotation={[0.6 + Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.26, 12]} />
            <meshBasicMaterial color={[3, 2.8, 2.2]} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Skills: Tech lab with an expertise screen and coding profiles       */
/* ------------------------------------------------------------------ */

const SKILL_ORBS = [
  { label: 'Python', color: '#3b82f6' },
  { label: 'PyTorch', color: '#f97316' },
  { label: 'TensorFlow', color: '#f59e0b' },
  { label: 'OpenCV', color: '#22c55e' },
  { label: 'MediaPipe', color: '#14b8a6' },
  { label: 'C++', color: '#6366f1' },
  { label: 'SQL', color: '#eab308' },
  { label: 'Docker', color: '#0ea5e9' },
]

const TOOLBOX = ['Python', 'C++', 'SQL', 'TensorFlow', 'PyTorch', 'OpenCV', 'MediaPipe', 'NumPy', 'Pandas', 'Docker', 'Git', 'React']

const LAB_PANEL = '#0f2733'

const ExpertiseScreen: React.FC<{ x: number }> = ({ x }) => {
  const SW = 6.3
  const SH = 4.5
  const W = 1000
  const H = Math.round((W * SH) / SW)
  const panel = { x: 30, y: 130, w: 940, h: H - 160 }
  const inner = { x: panel.x + 14, y: panel.y + 14, w: panel.w - 28, h: panel.h - 28 }
  const region = regionOnBoard(SW, SH, W, H, inner)

  const drawBase = (ctx: CanvasRenderingContext2D) => {
    darkBackdrop(ctx, W, H, '#0b1a24', '#0d2b2b')
    screenHeader(ctx, 'Expertise', 'What I work with', '#2ec4b6', 34, 26)
    ctx.fillStyle = LAB_PANEL
    roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 20)
    ctx.fill()
  }

  const drawList = (ctx: CanvasRenderingContext2D, w: number) => {
    let y = 24
    for (const sec of expertise) {
      ctx.textBaseline = 'top'
      ctx.font = font(700, 30)
      ctx.fillStyle = sec.accent
      const titleLines = wrapLines(ctx, `${sec.emoji}  ${sec.title}`, w - 60)
      for (const l of titleLines) {
        ctx.fillText(l, 30, y)
        y += 40
      }
      y += 6
      ctx.font = font(400, 25)
      for (const pt of sec.points) {
        ctx.fillStyle = sec.accent
        ctx.fillText('•', 34, y)
        ctx.fillStyle = '#e2f7f4'
        y = drawParagraph(ctx, pt, 62, y, w - 100, 36) + 4
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(30, y + 14)
      ctx.lineTo(w - 30, y + 14)
      ctx.stroke()
      y += 34
    }
    return y
  }

  return (
    <group position={[x, 3.4, 3.42]}>
      <CanvasScreen width={SW} height={SH} px={W} draw={drawBase} />
      <ScrollScreen
        width={region.width}
        height={region.height}
        px={inner.w}
        background={LAB_PANEL}
        draw={drawList}
        speed={40}
        position={[region.x, region.y, 0.02]}
      />
    </group>
  )
}

const ProfilesScreen: React.FC<{ x: number }> = ({ x }) => {
  const logos = useImages(codingProfiles.map((p) => p.logo))
  const SW = 6.3
  const SH = 4.5

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number): LinkRegion[] => {
    darkBackdrop(ctx, W, H, '#0b1a24', '#14213d')
    screenHeader(ctx, 'Coding profiles', 'Click a card to visit', '#2ec4b6', 34, 26)
    const links: LinkRegion[] = []
    const cw = (W - 90) / 2
    codingProfiles.forEach((p, i) => {
      const cx = 30 + i * (cw + 30)
      const cy = 136
      const ch = 330
      ctx.fillStyle = '#132235'
      roundRect(ctx, cx, cy, cw, ch, 22)
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = p.color
      ctx.stroke()
      const logo = logos[i]
      if (imageReady(logo)) {
        ctx.fillStyle = '#ffffff'
        roundRect(ctx, cx + 24, cy + 24, 84, 84, 16)
        ctx.fill()
        ctx.drawImage(logo, cx + 32, cy + 32, 68, 68)
      }
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'
      ctx.font = font(700, 34)
      ctx.fillText(p.platform, cx + 126, cy + 30)
      ctx.fillStyle = '#9fb3c8'
      ctx.font = font(400, 20)
      ctx.fillText(p.description, cx + 126, cy + 74, cw - 140)

      const stat = (label: string, value: string, sx: number) => {
        ctx.fillStyle = p.color
        ctx.font = font(700, 52)
        ctx.fillText(value, sx, cy + 136)
        ctx.fillStyle = '#9fb3c8'
        ctx.font = font(500, 20)
        ctx.fillText(label, sx, cy + 200)
      }
      stat('Rating', p.rating, cx + 28)
      stat('Solved', p.solved, cx + cw / 2 + 10)

      ctx.fillStyle = p.color
      roundRect(ctx, cx + 24, cy + ch - 74, cw - 48, 52, 26)
      ctx.fill()
      ctx.fillStyle = '#0b1a24'
      ctx.font = font(700, 23)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Visit profile ↗', cx + cw / 2, cy + ch - 47)
      ctx.textAlign = 'left'
      links.push({ x: cx, y: cy, w: cw, h: ch, url: p.url })
    })
    ctx.fillStyle = '#2ec4b6'
    ctx.font = font(600, 22)
    ctx.textBaseline = 'top'
    ctx.fillText('TOOLBOX', 34, 494)
    drawChips(ctx, TOOLBOX, 30, 530, W - 60, { size: 21, bg: 'rgba(46,196,182,0.16)', fg: '#ccfbf1' })
    return links
  }

  return <CanvasScreen width={SW} height={SH} px={1000} position={[x, 3.4, 3.42]} draw={draw} deps={logos} />
}

const TechLab: React.FC = () => {
  const orbit = useRef<THREE.Group>(null)
  const beacon = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((state, dt) => {
    if (orbit.current) {
      orbit.current.rotation.y += dt * 0.35
      orbit.current.children.forEach((c, i) => {
        c.position.y = Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.25
      })
    }
    if (beacon.current) beacon.current.emissiveIntensity = 1 + Math.max(0, Math.sin(state.clock.elapsedTime * 4)) * 3
  })
  const teal = '#2ec4b6'
  return (
    <group>
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[3.9, 4.1, 0.3, 40]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 2.1, 0]} castShadow>
          <cylinderGeometry args={[3.4, 3.4, 3.6, 40]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <cylinderGeometry args={[3.43, 3.43, 0.7, 40, 1, true]} />
          {glow(teal, 1.2)}
        </mesh>
        <mesh position={[0, 3.9, 0]} castShadow>
          <sphereGeometry args={[3.4, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#99f6e4" metalness={0.3} roughness={0.1} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 7.8, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 1.6]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 8.7, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial ref={beacon} color="#ef4444" emissive="#ef4444" toneMapped={false} />
        </mesh>
        <group position={[0, 8.6, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.8, 0.04, 8, 80]} />
            {glow(teal, 1.5)}
          </mesh>
          <group ref={orbit}>
            {SKILL_ORBS.map((s, i) => {
              const a = (i / SKILL_ORBS.length) * Math.PI * 2
              return (
                <group key={s.label}>
                  <group position={[Math.sin(a) * 3.8, 0, Math.cos(a) * 3.8]}>
                    <mesh>
                      <icosahedronGeometry args={[0.42, 0]} />
                      <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1.2} flatShading toneMapped={false} />
                    </mesh>
                    <Billboard position={[0, -0.85, 0]}>
                      <Text fontSize={0.36} color="#ffffff" outlineWidth={0.03} outlineColor="#0f172a" anchorX="center">
                        {s.label}
                      </Text>
                    </Billboard>
                  </group>
                </group>
              )
            })}
          </group>
        </group>
      </group>

      {/* Screen wall */}
      <mesh position={[0, 3.4, 3.15]} castShadow>
        <boxGeometry args={[13.4, 5.1, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      {[-6, 0, 6].map((x) => (
        <mesh key={x} position={[x, 0.5, 3.15]} castShadow>
          <boxGeometry args={[0.5, 1, 0.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      <mesh position={[0, 6.03, 3.4]}>
        <boxGeometry args={[13.4, 0.08, 0.08]} />
        {glow(teal, 2)}
      </mesh>
      <ExpertiseScreen x={-3.3} />
      <ProfilesScreen x={3.3} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Projects: TV shop                                                   */
/* ------------------------------------------------------------------ */

const TV_W = 4.4
const TV_H = 2.75

const ProjectTV: React.FC<{ project: Project; index: number; position: [number, number, number] }> = ({
  project,
  index,
  position,
}) => {
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number): LinkRegion[] => {
    ctx.fillStyle = '#100c20'
    ctx.fillRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, W, 180)
    g.addColorStop(0, project.colors[0])
    g.addColorStop(1, project.colors[1])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, 150)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    for (let y = 0; y < 150; y += 6) ctx.fillRect(0, y, W, 2)

    // Emoji take their opacity from fillStyle, so reset it to opaque first.
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.font = '80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
    ctx.fillText(project.icon, 36, 78)
    // Category chip + project number.
    ctx.font = font(600, 22)
    const label = project.category
    const lw = ctx.measureText(label).width + 36
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    roundRect(ctx, W - lw - 36, 34, lw, 44, 22)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, W - lw - 18, 57)
    ctx.font = font(700, 22)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(`PROJECT ${String(index + 1).padStart(2, '0')}`, W - 200, 118)

    ctx.textBaseline = 'top'
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 44)
    ctx.fillText(project.title, 40, 166, W - 80)
    ctx.fillStyle = '#e0e0fa'
    ctx.font = font(400, 28)
    const lines = wrapLines(ctx, project.description, W - 80).slice(0, 2)
    lines.forEach((l, i) => ctx.fillText(l, 40, 226 + i * 38))
    drawChips(ctx, project.technologies, 40, 314, W - 80, { size: 22, bg: 'rgba(255,255,255,0.14)', fg: '#ffffff' })

    const links: LinkRegion[] = []
    const by = H - 96
    const bh = 70
    const primaryUrl = project.demo || project.github
    const primaryLabel = project.demo ? '▶  Live demo ↗' : 'View code on GitHub ↗'
    const pw = project.demo ? 420 : W - 80
    const bg = ctx.createLinearGradient(40, 0, 40 + pw, 0)
    bg.addColorStop(0, project.colors[0])
    bg.addColorStop(1, project.colors[1])
    ctx.fillStyle = bg
    roundRect(ctx, 40, by, pw, bh, 32)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 28)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(primaryLabel, 40 + pw / 2, by + bh / 2 + 1)
    links.push({ x: 40, y: by, w: pw, h: bh, url: primaryUrl })
    if (project.demo) {
      const gx = 40 + pw + 20
      const gw = W - 40 - gx
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 3
      roundRect(ctx, gx, by, gw, bh, 32)
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.fillText('GitHub ↗', gx + gw / 2, by + bh / 2 + 1)
      links.push({ x: gx, y: by, w: gw, h: bh, url: project.github })
    }
    ctx.textAlign = 'left'
    return links
  }

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[TV_W + 0.24, TV_H + 0.24, 0.3]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      <CanvasScreen width={TV_W} height={TV_H} px={880} position={[0, 0, 0.16]} draw={draw} fallbackUrl={project.demo || project.github} />
      <mesh position={[TV_W / 2 - 0.1, -TV_H / 2 - 0.06, 0.17]}>
        <circleGeometry args={[0.04, 8]} />
        <meshBasicMaterial color="#22c55e" toneMapped={false} />
      </mesh>
    </group>
  )
}

const TVShop: React.FC = () => {
  const purple = '#7c3aed'
  const stripes = 14
  return (
    <group position={[0, 0, -1]}>
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 8.4, 6.8]} />
        <meshStandardMaterial color="#ede9fe" roughness={0.8} />
      </mesh>
      <mesh position={[0, 8.6, 0]} castShadow>
        <boxGeometry args={[16.8, 0.45, 7.4]} />
        <meshStandardMaterial color={purple} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[16.3, 0.3, 7.1]} />
        <meshStandardMaterial color="#4c1d95" />
      </mesh>
      {projects.slice(0, 6).map((p, i) => (
        <ProjectTV key={p.title} project={p} index={i} position={[-5 + (i % 3) * 5, 5.15 - Math.floor(i / 3) * 3.15, 3.55]} />
      ))}
      <group position={[0, 7.2, 4.0]} rotation={[0.45, 0, 0]}>
        {Array.from({ length: stripes }, (_, i) => (
          <mesh key={i} position={[-7.7 + (i + 0.5) * (15.4 / stripes), 0, 0]} castShadow>
            <boxGeometry args={[15.4 / stripes, 0.08, 1.4]} />
            <meshStandardMaterial color={i % 2 ? '#ffffff' : '#ec4899'} />
          </mesh>
        ))}
      </group>
      <group position={[0, 10, 2]}>
        <mesh>
          <boxGeometry args={[9, 2.2, 0.25]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        {[-3.8, 3.8].map((x) => (
          <mesh key={x} position={[x, -1.1, -0.3]}>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        ))}
        <Text position={[0, 0.3, 0.14]} fontSize={0.95} color="#f0abfc" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#c026d3" outlineBlur={0.15}>
          TV SHOP
        </Text>
        <Text position={[0, -0.62, 0.14]} fontSize={0.34} color="#67e8f9" anchorX="center" anchorY="middle" letterSpacing={0.2}>
          NOW SHOWING: MY PROJECTS
        </Text>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Experience: Office tower with a lobby screen                        */
/* ------------------------------------------------------------------ */

const TOWER_PANEL = '#0d2148'

const ExperienceScreen: React.FC = () => {
  const SW = 8.4
  const SH = 6.2
  const W = 1200
  const H = Math.round((W * SH) / SW)
  const panel = { x: 30, y: 150, w: W - 60, h: H - 180 }
  const inner = { x: panel.x + 14, y: panel.y + 14, w: panel.w - 28, h: panel.h - 28 }
  const region = regionOnBoard(SW, SH, W, H, inner)

  const drawBase = (ctx: CanvasRenderingContext2D) => {
    darkBackdrop(ctx, W, H, '#081631', '#10204a')
    screenHeader(ctx, 'Office tower', 'Experience & Education', '#60a5fa', 40, 34)
    ctx.fillStyle = TOWER_PANEL
    roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 22)
    ctx.fill()
  }

  const drawTimeline = (ctx: CanvasRenderingContext2D, w: number) => {
    let y = 26
    const heading = (t: string) => {
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#93c5fd'
      ctx.font = font(700, 28)
      ctx.fillText(t, 30, y)
      y += 54
    }
    const card = (title: string, org: string, meta: string, desc: string, badge?: string) => {
      const x = 30
      const cw = w - 60
      // Measure first so the card background can be drawn behind the text.
      ctx.font = font(400, 25)
      const descLines = wrapLines(ctx, desc, cw - 60)
      const ch = 40 + 44 + 38 + 36 + descLines.length * 36 + 20
      ctx.fillStyle = '#132c5c'
      roundRect(ctx, x, y, cw, ch, 20)
      ctx.fill()
      ctx.fillStyle = '#3a86ff'
      roundRect(ctx, x, y, 8, ch, 4)
      ctx.fill()
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'
      ctx.font = font(700, 34)
      ctx.fillText(title, x + 30, y + 28, cw - (badge ? 260 : 60))
      ctx.fillStyle = '#60a5fa'
      ctx.font = font(600, 26)
      ctx.fillText(org, x + 30, y + 76)
      ctx.fillStyle = '#bfdbfe'
      ctx.font = font(400, 22)
      ctx.fillText(meta, x + 30, y + 116)
      ctx.fillStyle = '#e0e7ff'
      ctx.font = font(400, 25)
      descLines.forEach((l, i) => ctx.fillText(l, x + 30, y + 158 + i * 36))
      if (badge) {
        ctx.font = font(700, 24)
        const bw = ctx.measureText(badge).width + 36
        ctx.fillStyle = 'rgba(58,134,255,0.25)'
        roundRect(ctx, x + cw - bw - 24, y + 26, bw, 46, 23)
        ctx.fill()
        ctx.fillStyle = '#bfdbfe'
        ctx.textBaseline = 'middle'
        ctx.fillText(badge, x + cw - bw - 6, y + 50)
      }
      y += ch + 24
    }
    heading('💼  EXPERIENCE')
    for (const e of experience) card(e.title, e.company, `📅 ${e.period}   ·   📍 ${e.location}`, e.description)
    y += 16
    heading('🎓  EDUCATION')
    for (const e of education) card(e.degree, e.institution, `📅 ${e.period}   ·   📍 ${e.location}`, e.description, e.score)
    return y + 10
  }

  return (
    <group position={[0, 6.4, 3.6]}>
      <CanvasScreen width={SW} height={SH} px={W} draw={drawBase} />
      <ScrollScreen
        width={region.width}
        height={region.height}
        px={inner.w}
        background={TOWER_PANEL}
        draw={drawTimeline}
        speed={36}
        position={[region.x, region.y, 0.02]}
      />
    </group>
  )
}

const OfficeTower: React.FC = () => {
  const windows = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 512
    const ctx = c.getContext('2d')!
    let seed = 17
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    ctx.fillStyle = '#7d93b8'
    ctx.fillRect(0, 0, 256, 512)
    const cols = 6
    const rows = 14
    const cw = 256 / cols
    const rh = 512 / rows
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const v = rand()
        ctx.fillStyle = v > 0.82 ? '#fde68a' : v > 0.4 ? '#cfe3ff' : '#a9c4ec'
        ctx.fillRect(col * cw + 5, r * rh + 6, cw - 10, rh - 12)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fillRect(col * cw + 5, r * rh + 6, (cw - 10) * 0.35, rh - 12)
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const light = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((state) => {
    if (light.current) light.current.emissiveIntensity = Math.sin(state.clock.elapsedTime * 3) > 0.6 ? 4 : 0.3
  })

  return (
    <group position={[0, 0, -1]}>
      <mesh position={[0, 9, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 18, 7]} />
        <meshStandardMaterial attach="material-0" map={windows} roughness={0.3} metalness={0.2} />
        <meshStandardMaterial attach="material-1" map={windows} roughness={0.3} metalness={0.2} />
        <meshStandardMaterial attach="material-2" color="#475569" />
        <meshStandardMaterial attach="material-3" color="#475569" />
        <meshStandardMaterial attach="material-4" color="#64748b" roughness={0.4} />
        <meshStandardMaterial attach="material-5" map={windows} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Screen frame */}
      <mesh position={[0, 6.4, 3.52]} castShadow>
        <boxGeometry args={[8.9, 6.7, 0.1]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
      <ExperienceScreen />
      {/* Lobby */}
      <mesh position={[0, 1.45, 3.55]}>
        <boxGeometry args={[5, 2.9, 0.1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[0, 3.0, 4.2]} castShadow>
        <boxGeometry args={[6, 0.2, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 18.1, 0]}>
        <boxGeometry args={[10.3, 0.25, 7.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 18.3, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.12, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <Text position={[0, 18.37, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} color="#facc15" anchorX="center" anchorY="middle">
        H
      </Text>
      <mesh position={[4.5, 19.3, -3]}>
        <cylinderGeometry args={[0.04, 0.04, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[4.5, 20.35, -3]}>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial ref={light} color="#ef4444" emissive="#ef4444" toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Certifications: Trophy hall with a gallery of real certificates     */
/* ------------------------------------------------------------------ */

const CERT_W = 3.1
const CERT_H = 2.9

const EASELS = certifications.map((_, i) => {
  const n = certifications.length
  const x = (i - (n - 1) / 2) * 3.45
  const z = 3.6 + (Math.abs(x) / 6.9) * 1.5
  const rot = Math.atan2(-x, 14 - z)
  return { x, z, rot }
})

// Easels are solid: register their colliders once.
;(() => {
  const hall = zoneById('certifications')
  if (!hall) return
  for (const e of EASELS) {
    const [wx, wz] = toWorld(hall, e.x, e.z)
    addBoxCollider(wx, wz, CERT_W / 2, 0.45, hall.rot + e.rot)
  }
})()

const CertificateEasel: React.FC<{ cert: (typeof certifications)[number]; img: HTMLImageElement; x: number; z: number; rot: number }> = ({
  cert,
  img,
  x,
  z,
  rot,
}) => {
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = '#fffaf0'
    ctx.fillRect(0, 0, W, H)
    const area = { x: 26, y: 26, w: W - 52, h: H * 0.68 }
    ctx.fillStyle = '#f3ead8'
    ctx.fillRect(area.x, area.y, area.w, area.h)
    if (imageReady(img)) {
      const s = Math.min(area.w / img.width, area.h / img.height)
      const iw = img.width * s
      const ih = img.height * s
      ctx.drawImage(img, area.x + (area.w - iw) / 2, area.y + (area.h - ih) / 2, iw, ih)
    }
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#1f2937'
    ctx.font = font(700, 32)
    const titleY = area.y + area.h + 22
    ctx.fillText(cert.title, 28, titleY, W - 56)
    ctx.fillStyle = '#92400e'
    ctx.font = font(500, 23)
    ctx.fillText(`${cert.issuer} · ${cert.date}`, 28, titleY + 46, W - 56)
    ctx.fillStyle = '#b45309'
    ctx.font = font(600, 20)
    ctx.textAlign = 'right'
    ctx.fillText('🔍 Click to view', W - 28, titleY + 84)
    ctx.textAlign = 'left'
  }

  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Easel legs */}
      {[-0.9, 0.9].map((lx) => (
        <mesh key={lx} position={[lx, 1.9, -0.12]} rotation={[0.08, 0, lx > 0 ? -0.05 : 0.05]} castShadow>
          <boxGeometry args={[0.12, 3.9, 0.12]} />
          <meshStandardMaterial color="#8b5a3c" />
        </mesh>
      ))}
      <mesh position={[0, 1.7, -0.7]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 3.5, 0.1]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>
      <mesh position={[0, 1.08, 0.02]}>
        <boxGeometry args={[CERT_W + 0.4, 0.12, 0.35]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>
      {/* Gold frame */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[CERT_W + 0.24, CERT_H + 0.24, 0.12]} />
        <meshStandardMaterial color="#f4b400" metalness={0.8} roughness={0.3} />
      </mesh>
      <CanvasScreen width={CERT_W} height={CERT_H} px={700} position={[0, 2.6, 0.07]} draw={draw} fallbackUrl={cert.image} deps={[img]} />
    </group>
  )
}

const Trophy: React.FC = () => {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.8
      ref.current.position.y = 2.15 + Math.sin(state.clock.elapsedTime * 1.6) * 0.08
    }
  })
  const cup = useMemo(
    () =>
      [
        [0, 0],
        [0.32, 0.02],
        [0.34, 0.1],
        [0.12, 0.18],
        [0.08, 0.55],
        [0.2, 0.68],
        [0.5, 0.95],
        [0.58, 1.5],
        [0.54, 1.52],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const gold = <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.22} emissive="#b45309" emissiveIntensity={0.25} />
  return (
    <group position={[0, 0, -1.2]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.75, 1.1, 24]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.3} />
      </mesh>
      <group ref={ref}>
        <mesh castShadow>
          <latheGeometry args={[cup, 32]} />
          {gold}
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.6, 1.15, 0]} rotation={[0, 0, s * 0.3]}>
            <torusGeometry args={[0.22, 0.05, 8, 20, Math.PI * 1.3]} />
            {gold}
          </mesh>
        ))}
      </group>
      <Sparkles count={30} scale={[2.5, 3, 2.5]} position={[0, 3, 0]} size={4} speed={0.4} color="#fde68a" />
    </group>
  )
}

const TrophyHall: React.FC = () => {
  const imgs = useImages(certifications.map((c) => c.image))
  const marble = '#f5f5f4'
  const gold = '#f4b400'
  return (
    <group>
      <group position={[0, 0, -2.4]}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[11.6, 0.4, 7.4]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, 0.6, -0.2]} receiveShadow castShadow>
          <boxGeometry args={[11, 0.4, 6.6]} />
          <meshStandardMaterial color={marble} />
        </mesh>
        {[-4.8, -2.4, 0, 2.4, 4.8].map((x) => (
          <group key={x} position={[x, 0.8, 2.6]}>
            <mesh position={[0, 2.4, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.38, 4.8, 16]} />
              <meshStandardMaterial color={marble} roughness={0.35} />
            </mesh>
            <mesh position={[0, 4.85, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.9]} />
              <meshStandardMaterial color={marble} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 3.2, -3.1]} castShadow>
          <boxGeometry args={[10.8, 5, 0.4]} />
          <meshStandardMaterial color="#fafaf9" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 5.3, 3.2, -0.5]} castShadow>
            <boxGeometry args={[0.4, 5, 5.2]} />
            <meshStandardMaterial color="#fafaf9" />
          </mesh>
        ))}
        <mesh position={[0, 5.95, -0.3]} castShadow>
          <boxGeometry args={[11.6, 0.5, 6.8]} />
          <meshStandardMaterial color={marble} />
        </mesh>
        <mesh position={[0, 6.3, 3.05]}>
          <boxGeometry args={[11.6, 0.2, 0.1]} />
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 6.75, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[6.7, 6.8, 1.2]} castShadow>
          <cylinderGeometry args={[1, 1, 1, 3]} />
          <meshStandardMaterial color="#fafaf9" />
        </mesh>
        <Text position={[0, 5.95, 3.12]} fontSize={0.38} color="#a16207" anchorX="center" anchorY="middle" letterSpacing={0.3}>
          HALL OF ACHIEVEMENTS
        </Text>
        <Trophy />
      </group>
      {certifications.map((c, i) => (
        <CertificateEasel key={c.title} cert={c} img={imgs[i]} {...EASELS[i]} />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Contact: Post office with a notice board                            */
/* ------------------------------------------------------------------ */

const ContactBoard: React.FC = () => {
  const BW = 7.8
  const BH = 5.2
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number): LinkRegion[] => {
    // Cork board.
    ctx.fillStyle = '#c98f5a'
    ctx.fillRect(0, 0, W, H)
    let seed = 9
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(120,70,30,0.25)' : 'rgba(255,230,190,0.18)'
      ctx.fillRect(rand() * W, rand() * H, 3, 3)
    }
    // Pinned paper.
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = '#fffdf7'
    roundRect(ctx, 40, 32, W - 80, H - 64, 14)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = '#ef476f'
    ctx.beginPath()
    ctx.arc(W / 2, 46, 13, 0, Math.PI * 2)
    ctx.fill()

    ctx.textBaseline = 'top'
    ctx.fillStyle = '#1f2937'
    ctx.font = font(700, 50)
    ctx.fillText("Let's connect 📬", 80, 70)
    ctx.fillStyle = '#6b7280'
    ctx.font = font(400, 25)
    ctx.fillText("Have an idea, a role or a project? I'd love to hear from you.", 80, 134, W - 160)

    const links: LinkRegion[] = []
    const rowH = 92
    contactLinks.forEach((c, i) => {
      const y = 186 + i * (rowH + 10)
      const x = 80
      const w = W - 160
      ctx.fillStyle = i % 2 ? '#fdf2f8' : '#fff1f2'
      roundRect(ctx, x, y, w, rowH, 18)
      ctx.fill()
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.font = '42px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
      ctx.fillText(c.icon, x + 22, y + rowH / 2 + 2)
      ctx.fillStyle = '#be123c'
      ctx.font = font(600, 22)
      ctx.fillText(c.label.toUpperCase(), x + 96, y + 27)
      ctx.fillStyle = '#1f2937'
      ctx.font = font(600, 31)
      ctx.fillText(c.value, x + 96, y + 62, w - 170)
      ctx.fillStyle = '#ef476f'
      ctx.font = font(700, 32)
      ctx.textAlign = 'right'
      ctx.fillText('↗', x + w - 26, y + rowH / 2)
      ctx.textAlign = 'left'
      links.push({ x, y, w, h: rowH, url: c.url })
    })
    return links
  }

  return (
    <group position={[1.6, 0, 3.4]}>
      {[-4, 4].map((x) => (
        <mesh key={x} position={[x, 3, -0.15]} castShadow>
          <boxGeometry args={[0.28, 6, 0.28]} />
          <meshStandardMaterial color="#7c4a26" />
        </mesh>
      ))}
      <mesh position={[0, 3.4, -0.12]} castShadow>
        <boxGeometry args={[BW + 0.4, BH + 0.4, 0.2]} />
        <meshStandardMaterial color="#7c4a26" />
      </mesh>
      <mesh position={[0, 6.35, -0.1]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[BW + 1, 0.15, 0.9]} />
        <meshStandardMaterial color="#ef476f" />
      </mesh>
      <CanvasScreen width={BW} height={BH} px={1200} position={[0, 3.4, 0]} draw={draw} />
    </group>
  )
}

const Envelope: React.FC = () => {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = 8.6 + Math.sin(t * 1.4) * 0.3
    ref.current.rotation.y = Math.sin(t * 0.7) * 0.5
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.08
  })
  return (
    <group ref={ref} position={[0, 8.6, -2]}>
      <mesh castShadow>
        <boxGeometry args={[2.2, 1.4, 0.08]} />
        <meshStandardMaterial color="#fffbeb" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.53, 0.25, 0.05]} rotation={[0, 0, s * 0.55]}>
          <boxGeometry args={[1.3, 0.05, 0.02]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>
      ))}
      <mesh position={[0, -0.05, 0.07]}>
        <circleGeometry args={[0.22, 20]} />
        {glow('#ef476f', 1.6)}
      </mesh>
    </group>
  )
}

const PostOffice: React.FC = () => {
  const red = '#ef476f'
  const mailClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return
    e.stopPropagation()
    openLink(`mailto:${profile.email}`)
  }
  return (
    <group>
      <group position={[0, 0, -2]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 4, 6]} />
          <meshStandardMaterial color="#fff1e6" />
        </mesh>
        <group position={[0, 4.85, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[4.1, 9, 1.8]} castShadow>
            <cylinderGeometry args={[1, 1, 1, 3]} />
            <meshStandardMaterial color={red} flatShading />
          </mesh>
        </group>
        <mesh position={[2.6, 5.8, -1]} castShadow>
          <boxGeometry args={[0.6, 1.6, 0.6]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
        <mesh position={[-1.6, 1.25, 3.02]}>
          <boxGeometry args={[1.4, 2.5, 0.08]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        {[1.4, 3.0].map((x) => (
          <group key={x} position={[x, 2.2, 3.02]}>
            <mesh>
              <boxGeometry args={[1.2, 1.1, 0.08]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1, 0.9]} />
              <meshStandardMaterial color="#bae6fd" emissive="#fde68a" emissiveIntensity={0.25} />
            </mesh>
          </group>
        ))}
        <group position={[-1.6, 3.35, 3.06]}>
          <mesh>
            <boxGeometry args={[3.4, 0.6, 0.1]} />
            <meshStandardMaterial color={red} />
          </mesh>
          <Text position={[0, 0, 0.06]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.15}>
            POST OFFICE
          </Text>
        </group>
      </group>
      <ContactBoard />
      {/* Mailbox: click to email */}
      <group
        position={[-4.6, 0, 3]}
        onClick={mailClick}
        onPointerOver={() => setCursor('pointer')}
        onPointerOut={() => setCursor('')}
      >
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.2]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.6, 0.5, 0.8]} />
          <meshStandardMaterial color={red} />
        </mesh>
        <mesh position={[0, 1.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={red} />
        </mesh>
        <mesh position={[0.32, 1.65, -0.15]}>
          <boxGeometry args={[0.04, 0.5, 0.12]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <Billboard position={[0, 2.5, 0]}>
          <Text fontSize={0.26} color="#ffffff" outlineWidth={0.03} outlineColor={red} anchorX="center">
            Click to email me
          </Text>
        </Billboard>
      </group>
      <Envelope />
    </group>
  )
}

/* ------------------------------------------------------------------ */

const BUILDINGS: Record<Zone['kind'], React.FC> = {
  welcome: WelcomeBoard,
  billboard: AboutBillboard,
  lab: TechLab,
  tvshop: TVShop,
  tower: OfficeTower,
  hall: TrophyHall,
  postoffice: PostOffice,
}

const Stations: React.FC<{ activeZoneId: string | null }> = ({ activeZoneId }) => {
  const walkTo = (zone: Zone) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return // camera drag, not a click
    input.target = new THREE.Vector3(zone.tx, 0, zone.tz)
  }

  return (
    <>
      {STATIONS.map((zone) => {
        const Building = BUILDINGS[zone.kind]
        return (
          <group key={zone.id}>
            <group position={[zone.x, 0, zone.z]} rotation={[0, zone.rot, 0]} onClick={walkTo(zone)}>
              <Building />
              <FloatingLabel zone={zone} hidden={activeZoneId === zone.id} />
            </group>
            <TriggerMarker zone={zone} active={activeZoneId === zone.id} />
          </group>
        )
      })}
    </>
  )
}

export default Stations
