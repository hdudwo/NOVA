import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

import EarthSpecularMap from "/src/assets/image/8k_earth_specular_map.jpg";

/* =======================
   Stars Background
======================= */

// 동그란 별 모양을 위한 텍스처 생성
function createCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function StarsBackground() {
  const starsRef = useRef();

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // 별 색상 팔레트 (흰색, 연한 노랑, 약간 파란 흰색)
    const colorPalette = [
      new THREE.Color(0xffffff), // 순백
      new THREE.Color(0xffffee), // 연한 노랑
      new THREE.Color(0xffffe0), // 크림색
      new THREE.Color(0xfff8dc), // 코른실크
      new THREE.Color(0xf0f8ff), // 약간 파란 흰색
    ];

    for (let i = 0; i < starCount; i++) {
      // 별들을 구 형태로 랜덤 배치 (더 가까운 거리)
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // 랜덤 색상 선택
      const randomColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = randomColor.r;
      colors[i * 3 + 1] = randomColor.g;
      colors[i * 3 + 2] = randomColor.b;

      // 랜덤 크기 (더 크게)
      sizes[i] = 0.5 + Math.random() * 2.0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      map: createCircleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry, material };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
      starsRef.current.rotation.x += delta * 0.01;
    }
  });

  return <points ref={starsRef} geometry={geometry} material={material} />;
}

/* =======================
   Earth (기존 방식 유지)
======================= */

function Earth() {
  const earthRef = useRef();
  const geoRef = useRef();
  const specularMap = useLoader(TextureLoader, EarthSpecularMap);

  const BASE_RADIUS = 4;
  const LAND_HEIGHT = 0.15;

  useFrame((_, delta) => {
    earthRef.current.rotation.y += delta * 0.4;
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

    const land = new THREE.Color("#6fcf97");
    const sea = new THREE.Color("#4aa3ff");

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();

      const u = 0.5 + Math.atan2(v.z, v.x) / (2 * Math.PI);
      const vv = 0.5 - Math.asin(v.y) / Math.PI;
      const x = Math.floor(u * img.width);
      const y = Math.floor(vv * img.height);
      const idx = (y * img.width + x) * 4;

      const isOcean = data[idx] > 120;
      const c = isOcean ? sea : land;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      v.multiplyScalar(isOcean ? BASE_RADIUS : BASE_RADIUS + LAND_HEIGHT);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [specularMap]);

  return (
    <mesh ref={earthRef} position={[0, 0, -8]}>
      <sphereGeometry ref={geoRef} args={[BASE_RADIUS, 96, 96]} />
      <meshStandardMaterial vertexColors roughness={0.85} />
    </mesh>
  );
}

/* =======================
   Shader Planet
======================= */

function PatternPlanet({ position, size, colors }) {
  const materialRef = useRef();

  useFrame((_, delta) => {
    materialRef.current.uniforms.uTime.value += delta;
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        c1: { value: new THREE.Color(colors[0]) },
        c2: { value: new THREE.Color(colors[1]) },
        c3: { value: new THREE.Color(colors[2]) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uTime;
        uniform vec3 c1;
        uniform vec3 c2;
        uniform vec3 c3;

        float noise(vec3 p) {
          return sin(p.x * 4.0 + uTime)
               * sin(p.y * 4.0)
               * sin(p.z * 4.0);
        }

        void main() {
          float n = noise(normalize(vNormal));
          float g = smoothstep(-0.2, 0.6, n);

          vec3 col = mix(c1, c2, g);
          col = mix(col, c3, g * abs(n));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [colors]);

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  );
}

/* =======================
   Planet Orbit
======================= */

function PlanetOrbit() {
  const ref = useRef();

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.05;
  });



  
  return (
    <group ref={ref}>
      <PatternPlanet
        position={[-12, 6, 6]}
        size={1.6}
        colors={["#8b5cf6", "#6366f1", "#ec4899"]} // 보라-남색-핑크
      />
      <PatternPlanet
        position={[14, -4, 5]}
        size={1.9}
        colors={["#06b6d4", "#3b82f6", "#8b5cf6"]} // 청록-파랑-보라
      />
      <PatternPlanet
        position={[0, -10, -6]}
        size={1.4}
        colors={["#f59e0b", "#ef4444", "#dc2626"]} // 주황-빨강-진한빨강
      />
    </group>
  );
}

/* =======================
   Canvas
======================= */

export default function CanvasView() {
  return (
    <Canvas camera={{ position: [0, 0, 26], fov: 55 }}>
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />

      {/* 커스텀 별 배경 */}
      <StarsBackground />

      <Earth />
      <PlanetOrbit />

      <OrbitControls
        enableRotate={false}
        enablePan={false}
        enableZoom
        minDistance={14}
        maxDistance={55}
      />
    </Canvas>
  );
}
