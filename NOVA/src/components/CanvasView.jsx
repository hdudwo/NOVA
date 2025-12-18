import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars as SkyStars } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const STAR_FIELD = {
  // 전체 화면보다 조금 더 넓은 직사각형 박스 안에 별들을 뿌립니다
  count: 26000,
  halfWidth: 70,
  halfHeight: 50,
  halfDepth: 65,
  minSize: 0.006,
  maxSize: 0.015,
  color: '#e8f5ff',
  emissive: '#a6cfff',
}

function Earth() {
  const earthRef = useRef()
  const geometryRef = useRef()

  // 땅 / 바다 구분용 간단한 패턴 함수
  const landMask = (x, y, z) => {
    const n =
      Math.sin(x * 1.6) * Math.cos(z * 1.9) +
      Math.sin(y * 2.3 + z * 0.7) * 0.7 +
      Math.cos((x + y) * 1.1) * 0.5
    return n
  }

  // 땅은 살짝 튀어나오고, 실루엣은 거의 완벽한 원에 가깝게 유지
  useLayoutEffect(() => {
    const geo = geometryRef.current
    if (!geo) return

    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const seaColor = new THREE.Color('#46b4ff')   // 밝은 파랑 (이미지 느낌)
    const landColor = new THREE.Color('#8ad26a')  // 파스텔 초록
    const v = new THREE.Vector3()

    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i)
      const baseRadius = v.length()
      const nx = v.x / baseRadius
      const ny = v.y / baseRadius
      const nz = v.z / baseRadius

      const m = landMask(nx, ny, nz)
      const isLand = m > 0.28
      // bump를 아주 작게 해서 실루엣이 거의 완벽한 원이 되도록
      const bump = isLand ? 0.08 * Math.max(0, m - 0.28) : 0

      v.setLength(baseRadius + bump)
      pos.setXYZ(i, v.x, v.y, v.z)

      const c = isLand ? landColor : seaColor
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    pos.needsUpdate = true
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
  }, [])

  // 지구 자전
  useFrame((_, delta) => {
    if (!earthRef.current) return
    earthRef.current.rotation.y += delta * 0.08
  })

  return (
    <mesh ref={earthRef}>
      <sphereGeometry ref={geometryRef} args={[4, 96, 96]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.6}
        metalness={0.15}
      />
    </mesh>
  )
}

function StarField() {
  const meshRef = useRef()

  // 직사각형 박스 내부에 균일하게 별 배치 (은하 모양 X, 고정)
  const positions = useMemo(() => {
    const pts = []
    const { count, halfWidth, halfHeight, halfDepth } = STAR_FIELD
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() * 2 - 1) * halfWidth
      const y = (Math.random() * 2 - 1) * halfHeight
      const z = (Math.random() * 2 - 1) * halfDepth
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [])

  // 각 인스턴스에 위치/크기 설정 (초기 한 번)
  useLayoutEffect(() => {
    if (!meshRef.current) return
    const temp = new THREE.Object3D()
    positions.forEach((pos, idx) => {
      temp.position.copy(pos)
      const size = THREE.MathUtils.lerp(
        STAR_FIELD.minSize,
        STAR_FIELD.maxSize,
        Math.random(),
      )
      temp.scale.setScalar(size)
      temp.updateMatrix()
      meshRef.current.setMatrixAt(idx, temp.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  // 별 구름 전체 천천히 회전
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime() * 0.02
    meshRef.current.rotation.y = t
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, positions.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={STAR_FIELD.color}
        emissive={STAR_FIELD.emissive}
        emissiveIntensity={0.7}
        roughness={0.15}
        metalness={0.05}
      />
    </instancedMesh>
  )
}

function CanvasView() {
  return (
    <div className="canvas-view">
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 24], fov: 55, near: 0.1, far: 200 }}
      >
        <color attach="background" args={['#05060a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 6]} intensity={1.3} />
        <SkyStars radius={120} depth={80} count={2600} factor={2.8} fade />
        <Earth />
        <StarField />
        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={10}
          maxDistance={48}
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>
    </div>
  )
}

export default CanvasView
