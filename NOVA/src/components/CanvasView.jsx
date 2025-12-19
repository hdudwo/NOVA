import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars as SkyStars } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const STAR_FIELD = {
  count: 60000,
  halfWidth: 60,
  halfHeight: 45,
  halfDepth: 60,
  minSize: 0.02,
  maxSize: 0.03,
};

function Earth() {
  const earthRef = useRef();
  const baseGeoRef = useRef();
  const landGeoRef = useRef();

  const landMask = (x, y, z) =>
    Math.sin(x * 2.1 + y * 0.5) * Math.cos(z * 1.8) +
    Math.sin(y * 2.8 - x * 0.8) * Math.cos(z * 2.3) +
    Math.cos(x * 1.5 + z * 1.2) * Math.sin(y * 1.9);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.4;
    }
  });

  useLayoutEffect(() => {
    const geo = baseGeoRef.current;
    if (!geo) return;

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const sea = new THREE.Color("#46b4ff");
    const land = new THREE.Color("#8ad26a");
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const c = landMask(n.x, n.y, n.z) > 0.4 ? land : sea;
      colors.set([c.r, c.g, c.b], i * 3);
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
  }, []);

  useLayoutEffect(() => {
    const geo = landGeoRef.current;
    if (!geo) return;

    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const m = landMask(n.x, n.y, n.z);
      v.setLength(m > 0.4 ? 4 + (m - 0.4) * 0.3 : 3.7);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, []);

  return (
    <group ref={earthRef} position={[0, 0, -8]}>
      <mesh>
        <sphereGeometry ref={baseGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial vertexColors roughness={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry ref={landGeoRef} args={[4, 96, 96]} />
        <meshStandardMaterial color="#7fd46b" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Planet({ position, size, color, emissive }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.35 : 0}
        roughness={0.7}
      />
    </mesh>
  );
}

function PlanetOrbit() {
  const orbitRef = useRef();

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={orbitRef}>
      <Planet position={[-12, 5, -5]} size={1.5} color="#ff6b6b" />
      <Planet position={[10, -6, -3]} size={1.2} color="#4ecdc4" emissive />
      <Planet position={[-8, -8, -6]} size={2} color="#ffe66d" />
      <Planet position={[14, 3, -4]} size={0.8} color="#a8e6cf" />
      <Planet position={[6, 10, -7]} size={1.8} color="#ff9ff3" emissive />
      <Planet position={[-15, -4, -5]} size={1.3} color="#95e1d3" />
      <Planet position={[18, -2, -8]} size={2.3} color="#c7ceea" />
      <Planet position={[-20, 6, -10]} size={1.1} color="#feca57" emissive />
      <Planet position={[0, 16, -9]} size={1.6} color="#48dbfb" />
      <Planet position={[22, 8, -12]} size={2.8} color="#5f27cd" emissive />
    </group>
  );
}

function StarField() {
  const groupRef = useRef();
  const meshRef = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = [];
    const col = [];

    const palette = [
      "#ffffff",
      "#9fd3ff",
      "#ffd166",
      "#ff6b6b",
      "#c77dff",
      "#4cc9f0",
    ].map((c) => new THREE.Color(c));

    for (let i = 0; i < STAR_FIELD.count; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() * 2 - 1) * STAR_FIELD.halfWidth,
          (Math.random() * 2 - 1) * STAR_FIELD.halfHeight,
          (Math.random() * 2 - 1) * STAR_FIELD.halfDepth
        )
      );
      col.push(palette[Math.floor(Math.random() * palette.length)]);
    }

    return { positions: pos, colors: col };
  }, []);

  useLayoutEffect(() => {
    const temp = new THREE.Object3D();
    const color = new THREE.Color();

    positions.forEach((p, i) => {
      temp.position.copy(p);
      temp.scale.setScalar(
        THREE.MathUtils.lerp(
          STAR_FIELD.minSize,
          STAR_FIELD.maxSize,
          Math.random()
        )
      );
      temp.updateMatrix();

      meshRef.current.setMatrixAt(i, temp.matrix);
      color.copy(colors[i]);
      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, positions.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          vertexColors
          emissive="#ffffff"
          emissiveIntensity={2.5}
          roughness={0.05}
          metalness={0}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

export default function CanvasView() {
  return (
    <Canvas camera={{ position: [0, 0, 26], fov: 55 }}>
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 6]} intensity={1.2} />

      <SkyStars radius={150} depth={90} count={3000} factor={4.5} fade />
      <StarField />

      <Earth />
      <PlanetOrbit />

      <OrbitControls
        enableRotate={false}
        enablePan={false}
        enableZoom
        minDistance={12}
        maxDistance={55}
      />
    </Canvas>
  );
}