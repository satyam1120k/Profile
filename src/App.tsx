import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CherryBlossomGarden from './components/CherryBlossomGarden'
import Notebook from './components/Notebook'
import NotebookContent from './components/NotebookContent'
import AudioManager from './components/AudioManager'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [isNotebookOpen, setIsNotebookOpen] = useState(false)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])



  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
    setIsNotebookOpen(true)
  }

  const handleNotebookClick = () => {
    setIsNotebookOpen(true)
  }

  const handleNotebookClose = () => {
    setIsNotebookOpen(false)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app">
      <AudioManager />
      
      {/* 3D Scene */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 75 }}
          style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        >
          <EffectComposer>
            <Bloom 
              intensity={0.5}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>

          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <CherryBlossomGarden />
          
          <Notebook 
            isOpen={isNotebookOpen}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onNotebookClick={handleNotebookClick}
          />

          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1}
          />

          <Environment preset="sunset" />
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
      </div>

      {/* Notebook Cover Text Overlay */}
      {!isNotebookOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          pointerEvents: 'none',
          textAlign: 'center',
          color: '#2c3e50',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 'bold',
          fontSize: '2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          <div>Portfolio</div>
        </div>
      )}

      {/* Notebook Content Overlay */}
      <NotebookContent 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isNotebookOpen={isNotebookOpen}
        onClose={handleNotebookClose}
      />
    </div>
  )
}

export default App

