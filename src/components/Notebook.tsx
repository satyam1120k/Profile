import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface NotebookProps {
  isOpen: boolean
  currentPage: number
  onPageChange: (page: number) => void
  onNotebookClick: () => void
}

const Notebook: React.FC<NotebookProps> = ({ isOpen, currentPage, onPageChange, onNotebookClick }) => {
  const notebookRef = useRef<THREE.Group>(null)
  const pagesRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Animated properties for notebook opening
  const { notebookRotation, notebookScale, coverRotation } = useSpring({
    notebookRotation: isOpen ? [0, 0, 0] : [0, Math.PI / 2, 0],
    notebookScale: isOpen ? 1 : (isHovered ? 0.85 : 0.8),
    coverRotation: isOpen ? [0, -Math.PI / 2, 0] : [0, 0, 0],
    config: { mass: 1, tension: 280, friction: 120 }
  })

  // Page turning animation
  const { pageRotation } = useSpring({
    pageRotation: currentPage * (Math.PI / 4),
    config: { mass: 1, tension: 280, friction: 120 }
  })

  // Generate pages
  const pages = useMemo(() => {
    const pageArray = []
    for (let i = 0; i < 7; i++) {
      pageArray.push({
        index: i,
        title: [
          'Table of Contents',
          'Home',
          'About Me',
          'Resume',
          'Projects',
          'Skills',
          'Contact'
        ][i]
      })
    }
    return pageArray
  }, [])

  // Handle page clicks
  const handlePageClick = (pageIndex: number) => {
    if (isOpen) {
      onPageChange(pageIndex)
    }
  }

  // Handle notebook cover click
  const handleCoverClick = () => {
    if (!isOpen) {
      onNotebookClick()
    }
  }

  return (
    <animated.group 
      ref={notebookRef}
      rotation={notebookRotation as any}
      scale={notebookScale as any}
      position={[0, 1, 0]}
    >
      {/* Notebook back cover */}
      <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>

      {/* Notebook spine */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 4, 0.3]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>

      {/* Notebook front cover */}
      <animated.mesh 
        position={[0, 0, 0.1]} 
        rotation={coverRotation as any}
        onClick={handleCoverClick}
        onPointerOver={() => !isOpen && setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#8B5CF6" />
        
        {/* Cover title */}
        <group position={[0, 0, 0.11]}>
          <mesh>
            <planeGeometry args={[2.5, 0.8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {/* Portfolio text on the cover */}
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.5}
            color="#1a1a1a"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
            textAlign="center"
            font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff"
            fontWeight="bold"
          >
            Portfolio
          </Text>
        </group>
        
        {/* Click indicator */}
        <group position={[0, -1.5, 0.11]}>
          <mesh>
            <planeGeometry args={[1.5, 0.3]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      </animated.mesh>

      {/* Pages - only visible when notebook is open */}
      {isOpen && (
        <group ref={pagesRef}>
          {pages.map((page, index) => (
            <animated.mesh
              key={index}
              position={[0, 0, index * 0.01 + 0.2]}
              rotation-y={pageRotation as any}
              onClick={() => handlePageClick(index)}
              castShadow
              receiveShadow
            >
                      <boxGeometry args={[2.8, 3.8, 0.02]} />
        <meshStandardMaterial 
          color={currentPage === index ? "#8B5CF6" : "#ffffff"}
          transparent
          opacity={0.9}
        />
              
              {/* Page content text */}
              <group position={[0, 0, 0.02]}>
                <mesh>
                  <planeGeometry args={[2.5, 3.5]} />
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>
              </group>
            </animated.mesh>
          ))}
        </group>
      )}

      {/* Ambient lighting for notebook */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.6} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </animated.group>
  )
}

export default Notebook

