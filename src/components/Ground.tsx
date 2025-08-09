import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GrassBladeProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
}

const GrassBlade: React.FC<GrassBladeProps> = ({ position, rotation, scale, color }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Enhanced wind animation with multiple frequencies
      const time = state.clock.elapsedTime
      const windStrength = Math.sin(time * 0.8 + position[0] * 0.1) * 0.15
      const windVariation = Math.sin(time * 1.2 + position[2] * 0.1) * 0.08
      const gustEffect = Math.sin(time * 0.3 + position[0] * 0.05) * 0.05
      
      meshRef.current.rotation.z = windStrength + windVariation + gustEffect
      meshRef.current.rotation.x = Math.sin(time * 0.6 + position[2] * 0.1) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.02, 0.6]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  )
}

interface FlowerProps {
  position: [number, number, number]
  scale: number
  color: string
  type: 'rose' | 'daisy' | 'tulip' | 'sunflower'
}

const Rose: React.FC<FlowerProps> = ({ position, scale, color }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      const windEffect = Math.sin(time * 0.6 + position[0] * 0.1) * 0.08
      const gentleSway = Math.sin(time * 0.4 + position[2] * 0.1) * 0.03
      const gustEffect = Math.sin(time * 0.2 + position[0] * 0.05) * 0.02
      
      groupRef.current.rotation.z = windEffect + gentleSway + gustEffect
      groupRef.current.rotation.x = Math.sin(time * 0.5 + position[2] * 0.1) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Rose petals in layers */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[0, 0.1 + i * 0.02, 0]} rotation={[0, 0, (i * Math.PI) / 6]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Rose center */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Rose stem with thorns */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

const Daisy: React.FC<FlowerProps> = ({ position, scale, color }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      const windEffect = Math.sin(time * 0.7 + position[0] * 0.1) * 0.06
      const gentleSway = Math.sin(time * 0.5 + position[2] * 0.1) * 0.04
      const gustEffect = Math.sin(time * 0.25 + position[0] * 0.05) * 0.02
      
      groupRef.current.rotation.z = windEffect + gentleSway + gustEffect
      groupRef.current.rotation.x = Math.sin(time * 0.6 + position[2] * 0.1) * 0.03
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Daisy petals */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[0, 0, (i * Math.PI) / 4]}>
          <planeGeometry args={[0.2, 0.08]} />
          <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Daisy center */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Daisy stem */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

const Tulip: React.FC<FlowerProps> = ({ position, scale, color }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      const windEffect = Math.sin(time * 0.8 + position[0] * 0.1) * 0.07
      const gentleSway = Math.sin(time * 0.6 + position[2] * 0.1) * 0.04
      const gustEffect = Math.sin(time * 0.3 + position[0] * 0.05) * 0.03
      
      groupRef.current.rotation.z = windEffect + gentleSway + gustEffect
      groupRef.current.rotation.x = Math.sin(time * 0.7 + position[2] * 0.1) * 0.025
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tulip petals */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 0.15, 0]} rotation={[0, 0, (i * Math.PI) / 3]}>
          <planeGeometry args={[0.1, 0.25]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Tulip stem */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

const Sunflower: React.FC<FlowerProps> = ({ position, scale, color }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      const windEffect = Math.sin(time * 0.9 + position[0] * 0.1) * 0.09
      const gentleSway = Math.sin(time * 0.7 + position[2] * 0.1) * 0.05
      const gustEffect = Math.sin(time * 0.4 + position[0] * 0.05) * 0.03
      
      groupRef.current.rotation.z = windEffect + gentleSway + gustEffect
      groupRef.current.rotation.x = Math.sin(time * 0.8 + position[2] * 0.1) * 0.035
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Sunflower petals */}
      {[...Array(16)].map((_, i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[0, 0, (i * Math.PI) / 8]}>
          <planeGeometry args={[0.25, 0.1]} />
          <meshStandardMaterial color="#FFD700" side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Sunflower center */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Sunflower stem */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

const Flower: React.FC<FlowerProps> = ({ position, scale, color, type }) => {
  switch (type) {
    case 'rose':
      return <Rose position={position} scale={scale} color={color} type={type} />
    case 'daisy':
      return <Daisy position={position} scale={scale} color={color} type={type} />
    case 'tulip':
      return <Tulip position={position} scale={scale} color={color} type={type} />
    case 'sunflower':
      return <Sunflower position={position} scale={scale} color={color} type={type} />
    default:
      return <Rose position={position} scale={scale} color={color} type={type} />
  }
}

const Ground: React.FC = () => {
  const groundRef = useRef<THREE.Mesh>(null)

  // Generate grass blades
  const grassBlades = useMemo(() => {
    const blades = []
    for (let i = 0; i < 1200; i++) {
      blades.push({
        position: [
          (Math.random() - 0.5) * 50,
          0.05,
          (Math.random() - 0.5) * 50
        ] as [number, number, number],
        rotation: [
          Math.random() * 0.4 - 0.2,
          Math.random() * Math.PI * 2,
          Math.random() * 0.4 - 0.2
        ] as [number, number, number],
        scale: Math.random() * 1.5 + 1.2,
        color: ['#90EE90', '#98FB98', '#7CFC00', '#32CD32', '#228B22', '#006400', '#556B2F', '#8FBC8F'][Math.floor(Math.random() * 8)]
      })
    }
    return blades
  }, [])

  // Generate flowers
  const flowers = useMemo(() => {
    const flowerArray = []
    const flowerTypes = ['rose', 'daisy', 'tulip', 'sunflower']
    const flowerColors = {
      rose: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#DC143C', '#B22222'],
      daisy: ['#FFFFFF', '#F0F8FF', '#F5F5F5'],
      tulip: ['#FF4500', '#FF6347', '#FF7F50', '#FF8C00', '#FFA500', '#FFD700'],
      sunflower: ['#FFD700', '#FFA500', '#FF8C00']
    }
    
    for (let i = 0; i < 300; i++) {
      const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)] as 'rose' | 'daisy' | 'tulip' | 'sunflower'
      const colors = flowerColors[type]
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      flowerArray.push({
        position: [
          (Math.random() - 0.5) * 48,
          0,
          (Math.random() - 0.5) * 48
        ] as [number, number, number],
        scale: Math.random() * 2.0 + 1.5,
        color: color,
        type: type
      })
    }
    return flowerArray
  }, [])

  return (
    <group>
      {/* Main ground */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>

      {/* Grass blades */}
      <group>
        {grassBlades.map((blade, index) => (
          <GrassBlade key={index} {...blade} />
        ))}
      </group>

      {/* Flowers */}
      <group>
        {flowers.map((flower, index) => (
          <Flower key={index} {...flower} type={flower.type} />
        ))}
      </group>

      {/* Small decorative elements */}
      <group>
        {[...Array(40)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 50,
              0.02,
              (Math.random() - 0.5) * 50
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        ))}
      </group>

      {/* Additional decorative plants */}
      <group>
        {[...Array(50)].map((_, i) => (
          <group
            key={i}
            position={[
              (Math.random() - 0.5) * 45,
              0,
              (Math.random() - 0.5) * 45
            ]}
          >
            {/* Plant stem */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.3]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            
            {/* Plant leaves with wind animation */}
            {[...Array(4)].map((_, j) => {
              const LeafComponent = () => {
                const leafRef = useRef<THREE.Mesh>(null)
                
                useFrame((state) => {
                  if (leafRef.current) {
                    const time = state.clock.elapsedTime
                    const windEffect = Math.sin(time * 0.6 + i * 0.1) * 0.08
                    const gentleSway = Math.sin(time * 0.4 + j * 0.2) * 0.04
                    
                    leafRef.current.rotation.z = (j * Math.PI) / 2 + windEffect + gentleSway
                    leafRef.current.rotation.x = Math.sin(time * 0.5 + j * 0.1) * 0.03
                  }
                })
                
                return (
                  <mesh
                    ref={leafRef}
                    position={[0, 0.15 + j * 0.06, 0]}
                  >
                    <planeGeometry args={[0.12, 0.2]} />
                    <meshStandardMaterial color="#32CD32" side={THREE.DoubleSide} />
                  </mesh>
                )
              }
              
              return <LeafComponent key={j} />
            })}
          </group>
        ))}
      </group>
    </group>
  )
}

export default Ground
