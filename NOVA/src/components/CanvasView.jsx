import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars as SkyStars } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* =========================
   STAR FIELD CONFIG
========================= */
const STAR_FIELD = {
  count: 26000,
  halfWidth: 70,
  halfHeight: 50,
  halfDepth: 65,
  minSize: 0.012,
  maxSize: 0.025,
  color: "#ffffff",
  emissive: "#ffffff",
};

/* =========================
   EARTH
========================= */
function Earth() {
  const earthRef = useRef();
  const baseGeoRef = useRef();
  const landGeoRef = useRef();

  // 대륙 패턴 함수 (여러 주파수 조합)
  const landMask = (x, y, z) => {
    const continents =
      Math.sin(x * 2.1 + y * 0.5) * Math.cos(z * 1.8) * 1.2 +
      Math.sin(y * 2.8 - x * 0.8) * Math.cos(z * 2.3) * 0.9 +
      Math.cos(x * 1.5 + z * 1.2) * Math.sin(y * 1.9) * 0.8;

    const medium =
      Math.sin(x * 4.2) * Math.cos(z * 3.5) * 0.5 +
      Math.cos(y * 3.8 + z * 2.1) * 0.4;

    const detail =
      Math.sin(x * 6.5 + y * 4.2) * Math.cos(z * 5.8) * 0.25 +
      Math.cos((x + z) * 7.3) * Math.sin(y * 6.1) * 0.2;

    const polar = Math.pow(Math.abs(y), 1.5) * 0.3;

    return continents + medium + detail + polar;
  };

  /* 바다 + 색상 지도 */
  useLayoutEffect(() => {
    const geo = baseGeoRef.current;
    if (!geo) return;

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const seaColor = new THREE.Color("#46b4ff");
    const landColor = new THREE.Color("#8ad26a");
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();

      const nx = v.x / r;
      const ny = v.y / r;
      const nz = v.z / r;

      const isLand = landMask(nx, ny, nz) > 0.4;
      const c = isLand ? landColor : seaColor;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
  }, []);

  /* 대륙 두께 레이어 */
  useLayoutEffect(() => {
    const geo = landGeoRef.current;
    if (!geo) return;

    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();

      const nx = v.x / r;
      const ny = v.y / r;
      const nz = v.z / r;

      const m = landMask(nx, ny, nz);

      if (m > 0.4) {
        const height = 0.3 * (m - 0.4);
        v.setLength(r + height);
      } else {
        v.setLength(r - 0.25); // 바다는 안 보이게
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, []);

  /* 자전 */
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={earthRef} position={[0, 0, -8]}>
      {/* 바다 */}
      <mesh>
        <sphereGeometry ref={baseGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.15} />
      </mesh>

      {/* 대륙 두께 */}
      <mesh>
        <sphereGeometry ref={landGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial
          color="#7fd46b"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

/* =========================
   PLANETS
========================= */
function Planet({ 
  position, 
  size, 
  color, 
  rotationSpeed, 
  emissive = null,
  roughness = 0.8,
  metalness = 0.1 
}) {
  const planetRef = useRef();

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <mesh ref={planetRef} position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.3 : 0}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

/* =========================
   STAR FIELD
========================= */
function StarField() {
  const meshRef = useRef();

  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < STAR_FIELD.count; i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() * 2 - 1) * STAR_FIELD.halfWidth,
          (Math.random() * 2 - 1) * STAR_FIELD.halfHeight,
          (Math.random() * 2 - 1) * STAR_FIELD.halfDepth
        )
      );
    }
    return pts;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const temp = new THREE.Object3D();

    positions.forEach((pos, i) => {
      temp.position.copy(pos);
      temp.scale.setScalar(
        THREE.MathUtils.lerp(
          STAR_FIELD.minSize,
          STAR_FIELD.maxSize,
          Math.random()
        )
      );
      temp.updateMatrix();
      meshRef.current.setMatrixAt(i, temp.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, positions.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={STAR_FIELD.color}
        emissive={STAR_FIELD.emissive}
        emissiveIntensity={1.5}
        roughness={0.1}
        metalness={0.05}
      />
    </instancedMesh>
  );
}

/* =========================
   CANVAS VIEW
========================= */
export default function CanvasView() {
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const groupRef = useRef();

  // 검색바 영역인지 확인하는 함수
  const isSearchArea = (clientX, clientY) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const searchWidth = 680; // max-width of search form
    const searchHeight = 250; // 검색바 영역 높이 (여유있게)
    
    const left = centerX - searchWidth / 2;
    const right = centerX + searchWidth / 2;
    const top = centerY - searchHeight / 2;
    const bottom = centerY + searchHeight / 2;
    
    return (
      clientX >= left &&
      clientX <= right &&
      clientY >= top &&
      clientY <= bottom
    );
  };

  const handleMouseDown = (e) => {
    // 검색바 영역이면 드래그 시작하지 않음
    if (isSearchArea(e.clientX, e.clientY)) {
      return;
    }
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    
    // 드래그 거리에 비례하여 회전
    rotationRef.current.y += deltaX * 0.005;
    rotationRef.current.x -= deltaY * 0.005;
    
    // 회전 범위 제한
    rotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.x));
    
    // 배경 그룹 회전 적용
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current.y;
      groupRef.current.rotation.x = rotationRef.current.x;
    }
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 전역 마우스 이벤트 리스너
  useLayoutEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      style={{ width: "100vw", height: "100vh", cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      <Canvas
        camera={{ position: [0, 0, 24], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#05060a"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 6]} intensity={1.2} />

        <group ref={groupRef}>
          <SkyStars radius={120} depth={80} count={2600} factor={4.5} fade />

          <Earth />
          <StarField />

          {/* 행성들 */}
          <Planet
            position={[-12, 5, -5]}
            size={1.5}
            color="#ff6b6b"
            rotationSpeed={0.2}
            roughness={0.7}
            metalness={0.2}
          />
          <Planet
            position={[10, -6, -3]}
            size={1.2}
            color="#4ecdc4"
            rotationSpeed={0.18}
            emissive="#4ecdc4"
            roughness={0.6}
            metalness={0.3}
          />
          <Planet
            position={[-8, -8, -6]}
            size={2}
            color="#ffe66d"
            rotationSpeed={0.12}
            roughness={0.9}
            metalness={0.05}
          />
          <Planet
            position={[14, 3, -4]}
            size={0.8}
            color="#a8e6cf"
            rotationSpeed={0.25}
            roughness={0.8}
            metalness={0.1}
          />
          <Planet
            position={[6, 10, -7]}
            size={1.8}
            color="#ff9ff3"
            rotationSpeed={0.1}
            emissive="#ff9ff3"
            roughness={0.5}
            metalness={0.4}
          />
          <Planet
            position={[-15, -4, -5]}
            size={1.3}
            color="#95e1d3"
            rotationSpeed={0.22}
            roughness={0.75}
            metalness={0.15}
          />
        </group>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={48}
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>
    </div>
  );
}
