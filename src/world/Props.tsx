import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from './store'
import { SMOOTH_PATHS, isGrass } from './terrain'
import { PATH_WIDTH, POND, STATIONS, addBoxCollider, addCircleCollider } from './zones'

/* ------------------------------------------------------------------ */
/* Water (pond + fountain)                                             */
/* ------------------------------------------------------------------ */

function useWaterMaterial(center: [number, number], radius: number, deep: string, shallow: string) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uCenter: { value: new THREE.Vector2(...center) },
            uRadius: { value: radius },
            uDeep: { value: new THREE.Color(deep) },
            uShallow: { value: new THREE.Color(shallow) },
          },
        ]),
        vertexShader: /* glsl */ `
          #include <common>
          #include <fog_pars_vertex>
          varying vec2 vXZ;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vXZ = wp.xz;
            vec4 mvPosition = viewMatrix * wp;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec2 uCenter; uniform float uRadius;
          uniform vec3 uDeep; uniform vec3 uShallow;
          #include <common>
          #include <fog_pars_fragment>
          varying vec2 vXZ;
          void main() {
            float d = length(vXZ - uCenter) / uRadius;
            vec3 c = mix(uDeep, uShallow, smoothstep(0.25, 1.0, d));
            float ripple = sin(d * 26.0 - uTime * 1.8) * 0.5 + 0.5;
            float cross = sin((vXZ.x + vXZ.y) * 1.2 + uTime * 1.3) * 0.5 + 0.5;
            c += vec3(0.07) * ripple * cross;
            float glint = pow(max(0.0, sin(vXZ.x * 3.1 + uTime * 1.7) * sin(vXZ.y * 2.7 - uTime * 1.3)), 14.0);
            c += vec3(0.7) * glint;
            c = mix(c, vec3(1.0), smoothstep(0.93, 1.0, d) * 0.5);
            gl_FragColor = vec4(c, 0.9);
            #include <colorspace_fragment>
            #include <fog_fragment>
          }`,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })
  return material
}

const Fountain: React.FC = () => {
  const water = useWaterMaterial([0, 0], 3, '#3b8fd0', '#8fd3ff')
  const bowlWater = useWaterMaterial([0, 0], 1.3, '#4aa3e0', '#a5dcff')
  const stone = '#e7e1d8'
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 3.6, 0.7, 40]} />
        <meshStandardMaterial color="#d6cfc4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.22, 10, 48]} />
        <meshStandardMaterial color={stone} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} material={water}>
        <circleGeometry args={[3.05, 48]} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.55, 1.6, 16]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[1.5, 0.6, 0.45, 32]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      <mesh position={[0, 2.49, 0]} rotation={[-Math.PI / 2, 0, 0]} material={bowlWater}>
        <circleGeometry args={[1.35, 32]} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.9, 12]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      {/* Water curtain falling from the upper bowl */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[1.5, 1.75, 1.7, 32, 1, true]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Sparkles count={50} scale={[1.2, 1.6, 1.2]} position={[0, 3.6, 0]} size={5} speed={1.2} color="#e0f4ff" />
      <Sparkles count={60} scale={[6, 0.8, 6]} position={[0, 0.9, 0]} size={3} speed={0.6} color="#ffffff" />
    </group>
  )
}

