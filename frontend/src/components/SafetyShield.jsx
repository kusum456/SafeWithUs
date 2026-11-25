import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ShieldMesh() {
  const group = useRef()
  const ring = useRef()

  const shape = new THREE.Shape()
  shape.moveTo(0, 1.1)
  shape.bezierCurveTo(0.75, 0.85, 0.95, 0.75, 0.95, 0.15)
  shape.bezierCurveTo(0.95, -0.55, 0.55, -1.05, 0, -1.3)
  shape.bezierCurveTo(-0.55, -1.05, -0.95, -0.55, -0.95, 0.15)
  shape.bezierCurveTo(-0.95, 0.75, -0.75, 0.85, 0, 1.1)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35
    if (ring.current) ring.current.rotation.z += delta * 0.2
  })

  return (
    <group ref={group}>
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, curveSegments: 16 }]} />
        <meshBasicMaterial color="#26e0c9" transparent opacity={0.18} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 16 })]} />
        <lineBasicMaterial color="#26e0c9" transparent opacity={0.85} />
      </lineSegments>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.006, 8, 60]} />
        <meshBasicMaterial color="#7c6cff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function SafetyShield({ height = 380 }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 42 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <ShieldMesh />
      </Canvas>
    </div>
  )
}
