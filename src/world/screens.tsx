import React, { useEffect, useMemo, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './store'

/* ------------------------------------------------------------------ */
/* Canvas drawing helpers                                              */
/* ------------------------------------------------------------------ */

export const FONT = '"Poppins", "Segoe UI", system-ui, sans-serif'
export const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`

export interface LinkRegion {
  x: number
  y: number
  w: number
  h: number
  url: string
}

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Draws wrapped text and returns the y below the last line. */
export function drawParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  ctx.textBaseline = 'top'
  for (const line of wrapLines(ctx, text, maxWidth)) {
    ctx.fillText(line, x, y)
    y += lineHeight
  }
  return y
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Pill-shaped chips laid out left-to-right with wrapping; returns the bottom y. */
export function drawChips(
  ctx: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
  opts: { size: number; bg: string; fg: string; padX?: number; gap?: number; height?: number },
) {
  const padX = opts.padX ?? opts.size * 0.8
  const gap = opts.gap ?? opts.size * 0.45
  const h = opts.height ?? opts.size * 1.9
  ctx.font = font(500, opts.size)
  ctx.textBaseline = 'middle'
  let cx = x
  let cy = y
  for (const item of items) {
    const w = ctx.measureText(item).width + padX * 2
    if (cx + w > x + maxWidth && cx > x) {
      cx = x
      cy += h + gap
    }
    ctx.fillStyle = opts.bg
    roundRect(ctx, cx, cy, w, h, h / 2)
    ctx.fill()
    ctx.fillStyle = opts.fg
    ctx.fillText(item, cx + padX, cy + h / 2 + 1)
    cx += w + gap
  }
  return cy + h
}

/** Draws an image cropped to fill the box ("object-fit: cover"). */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const s = Math.max(w / img.width, h / img.height)
  const sw = w / s
  const sh = h / s
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

export function openLink(url: string) {
  if (url.startsWith('mailto:')) window.location.href = url
  else window.open(url, '_blank', 'noopener,noreferrer')
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const setCursor = (c: string) => (document.body.style.cursor = c)

/* ------------------------------------------------------------------ */
/* Static screen with clickable regions                                */
/* ------------------------------------------------------------------ */

interface CanvasScreenProps {
  width: number
  height: number
  /** Canvas width in pixels; height follows the aspect ratio. */
  px?: number
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => LinkRegion[] | void
  /** Opened when the screen is clicked anywhere that isn't a link region. */
  fallbackUrl?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  brightness?: number
  deps?: unknown[]
}

export const CanvasScreen: React.FC<CanvasScreenProps> = ({
  width,
  height,
  px = 1024,
  draw,
  fallbackUrl,
  position,
  rotation,
  brightness = 1,
  deps = [],
}) => {
  const W = px
  const H = Math.round((px * height) / width)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const hovered = useRef(false)

  const { texture, links } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    const links = draw(ctx, W, H) || []
    return { texture: toTexture(canvas), links }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H, ...deps])

  useEffect(() => () => texture.dispose(), [texture])

  const hit = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!e.uv) return null
    const x = e.uv.x * W
    const y = (1 - e.uv.y) * H
    return links.find((l) => x >= l.x && x <= l.x + l.w && y >= l.y && y <= l.y + l.h) ?? null
  }

  useFrame((_, dt) => {
    if (!material.current) return
    const target = brightness * (hovered.current && (links.length || fallbackUrl) ? 1.05 : 1)
    const c = material.current.color
    c.setScalar(c.r + (target - c.r) * Math.min(1, dt * 8))
  })

  return (
    <mesh
      position={position}
      rotation={rotation}
      onPointerMove={(e) => {
        hovered.current = true
        setCursor(hit(e) || fallbackUrl ? 'pointer' : '')
      }}
      onPointerOut={() => {
        hovered.current = false
        setCursor('')
      }}
      onClick={(e) => {
        if (e.delta > 6) return
        const link = hit(e)
        const url = link?.url ?? fallbackUrl
        if (url) {
          e.stopPropagation()
          openLink(url)
        }
      }}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Auto-scrolling screen                                               */
/* ------------------------------------------------------------------ */

interface ScrollScreenProps {
  width: number
  height: number
  px?: number
  background: string
  /** Draws the full content at (0, 0) and returns its height in pixels. */
  draw: (ctx: CanvasRenderingContext2D, W: number) => number
  /** Pixels per second. */
  speed?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const ScrollScreen: React.FC<ScrollScreenProps> = ({
  width,
  height,
  px = 900,
  background,
  draw,
  speed = 38,
  position,
  rotation,
}) => {
  const W = px
  const viewPx = (px * height) / width
  const scroll = useRef(0)
  const paused = useRef(false)
  const resume = useRef(0)

  const { texture, total, fade } = useMemo(() => {
    // Measure + draw on a scratch canvas, then copy into a tightly sized one.
    const scratch = document.createElement('canvas')
    scratch.width = W
    scratch.height = 6000
    const contentH = Math.ceil(draw(scratch.getContext('2d')!, W))
    const gap = Math.round(viewPx * 0.45)
    // If everything fits, there's nothing to scroll.
    const scrolls = contentH > viewPx
    const total = scrolls ? contentH + gap : Math.ceil(viewPx)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = total
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = background
    ctx.fillRect(0, 0, W, total)
    ctx.drawImage(scratch, 0, 0)
    if (scrolls) {
      // A small marker in the gap so the loop point reads as intentional.
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.arc(W / 2 + i * 26, contentH + gap / 2, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const texture = toTexture(canvas)
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, viewPx / total)
    texture.offset.set(0, 1 - viewPx / total)

    // Fade strip (background colour -> transparent) for the top/bottom edges.
    const f = document.createElement('canvas')
    f.width = 4
    f.height = 64
    const fctx = f.getContext('2d')!
    const g = fctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, background)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    fctx.fillStyle = g
    fctx.fillRect(0, 0, 4, 64)
    const fade = toTexture(f)
    return { texture, total: scrolls ? total : 0, fade }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, viewPx, background])

  useEffect(
    () => () => {
      texture.dispose()
      fade.dispose()
    },
    [texture, fade],
  )

  useFrame((_, dt) => {
    if (!total) return
    if (!paused.current && performance.now() > resume.current) scroll.current += speed * Math.min(dt, 0.1)
    scroll.current = ((scroll.current % total) + total) % total
    texture.offset.y = 1 - viewPx / total - scroll.current / total
  })

  const fadeH = Math.min(height * 0.12, 0.6)

  return (
    <group position={position} rotation={rotation}>
      <mesh
        onPointerOver={() => {
          paused.current = true
          input.wheelHandler = (dy) => {
            scroll.current += dy * 0.8
            resume.current = performance.now() + 2500
          }
        }}
        onPointerOut={() => {
          paused.current = false
          input.wheelHandler = null
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {total > 0 && (
        <>
          <mesh position={[0, height / 2 - fadeH / 2, 0.005]}>
            <planeGeometry args={[width, fadeH]} />
            <meshBasicMaterial map={fade} transparent toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, -height / 2 + fadeH / 2, 0.005]} rotation={[0, 0, Math.PI]}>
            <planeGeometry args={[width, fadeH]} />
            <meshBasicMaterial map={fade} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Image loading for canvases                                          */
/* ------------------------------------------------------------------ */

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string) {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      // A missing image shouldn't break the world; draw without it.
      img.onerror = () => resolve(img)
      img.src = src
    })
    imageCache.set(src, p)
  }
  return p
}

const resolved = new Map<string, HTMLImageElement>()

/** Suspends until every image has loaded (or failed), then returns them. */
export function useImages(srcs: string[]): HTMLImageElement[] {
  const missing = srcs.filter((s) => !resolved.has(s))
  if (missing.length) {
    throw Promise.all(missing.map((s) => loadImage(s).then((img) => resolved.set(s, img))))
  }
  return srcs.map((s) => resolved.get(s)!)
}

export const imageReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
