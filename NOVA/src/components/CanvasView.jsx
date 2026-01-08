import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

import EarthSpecularMap from "/src/assets/image/8k_earth_specular_map.jpg";

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
        colors={["#ff6b6b", "#ffd166", "#4cc9f0"]}
      />
      <PatternPlanet
        position={[14, -4, 5]}
        size={1.9}
        colors={["#9bf6ff", "#bdb2ff", "#ffc6ff"]}
      />
      <PatternPlanet
        position={[0, -10, -6]}
        size={1.4}
        colors={["#a8e6cf", "#dcedc1", "#ffd3b6"]}
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

      <Stars radius={150} depth={80} count={3000} factor={4} fade />

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
2