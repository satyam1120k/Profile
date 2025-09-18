import React, { useEffect, useRef } from 'react'

const AudioManager: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Create ambient audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Generate ambient sound
    const generateAmbientSound = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 10)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 10)
    }

    // Play ambient sound every 10 seconds
    const ambientInterval = setInterval(generateAmbientSound, 10000)
    
    return () => {
      clearInterval(ambientInterval)
      audioContext.close()
    }
  }, [])

  // Sound effects for page turning
  const playPageTurnSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
      })
    }
  }

  // Expose sound function globally
  useEffect(() => {
    (window as any).playPageTurnSound = playPageTurnSound
  }, [])

  return (
  <audio ref={audioRef} preload="auto" style={{ display: 'none' }}>
    <source
      src="music/profile.mp3"
      type="audio/mpeg"
    />
  </audio>
)

}

export default AudioManager