const Pond: React.FC = () => {
  const water = useWaterMaterial([POND.x, POND.z], POND.r, '#2f7fbf', '#7cc8f0')
  const reeds = useRef<THREE.InstancedMesh>(null)
  const tops = useRef<THREE.InstancedMesh>(null)

  const { pads, reedData } = useMemo(() => {
    const rand = mulberry32(31)
    const pads = Array.from({ length: 11 }, () => {
      const a = rand() * Math.PI * 2
      const r = 2 + rand() * (POND.r - 3.5)
      return { x: POND.x + Math.cos(a) * r, z: POND.z + Math.sin(a) * r, s: 0.45 + rand() * 0.4, rot: rand() * 6, flower: rand() < 0.45 }
    })
    const reedData: { x: number; z: number; h: number; tilt: number }[] = []
    for (let c = 0; c < 9; c++) {
      const a = rand() * Math.PI * 2
      const r = POND.r - 0.4 + rand() * 0.8
      for (let k = 0; k < 7; k++) {
        reedData.push({
          x: POND.x + Math.cos(a) * r + (rand() - 0.5) * 1.2,
          z: POND.z + Math.sin(a) * r + (rand() - 0.5) * 1.2,
          h: 1 + rand() * 0.9,
          tilt: (rand() - 0.5) * 0.25,
        })
      }
    }
    return { pads, reedData }
  }, [])

  useLayoutEffect(() => {
    if (!reeds.current || !tops.current) return
    const d = new THREE.Object3D()
    reedData.forEach((r, i) => {
      d.position.set(r.x, r.h / 2, r.z)
      d.rotation.set(r.tilt, 0, r.tilt * 0.6)
      d.scale.set(1, r.h, 1)
      d.updateMatrix()
      reeds.current!.setMatrixAt(i, d.matrix)
      d.position.set(r.x + Math.sin(r.tilt * 0.6) * -r.h * 0.5, r.h * 0.97, r.z + Math.sin(r.tilt) * r.h * 0.5)
      d.scale.set(1, 1, 1)
      d.updateMatrix()
      tops.current!.setMatrixAt(i, d.matrix)
    })
    reeds.current.instanceMatrix.needsUpdate = true
    tops.current.instanceMatrix.needsUpdate = true
    reeds.current.computeBoundingSphere()
    tops.current.computeBoundingSphere()
  }, [reedData])

  return (
    <group>
      <mesh position={[POND.x, 0.05, POND.z]} rotation={[-Math.PI / 2, 0, 0]} material={water}>
        <circleGeometry args={[POND.r, 64]} />
      </mesh>
      {pads.map((p, i) => (
        <group key={i} position={[p.x, 0.08, p.z]} rotation={[0, p.rot, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={p.s}>
            <circleGeometry args={[1, 18, 0.3, Math.PI * 1.8]} />
            <meshStandardMaterial color="#4c9a3d" side={THREE.DoubleSide} />
          </mesh>
          {p.flower && (
            <group position={[0.1, 0.08, 0.1]}>
              {Array.from({ length: 6 }, (_, k) => (
                <mesh key={k} rotation={[0.6, (k / 6) * Math.PI * 2, 0]} position={[0, 0.05, 0]}>
                  <coneGeometry args={[0.08, 0.28, 4]} />
                  <meshStandardMaterial color="#ffb3d1" emissive="#ff8fb8" emissiveIntensity={0.2} />
                </mesh>
              ))}
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#facc15" />
              </mesh>
            </group>
          )}
        </group>
      ))}
      <instancedMesh ref={reeds} args={[undefined, undefined, reedData.length]}>
        <cylinderGeometry args={[0.025, 0.04, 1, 5]} />
        <meshLambertMaterial color="#5b8f3a" />
      </instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, reedData.length]}>
        <capsuleGeometry args={[0.06, 0.22, 3, 6]} />
        <meshLambertMaterial color="#7a4a2a" />
      </instancedMesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Entrance gate                                                       */
/* ------------------------------------------------------------------ */

const TORII: [number, number] = [0.6, 22]
addCircleCollider(TORII[0] - 3.6, TORII[1], 0.45)
addCircleCollider(TORII[0] + 3.6, TORII[1], 0.45)

const Torii: React.FC = () => {
  const lanterns = useRef<THREE.Group>(null)
  useFrame((state) => {
    lanterns.current?.children.forEach((c, i) => {
      c.rotation.z = Math.sin(state.clock.elapsedTime * 1.3 + i) * 0.08
    })
  })
  const red = '#e63946'
  return (
    <group position={[TORII[0], 0, TORII[1]]}>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.6, 0.6, 12]} />
            <meshStandardMaterial color="#1f1f1f" />
          </mesh>
          <mesh position={[0, 3.6, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.38, 6.6, 16]} />
            <meshStandardMaterial color={red} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[8.6, 0.38, 0.4]} />
        <meshStandardMaterial color={red} roughness={0.5} />
      </mesh>
      <mesh position={[0, 6.75, 0]} castShadow>
        <boxGeometry args={[10, 0.45, 0.7]} />
        <meshStandardMaterial color={red} roughness={0.5} />
      </mesh>
      <mesh position={[0, 7.1, 0]} castShadow>
        <boxGeometry args={[10.8, 0.3, 0.9]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.45, 7.25, 0]} rotation={[0, 0, side * -0.35]} castShadow>
          <boxGeometry args={[0.6, 0.3, 0.9]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
      ))}
      <mesh position={[0, 6.1, 0.05]} castShadow>
        <boxGeometry args={[3.6, 1, 0.25]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      {[0.19, -0.19].map((z) => (
        <Text key={z} position={[0, 6.1, z]} rotation={[0, z > 0 ? 0 : Math.PI, 0]} fontSize={0.36} color="#ffd166" anchorX="center" anchorY="middle">
          {"SATYAM'S WORLD"}
        </Text>
      ))}
      <group ref={lanterns}>
        {[-1.9, 1.9].map((x) => (
          <group key={x} position={[x, 5.3, 0]}>
            <mesh position={[0, -0.35, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshStandardMaterial color="#1f1f1f" />
            </mesh>
            <mesh position={[0, -0.95, 0]} scale={[1, 1.25, 1]}>
              <sphereGeometry args={[0.42, 16, 12]} />
              <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Signpost in the plaza                                               */
/* ------------------------------------------------------------------ */

const SIGN: [number, number] = [-3.4, 6.6]
addCircleCollider(SIGN[0], SIGN[1], 0.3)

const Signpost: React.FC = () => (
  <group position={[SIGN[0], 0, SIGN[1]]}>
    <mesh position={[0, 2.2, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.15, 4.4, 8]} />
      <meshStandardMaterial color="#7c5235" />
    </mesh>
    <mesh position={[0, 4.5, 0]}>
      <coneGeometry args={[0.25, 0.4, 8]} />
      <meshStandardMaterial color="#5b3a24" />
    </mesh>
    {STATIONS.map((s, i) => {
      const dx = s.tx - SIGN[0]
      const dz = s.tz - SIGN[1]
      const rot = Math.atan2(-dz, dx)
      return (
        <group key={s.id} position={[0, 4 - i * 0.48, 0]} rotation={[0, rot, 0]}>
          <mesh position={[1.25, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 0.38, 0.08]} />
            <meshStandardMaterial color="#f5e6cc" />
          </mesh>
          <mesh position={[2.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0, 0.27, 0.32, 3]} />
            <meshStandardMaterial color={s.color} />
          </mesh>
          <mesh position={[0.25, 0, 0]}>
            <boxGeometry args={[0.12, 0.38, 0.1]} />
            <meshStandardMaterial color={s.color} />
          </mesh>
          {[0.05, -0.05].map((z) => (
            <Text
              key={z}
              position={[1.3, 0, z]}
              rotation={[0, z > 0 ? 0 : Math.PI, 0]}
              fontSize={0.2}
              color="#3f2a1a"
              anchorX="center"
              anchorY="middle"
            >
              {s.title}
            </Text>
          ))}
        </group>
      )
    })}
  </group>
)

/* ------------------------------------------------------------------ */
/* Benches and lamps                                                   */
/* ------------------------------------------------------------------ */

const BENCHES: { x: number; z: number; rot: number }[] = (() => {
  const out: { x: number; z: number; rot: number }[] = []
  const tryBench = (x: number, z: number, faceX: number, faceZ: number) => {
    if (!isGrass(x, z) || !isGrass(x + 1.2, z) || !isGrass(x - 1.2, z) || !isGrass(x, z + 1.2) || !isGrass(x, z - 1.2)) return
    const rot = Math.atan2(faceX - x, faceZ - z)
    out.push({ x, z, rot })
    addBoxCollider(x, z, 1.1, 0.4, rot)
  }
  for (let i = 0; i < 16 && out.length < 5; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2
    tryBench(Math.sin(a) * 12.2, Math.cos(a) * 12.2, 0, 0)
  }
  for (const a of [0.6, 2.3, 4.1]) {
    tryBench(POND.x + Math.sin(a) * (POND.r + 3), POND.z + Math.cos(a) * (POND.r + 3), POND.x, POND.z)
  }
  return out
})()

const Bench: React.FC<{ x: number; z: number; rot: number }> = ({ x, z, rot }) => (
  <group position={[x, 0, z]} rotation={[0, rot, 0]}>
    {[0, 1, 2].map((k) => (
      <mesh key={k} position={[0, 0.5, -0.15 + k * 0.17]} castShadow>
        <boxGeometry args={[2.2, 0.07, 0.14]} />
        <meshStandardMaterial color="#b07a4f" />
      </mesh>
    ))}
    {[0, 1].map((k) => (
      <mesh key={k} position={[0, 0.78 + k * 0.2, -0.3]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.12, 0.06]} />
        <meshStandardMaterial color="#b07a4f" />
      </mesh>
    ))}
    {[-0.95, 0.95].map((lx) => (
      <mesh key={lx} position={[lx, 0.42, -0.05]} castShadow>
        <boxGeometry args={[0.1, 0.84, 0.55]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    ))}
  </group>
)

const LAMPS: [number, number][] = (() => {
  const out: [number, number][] = []
  SMOOTH_PATHS.forEach((path, pi) => {
    let side = pi % 2 ? 1 : -1
    for (let i = 6; i < path.length - 3; i += 12) {
      const p = path[i]
      const q = path[i + 1]
      const dx = q.x - p.x
      const dz = q.y - p.y
      const len = Math.hypot(dx, dz) || 1
      const off = PATH_WIDTH / 2 + 0.6
      const x = p.x + (-dz / len) * off * side
      const z = p.y + (dx / len) * off * side
      side = -side
      if (Math.hypot(x, z) < 12 || !isGrass(x, z)) continue
      if (STATIONS.some((s) => Math.hypot(x - s.x, z - s.z) < 10)) continue
      if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 5)) continue
      out.push([x, z])
      addCircleCollider(x, z, 0.25)
    }
  })
  return out
})()

const Lamps: React.FC = () => {
  const poles = useRef<THREE.InstancedMesh>(null)
  const heads = useRef<THREE.InstancedMesh>(null)
  const caps = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    LAMPS.forEach(([x, z], i) => {
      d.position.set(x, 1.6, z)
      d.updateMatrix()
      poles.current!.setMatrixAt(i, d.matrix)
      d.position.set(x, 3.35, z)
      d.updateMatrix()
      heads.current!.setMatrixAt(i, d.matrix)
      d.position.set(x, 3.8, z)
      d.updateMatrix()
      caps.current!.setMatrixAt(i, d.matrix)
    })
    for (const m of [poles.current!, heads.current!, caps.current!]) {
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    }
  }, [])
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, LAMPS.length]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 3.2, 8]} />
        <meshStandardMaterial color="#2f3640" metalness={0.5} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, LAMPS.length]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffc46b" emissiveIntensity={1.8} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, LAMPS.length]}>
        <coneGeometry args={[0.36, 0.3, 8]} />
        <meshStandardMaterial color="#2f3640" />
      </instancedMesh>
    </>
  )
}

/* ------------------------------------------------------------------ */

const Props: React.FC = () => (
  <>
    <Fountain />
    <Pond />
    <Torii />
    <Signpost />
    {BENCHES.map((b, i) => (
      <Bench key={i} {...b} />
    ))}
    <Lamps />
  </>
)

export default Props
