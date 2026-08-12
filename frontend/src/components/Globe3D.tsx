"use client";

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import { useRouter } from 'next/navigation';

const CITIES = [
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
];

function GlobeObject() {
  const router = useRouter();
  const [globe, setGlobe] = useState<ThreeGlobe | null>(null);

  useEffect(() => {
    const g = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .pointsData(CITIES)
      .pointAltitude(0.02)
      .pointColor(() => '#ef4444') // Tailwind red-500
      .pointRadius(0.6)
      .pointResolution(32);

    // We can add a red/warm glow using standard material properties
    const globeMaterial = g.globeMaterial() as any;
    globeMaterial.color.set('#333333');
    globeMaterial.emissive.set('#220000');
    globeMaterial.emissiveIntensity = 0.5;
    globeMaterial.shininess = 0.7;

    (g as any).onPointClick((point: any) => {
      router.push(`/dashboard?city=${encodeURIComponent(point.name)}`);
    });

    setGlobe(g);
  }, [router]);

  // Return the primitive containing the three-globe instance
  return globe ? <primitive object={globe} /> : null;
}

export default function Globe3D() {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas camera={{ position: [50, 40, 100], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffedd5" /> 
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <GlobeObject />
        {/* Rotate and focus towards India (Approx Lat 20, Lon 78) */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={120} 
          maxDistance={300}
          autoRotate 
          autoRotateSpeed={0.5}
          target={[50, 20, 50]} 
        />
      </Canvas>
    </div>
  );
}
