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
      earthRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={earthRef}>
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
