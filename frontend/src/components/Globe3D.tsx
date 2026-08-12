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
    let isMounted = true;
    const g = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .pointsData(CITIES)
      .pointAltitude(0.02)
      .pointColor(() => '#ef4444') // Tailwind red-500
      .pointRadius(0.6)
      .pointResolution(32);

    const globeMaterial = g.globeMaterial() as any;
    globeMaterial.color.set('#ffffff');
    globeMaterial.emissive.set('#111111');
    globeMaterial.emissiveIntensity = 0.2;
    globeMaterial.shininess = 0.9;

    if (isMounted) {
      setGlobe(g);
    }
    
    return () => {
      isMounted = false;
      // Ideally dispose WebGL resources here if possible
    };
  }, [router]);

  return globe ? (
    <primitive 
      object={globe} 
      onClick={(e: any) => {
        e.stopPropagation();
        // three-globe attaches the original data to the mesh's __data property
        const data = e.object.__data;
        if (data && data.name) {
          router.push(`/dashboard?city=${encodeURIComponent(data.name)}`);
        }
      }}
    />
  ) : null;
}

export default function Globe3D() {
  return (
    <div className="w-full h-full bg-slate-50">
      <Canvas camera={{ position: [50, 40, 100], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 30]} intensity={2.5} color="#ffffff" /> 
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ef4444" />
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
