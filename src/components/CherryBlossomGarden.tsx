import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

interface PetalProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

const Petal: React.FC<PetalProps> = ({ position, rotation, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y -= 0.01
      meshRef.current.rotation.z += 0.01
      
      if (meshRef.current.position.y < -5) {
        meshRef.current.position.y = 10
        meshRef.current.position.x = (Math.random() - 0.5) * 20
      }
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshStandardMaterial 
        color="#ffb3d9" 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

const CherryBlossomGarden: React.FC = () => {
  const petalsRef = useRef<THREE.Group>(null)
  const grassRef = useRef<THREE.Mesh>(null)

  // Generate random petals
  const petals = useMemo(() => {
    const petalArray = []
    for (let i = 0; i < 50; i++) {
      petalArray.push({
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 15 + 5,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: Math.random() * 0.5 + 0.5
      })
    }
    return petalArray
  }, [])

  // Animate petals
  useFrame((state) => {
    if (petalsRef.current) {
      petalsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          child.position.y -= 0.005
          child.rotation.z += 0.005
          
          if (child.position.y < -2) {
            child.position.y = 10
            child.position.x = (Math.random() - 0.5) * 20
          }
        }
      })
    }
  })

  return (
    <group>
      {/* Ground with grass */}
      <mesh ref={grassRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#a8e6cf" />
      </mesh>

      {/* Cherry blossom trees */}
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[
          (Math.random() - 0.5) * 30,
          0,
          (Math.random() - 0.5) * 30
        ]}>
          {/* Tree trunk */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          {/* Tree foliage */}
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color="#ffb3d9" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Falling petals */}
      <group ref={petalsRef}>
        {petals.map((petal, index) => (
          <Petal key={index} {...petal} />
        ))}
      </group>

      {/* Ambient lighting for garden */}
      <ambientLight intensity={0.6} color="#fff5f5" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#fff5f5"
        castShadow
      />
    </group>
  )
}

export default CherryBlossomGarden

