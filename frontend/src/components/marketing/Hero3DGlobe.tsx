'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { GLOBE_CITIES, GLOBE_RADIUS, latLonToVector3 } from '@/lib/globeConfig';

function EarthScene() {
  const controlsRef = useRef<any>(null);

  const globe = useMemo(() => {
    const g = new ThreeGlobe()
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .pointsData(GLOBE_CITIES)
      .pointAltitude(0.018)
      .pointColor(() => '#ef4444')
      .pointRadius(0.5)
      .pointResolution(32)
      .atmosphereColor('#3b82f6')
      .atmosphereAltitude(0.16);

    const mat = (g as any).globeMaterial() as THREE.MeshPhongMaterial;
    if (mat) {
      mat.color.set('#ffffff');
      mat.shininess = 25;
      mat.emissive = new THREE.Color('#1e293b');
      mat.emissiveIntensity = 0.35;
    }

    return g;
  }, []);

  return (
    <>
      <Stars radius={400} depth={50} count={3500} factor={4} saturation={0} fade speed={0.05} />

      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[180, 100, 150]} intensity={2.8} color="#fffcf5" />
      <directionalLight position={[-180, -60, -150]} intensity={1.8} color="#93c5fd" />
      <directionalLight position={[0, 220, 0]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 300]} intensity={0.8} color="#ffffff" />

      <primitive object={globe} />

      {/* Atmosphere Glow */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.055, 64, 64]} />
        <meshPhongMaterial
          color="#3b82f6"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={GLOBE_RADIUS * 1.2}
        maxDistance={GLOBE_RADIUS * 3.2}
        autoRotate={true}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
      />
    </>
  );
}

export default function Hero3DGlobe() {
  const initialCameraPos = useMemo(() => {
    const v = latLonToVector3(18, 78, 230);
    return [v.x, v.y, v.z] as [number, number, number];
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1324] via-[#070D1A] to-[#03060D] border border-white/10 shadow-2xl shadow-slate-900/40">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: initialCameraPos, fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <EarthScene />
      </Canvas>

      {/* Top telemetry tag */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
          Live 3D Digital Twin
        </span>
      </div>

      {/* Bottom hint badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400 select-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
