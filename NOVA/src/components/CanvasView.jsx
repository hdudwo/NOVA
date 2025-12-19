import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars as SkyStars } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* =========================
   STAR FIELD CONFIG
========================= */
const STAR_FIELD = {
  count: 26000,
  halfWidth: 70,
  halfHeight: 50,
  halfDepth: 65,
  minSize: 0.006,
  maxSize: 0.015,
  color: "#e8f5ff",
  emissive: "#a6cfff",
};

/* =========================
   EARTH
========================= */
function Earth() {
  const earthRef = useRef();
  const baseGeoRef = useRef();
  const landGeoRef = useRef();

  // ⭐ 개선된 대륙 패턴 함수 - 여러 주파수 조합으로 복잡한 패턴 생성
  const landMask = (x, y, z) => {
    // 큰 대륙 덩어리들 (낮은 주파수)
    const continents =
      Math.sin(x * 2.1 + y * 0.5) * Math.cos(z * 1.8) * 1.2 +
      Math.sin(y * 2.8 - x * 0.8) * Math.cos(z * 2.3) * 0.9 +
      Math.cos(x * 1.5 + z * 1.2) * Math.sin(y * 1.9) * 0.8;

    // 중간 크기 지형 특징 (해안선 굴곡)
    const mediumFeatures =
      Math.sin(x * 4.2) * Math.cos(z * 3.5) * 0.5 +
      Math.cos(y * 3.8 + z * 2.1) * 0.4;

    // 작은 디테일 (섬, 반도 등)
    const details =
      Math.sin(x * 6.5 + y * 4.2) * Math.cos(z * 5.8) * 0.25 +
      Math.cos((x + z) * 7.3) * Math.sin(y * 6.1) * 0.2;

    // 극지방 효과 (극지방은 얼음/육지가 많음)
    const polarEffect = Math.pow(Math.abs(y), 1.5) * 0.3;

    return continents + mediumFeatures + details + polarEffect;
  };

  /* =========================
     BASE EARTH (바다 + 색상 지도)
  ========================= */
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

      // 임계값 조정 - 육지/바다 비율 조절 (값이 높을수록 바다가 많아짐)
      const isLand = landMask(nx, ny, nz) > 0.4;
      const c = isLand ? landColor : seaColor;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
  }, []);

  /* =========================
     LAND THICKNESS LAYER
     👉 대륙만 튀어나옴
     👉 바다는 투명
  ========================= */
  useLayoutEffect(() => {
    const geo = landGeoRef.current;
    if (!geo) return;

    const pos = geo.attributes.position;
    const alphas = new Float32Array(pos.count);
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();

      const nx = v.x / r;
      const ny = v.y / r;
      const nz = v.z / r;

      const m = landMask(nx, ny, nz);

      if (m > 0.4) {
        // ⭐ 대륙 두께 핵심
        const height = 0.3 * (m - 0.4);
        v.setLength(r + height);
        alphas[i] = 1; // 대륙 → 보임
      } else {
        v.setLength(r - 0.2);
        alphas[i] = 0; // 바다 → 투명
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    pos.needsUpdate = true;
    geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    geo.computeVertexNormals();
  }, []);

  /* =========================
     ROTATION
  ========================= */
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={earthRef}>
      {/* 바다 + 색상 지도 */}
      <mesh>
        <sphereGeometry ref={baseGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.15} />
      </mesh>

      {/* 대륙 두께 레이어 */}
      <mesh>
        <sphereGeometry ref={landGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial
          color="#7fd46b"
          transparent
          opacity={1}
          depthWrite={false}
          alphaTest={0.5}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
    </group>
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
      const size = THREE.MathUtils.lerp(
        STAR_FIELD.minSize,
        STAR_FIELD.maxSize,
        Math.random()
      );
      temp.scale.setScalar(size);
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
        emissiveIntensity={0.7}
        roughness={0.15}
        metalness={0.05}
      />
    </instancedMesh>
  );
}

/* =========================
   CANVAS VIEW
========================= */
export default function CanvasView() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 24], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#05060a"]} />
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
  );
}
