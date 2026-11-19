import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, Briefcase, Compass, Cpu, Home, LucideIcon, Mail, MousePointerClick, Tv, User, X } from 'lucide-react'
import { cam, input, isTouchDevice, player } from '../../world/store'
import { getGroundCanvas } from '../../world/terrain'
import { STATIONS, WORLD_HALF, WORLD_RADIUS, Zone } from '../../world/zones'
import './Hud.css'

export const ZONE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  about: User,
  skills: Cpu,
  projects: Tv,
  experience: Briefcase,
  certifications: Award,
  contact: Mail,
}

/* ------------------------------------------------------------------ */
/* Minimap                                                             */
/* ------------------------------------------------------------------ */

const MAP_R = WORLD_RADIUS + 4

const Minimap: React.FC<{ activeZoneId: string | null; onTravel: (z: Zone) => void }> = ({ activeZoneId, onTravel }) => {
  const arrow = useRef<SVGGElement>(null)
  const view = useRef<SVGPathElement>(null)
  const ground = useMemo(() => getGroundCanvas().toDataURL('image/jpeg', 0.7), [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      // Map x = world x and map y (down) = world z, so north (-z) is up.
      if (arrow.current) {
        arrow.current.setAttribute(
          'transform',
          `translate(${player.pos.x} ${player.pos.z}) rotate(${(-player.heading * 180) / Math.PI})`,
        )
      }
      if (view.current) {
        view.current.setAttribute(
          'transform',
          `translate(${player.pos.x} ${player.pos.z}) rotate(${(-cam.yaw * 180) / Math.PI})`,
        )
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="minimap" aria-label="Map of the world">
      <svg viewBox={`${-MAP_R} ${-MAP_R} ${MAP_R * 2} ${MAP_R * 2}`}>
        <defs>
          <clipPath id="mm-clip">
            <circle r={MAP_R} />
          </clipPath>
        </defs>
        <g clipPath="url(#mm-clip)">
          <rect x={-MAP_R} y={-MAP_R} width={MAP_R * 2} height={MAP_R * 2} fill="#86c95f" />
          <image href={ground} x={-WORLD_HALF} y={-WORLD_HALF} width={WORLD_HALF * 2} height={WORLD_HALF * 2} />
          <circle r={MAP_R} fill="none" stroke="#3f7d2a" strokeWidth={10} opacity={0.35} />
        </g>
        <path ref={view} d="M0 0 L-14 -26 A30 30 0 0 1 14 -26 Z" fill="rgba(255,255,255,0.4)" />
        {STATIONS.map((s) => (
          <g key={s.id} className="minimap-poi" transform={`translate(${s.x} ${s.z})`} onClick={() => onTravel(s)}>
            <title>{`Travel to ${s.title}`}</title>
            <circle r={activeZoneId === s.id ? 7 : 5.5} fill={s.color} stroke="#fff" strokeWidth={1.8} />
          </g>
        ))}
        <g ref={arrow}>
          <circle r={4} fill="#1e1b2e" stroke="#fff" strokeWidth={1.4} />
          <path d="M0 7 L3.2 1.4 L-3.2 1.4 Z" fill="#fff" />
        </g>
      </svg>
      <span className="minimap-north">N</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Places (fast travel)                                                */
/* ------------------------------------------------------------------ */

const PlacesDock: React.FC<{ activeZoneId: string | null; onTravel: (z: Zone) => void }> = ({ activeZoneId, onTravel }) => {
  const [open, setOpen] = useState(false)

  if (isTouchDevice || window.innerWidth <= 768) {
    return (
      <>
        <button className="hud-btn places-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? <X size={18} /> : <Compass size={18} />}
          <span>{open ? 'Close' : 'Places'}</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              className="places-sheet"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {STATIONS.map((z) => {
                const Icon = ZONE_ICONS[z.id]
                return (
                  <button
                    key={z.id}
                    className={`places-item ${activeZoneId === z.id ? 'active' : ''}`}
                    style={{ '--zone': z.color } as React.CSSProperties}
                    onClick={() => {
                      setOpen(false)
                      onTravel(z)
                    }}
                  >
                    <span className="places-icon">
                      <Icon size={16} />
                    </span>
                    <span className="places-text">
                      <strong>{z.title}</strong>
                      <small>{z.landmark}</small>
                    </span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <nav className="dock" aria-label="Fast travel">
      {STATIONS.map((z) => {
        const Icon = ZONE_ICONS[z.id]
        return (
          <button
            key={z.id}
            className={`dock-item ${activeZoneId === z.id ? 'active' : ''}`}
            style={{ '--zone': z.color } as React.CSSProperties}
            onClick={() => onTravel(z)}
            title={`Travel to the ${z.landmark}`}
          >
            <Icon size={18} />
            <span>{z.title}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Virtual joystick (touch only)                                       */
/* ------------------------------------------------------------------ */

const Joystick: React.FC = () => {
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef<number | null>(null)
  const RADIUS = 48

  const update = (e: React.PointerEvent) => {
    const rect = base.current!.getBoundingClientRect()
    let dx = e.clientX - (rect.left + rect.width / 2)
    let dy = e.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS
      dy = (dy / len) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    input.joy.x = dx / RADIUS
    input.joy.y = -dy / RADIUS
  }
  const end = () => {
    active.current = null
    setKnob({ x: 0, y: 0 })
    input.joy.x = 0
    input.joy.y = 0
  }

  return (
    <div
      ref={base}
      className="joystick"
      onPointerDown={(e) => {
        active.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e)
      }}
      onPointerMove={(e) => active.current === e.pointerId && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */

interface HudProps {
  activeZone: Zone | null
  onTravel: (z: Zone) => void
}

const Hud: React.FC<HudProps> = ({ activeZone, onTravel }) => {
  const Icon = activeZone ? ZONE_ICONS[activeZone.id] : null
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 16000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="hud">
      <div className="title-badge">
        <strong>Satyam Patel</strong>
        <span>Data Science &amp; AI Engineer</span>
      </div>
      <Minimap activeZoneId={activeZone?.id ?? null} onTravel={onTravel} />
      <PlacesDock activeZoneId={activeZone?.id ?? null} onTravel={onTravel} />

      <AnimatePresence>
        {activeZone && Icon && (
          <motion.div
            key={activeZone.id}
            className="zone-banner"
            style={{ '--zone': activeZone.color } as React.CSSProperties}
            initial={{ opacity: 0, y: -14, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -14, x: '-50%' }}
          >
            <span className="zone-banner-icon">
              <Icon size={18} />
            </span>
            <span className="zone-banner-text">
              <strong>
                {activeZone.landmark} · {activeZone.title}
              </strong>
              <small>
                <MousePointerClick size={12} /> {activeZone.hint}
              </small>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {isTouchDevice ? (
        <Joystick />
      ) : (
        <AnimatePresence>
          {hintVisible && !activeZone && (
            <motion.div
              className="controls-hint"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => setHintVisible(false)}
            >
              <div>
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd> walk · <kbd>Shift</kbd> run
              </div>
              <div>Click the ground or a building to walk there</div>
              <div>Drag to look around · Scroll to zoom</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default Hud
