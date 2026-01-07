// CanvasView.jsx
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars as SkyStars } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

import EarthSpecularMap from "/src/assets/image/8k_earth_specular_map.jpg";

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
  const geoRef = useRef();
  const specularMap = useLoader(TextureLoader, EarthSpecularMap);

  const BASE_RADIUS = 4;
  const LAND_HEIGHT = 0.15;

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.4;
    }
  });

  useLayoutEffect(() => {
    const geo = geoRef.current;
    if (!geo || !specularMap.image) return;

    const img = specularMap.image;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();

    const landColor = new THREE.Color("#6fcf97");
    const seaColor = new THREE.Color("#4aa3ff");

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();

      const u = 0.5 + Math.atan2(v.z, v.x) / (2 * Math.PI);
      const vv = 0.5 - Math.asin(v.y) / Math.PI;

      const x = Math.floor(u * img.width);
      const y = Math.floor(vv * img.height);
      const idx = (y * img.width + x) * 4;

      const brightness = data[idx];
      const isOcean = brightness > 120;

      const c = isOcean ? seaColor : landColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const radius = isOcean ? BASE_RADIUS : BASE_RADIUS + LAND_HEIGHT;

      v.multiplyScalar(radius);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [specularMap]);

  return (
    <group ref={earthRef} position={[0, 0, -8]}>
      <mesh>
        <sphereGeometry ref={geoRef} args={[BASE_RADIUS, 96, 96]} />
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0} />
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
  const ref = useRef();

  const planets = [
    // 앞쪽 3개
    { position: [-10, 6, 8], size: 1.5, color: "#ff6b6b" },
    { position: [0, -8, 9], size: 1.8, color: "#4ecdc4", emissive: true },
    { position: [12, 4, 7], size: 1.2, color: "#ffe66d" },

    // 양옆 3개
    { position: [-18, 0, 0], size: 1.6, color: "#a8e6cf" },
    { position: [-15, 10, -2], size: 1.3, color: "#ff9ff3", emissive: true },
    { position: [20, -5, 1], size: 1.4, color: "#ffd6a5" },

    // 뒤쪽 3개
    { position: [-8, -6, -10], size: 1.7, color: "#9bf6ff" },
    { position: [10, 8, -9], size: 1.1, color: "#bdb2ff", emissive: true },
    { position: [0, -10, -11], size: 1.5, color: "#caffbf" },
  ];

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={ref}>
      {planets.map((planet, i) => (
        <Planet key={i} {...planet} />
      ))}
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
      meshRef.current.setColorAt(i, colors[i]);
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
