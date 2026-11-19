import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import World from './world/World'
import { requestTeleport } from './world/store'
import { Zone } from './world/zones'
import AudioManager from './components/AudioManager'
import LoadingScreen from './components/LoadingScreen'
import Hud from './components/hud/Hud'
import './App.css'

/** Screens in the world are drawn with Poppins, so wait for it before drawing them. */
function loadFonts() {
  if (!document.fonts?.load) return Promise.resolve()
  return Promise.all(['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 24px Poppins`))).catch(
    () => undefined,
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  const [flashKey, setFlashKey] = useState(0)

  useEffect(() => {
    let alive = true
    const minDelay = new Promise((r) => setTimeout(r, 1500))
    // Never hang on a slow font CDN.
    const fonts = Promise.race([loadFonts(), new Promise((r) => setTimeout(r, 4000))])
    Promise.all([minDelay, fonts]).then(() => alive && setIsLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const travelTo = useCallback((zone: Zone) => {
    requestTeleport({ x: zone.tx, z: zone.tz, heading: Math.atan2(zone.x - zone.tx, zone.z - zone.tz) })
    setFlashKey((k) => k + 1)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app">
      <AudioManager />

      <div className="canvas-container">
        <World activeZoneId={activeZone?.id ?? null} onZoneChange={setActiveZone} />
      </div>

      <Hud activeZone={activeZone} onTravel={travelTo} />

      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            className="teleport-flash"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
