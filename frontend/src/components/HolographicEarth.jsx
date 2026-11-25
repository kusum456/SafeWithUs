import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Markers({ radius }) {
  const points = useMemo(() => {
    const coords = [
      [19.076, 72.877], // Mumbai
      [51.507, -0.128], // London
      [40.713, -74.006], // NYC
      [-33.868, 151.209], // Sydney
      [35.676, 139.65], // Tokyo
      [28.613, 77.209], // Delhi
    ]
    return coords.map(([lat, lng]) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      )
    })
  }, [radius])

  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshBasicMaterial color="#26e0c9" />
        </mesh>
      ))}
    </group>
  )
}

function Globe({ mouse }) {
  const group = useRef()
  const wireRef = useRef()

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12
      group.current.rotation.x += (mouse.current.y * 0.15 - group.current.rotation.x) * 0.03
      group.current.rotation.y += mouse.current.x * 0.0004
    }
  })

  return (
    <group ref={group}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[1.55, 48, 48]} />
        <meshBasicMaterial color="#0d1424" transparent opacity={0.55} />
      </mesh>
      {/* Wireframe lat/long lines */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.56, 24, 18]} />
        <meshBasicMaterial color="#26e0c9" wireframe transparent opacity={0.28} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.72, 32, 32]} />
        <meshBasicMaterial color="#7c6cff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <Markers radius={1.57} />
    </group>
  )
}

function Rig({ mouse }) {
  const { size } = useThree()
  const handleMove = (e) => {
    mouse.current.x = (e.clientX / size.width) * 2 - 1
    mouse.current.y = (e.clientY / size.height) * 2 - 1
  }
  return (
    <mesh onPointerMove={handleMove} visible={false}>
      <sphereGeometry args={[10, 4, 4]} />
      <meshBasicMaterial />
    </mesh>
  )
}

export default function HolographicEarth({ height = 460, interactive = true }) {
  const mouse = useRef({ x: 0, y: 0 })

  return (
    <div
      style={{ width: '100%', height }}
      onMouseMove={(e) => {
        if (!interactive) return
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      }}
    >
      <Canvas camera={{ position: [0, 0, 4.4], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <Globe mouse={mouse} />
      </Canvas>
    </div>
  )
}
