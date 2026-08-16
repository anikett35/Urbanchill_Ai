'use client';

import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { GLOBE_CITIES, GLOBE_RADIUS } from '@/lib/globeConfig';

function GlobeMesh() {
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .showAtmosphere(false);

    const mat = (g as any).globeMaterial() as THREE.MeshPhongMaterial;
    if (mat) {
      mat.color.set('#ffffff');
      mat.shininess = 28;
      mat.emissive = new THREE.Color('#1e293b');
      mat.emissiveIntensity = 0.35;
    }

    return g;
  }, []);

  return <primitive object={globe} />;
}

function Scene() {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <Stars radius={500} depth={60} count={4000} factor={4} saturation={0} fade speed={0.05} />

      {/* ── Multi-angle Lighting ── */}
      <ambientLight intensity={1.6} color="#ffffff" />
      <directionalLight position={[180, 100, 150]} intensity={2.8} color="#fffcf5" />
      <directionalLight position={[-180, -60, -150]} intensity={1.8} color="#93c5fd" />
      <directionalLight position={[0, 220, 0]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 300]} intensity={0.9} color="#ffffff" />

      {/* ── Earth Mesh ── */}
      <GlobeMesh />

      {/* ── Orbit Controls ── */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={GLOBE_RADIUS * 1.25}
        maxDistance={GLOBE_RADIUS * 3.5}
        autoRotate={true}
        autoRotateSpeed={0.45}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
      />
    </>
  );
}

export default function HeroGlobeBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto bg-[#070D18]">
      <Canvas
        camera={{ position: [50, 20, 250], fov: 42, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>

      {/* Left side gradient overlay to ensure text readability on desktop */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#070D18] via-[#070D18]/90 to-transparent pointer-events-none z-10" />

      {/* Bottom fade into the next section */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#070D18] to-transparent pointer-events-none z-10" />
    </div>
  );
}
