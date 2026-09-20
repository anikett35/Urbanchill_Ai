'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';

import {
  GLOBE_RADIUS,
  CITY_CAM_DISTANCE,
  FLY_DURATION_SECONDS,
  GLOBE_CITIES,
  AppState,
  CityResult,
  latLonToVector3,
  vector3ToLatLon,
  easeInOutCubic,
} from '@/lib/globeConfig';
import { useCityGeocode } from '@/hooks/useCityGeocode';

// ── Pre-allocated temporary vectors (avoid GC in useFrame) ──────────────────
const _startNorm = new THREE.Vector3();
const _endNorm   = new THREE.Vector3();
const _currentDir = new THREE.Vector3();
const _lookAt    = new THREE.Vector3();

// ── Types ────────────────────────────────────────────────────────────────────

interface GlobeCanvasProps {
  appState: AppState;
  flyTarget: CityResult | null;
  onCitySelected: (city: CityResult) => void;
  onArrived: () => void;
  pauseRotation: boolean;
}

interface SceneProps extends GlobeCanvasProps {
  onReverseGeocode: (lat: number, lon: number) => void;
}

interface FlyState {
  active: boolean;
  progress: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetLook: THREE.Vector3;
}

// ── GlobeScene — runs inside <Canvas>, can use R3F hooks ─────────────────────

function GlobeScene({
  appState,
  flyTarget,
  onArrived,
  onReverseGeocode,
  pauseRotation,
}: SceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const arriveCalled = useRef(false);

  const flyRef = useRef<FlyState>({
    active: false,
    progress: 0,
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    targetLook: new THREE.Vector3(),
  });

  // Create the ThreeGlobe instance (once, expensive)
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .showAtmosphere(false);

    // Adjust globe material with emissive backing so it never renders pure black
    const mat = (g as any).globeMaterial() as THREE.MeshPhongMaterial;
    if (mat) {
      mat.color.set('#ffffff');
      mat.shininess = 25;
      mat.emissive = new THREE.Color('#1e293b');
      mat.emissiveIntensity = 0.35;
    }

    return g;
  }, []);

  // Kick off the fly animation when appState transitions to 'flying'
  useEffect(() => {
    const fly = flyRef.current;
    if (appState !== 'flying' || !flyTarget || fly.active) return;

    const targetPos = latLonToVector3(flyTarget.lat, flyTarget.lon, CITY_CAM_DISTANCE);
    // Look slightly below the surface point for a natural downward tilt
    const targetLook = latLonToVector3(flyTarget.lat, flyTarget.lon, GLOBE_RADIUS * 0.88);

    fly.startPos.copy(camera.position);
    fly.targetPos.copy(targetPos);
    fly.targetLook.copy(targetLook);
    fly.progress = 0;
    fly.active = true;
    arriveCalled.current = false;
  }, [appState, flyTarget, camera]);

  // Update OrbitControls constraints based on app state
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    if (
      appState === 'arrived' ||
      appState === 'analyzing' ||
      appState === 'workspace_ready'
    ) {
      c.minDistance = GLOBE_RADIUS * 1.15;
      c.maxDistance = GLOBE_RADIUS * 1.9;
    } else if (appState === 'idle_rotating') {
      c.minDistance = GLOBE_RADIUS * 1.18;
      c.maxDistance = GLOBE_RADIUS * 3.8;
      c.target.set(0, 0, 0);
      c.update();
    }
  }, [appState]);

  // Fly animation — runs every frame while active
  useFrame((state, delta) => {
    const fly = flyRef.current;
    if (!fly.active) return;

    fly.progress = Math.min(fly.progress + delta / FLY_DURATION_SECONDS, 1);
    const t = fly.progress;
    const et = easeInOutCubic(t);

    // NLERP direction (great-circle approximation without quaternion overhead)
    _startNorm.copy(fly.startPos).normalize();
    _endNorm.copy(fly.targetPos).normalize();
    _currentDir
      .set(0, 0, 0)
      .addScaledVector(_startNorm, 1 - et)
      .addScaledVector(_endNorm, et)
      .normalize();

    // Altitude arc: raise camera through space before swooping down
    const startR = fly.startPos.length();
    const endR   = fly.targetPos.length();
    const arcBump = 75 * Math.sin(Math.PI * t);
    const r = THREE.MathUtils.lerp(startR, endR, et) + arcBump;

    state.camera.position.copy(_currentDir).multiplyScalar(r);

    // Smoothly swing the lookAt from origin toward the city point
    _lookAt.set(0, 0, 0).lerp(fly.targetLook, et);
    state.camera.lookAt(_lookAt);
    state.camera.updateMatrixWorld();

    if (t >= 1 && !arriveCalled.current) {
      arriveCalled.current = true;
      fly.active = false;

      // Snap to exact target and sync OrbitControls
      state.camera.position.copy(fly.targetPos);
      state.camera.lookAt(fly.targetLook);
      const c = controlsRef.current;
      if (c) {
        c.target.copy(fly.targetLook);
        c.update();
      }
      onArrived();
    }
  });

  // Globe click → reverse geocode → city selection
  const handleGlobeClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (appState !== 'idle_rotating') return;
      e.stopPropagation();
      const { lat, lon } = vector3ToLatLon(e.point.x, e.point.y, e.point.z);
      onReverseGeocode(lat, lon);
    },
    [appState, onReverseGeocode]
  );

  const isFlying = appState === 'flying';
  const isIdle   = appState === 'idle_rotating';

  return (
    <>
      {/* ── Space background ── */}
      <Stars
        radius={600}
        depth={60}
        count={6500}
        factor={5}
        saturation={0}
        fade
        speed={0.05}
      />

      {/* ── Rich Multi-angle Lighting ── */}
      <ambientLight intensity={1.5} color="#ffffff" />
      {/* Primary Key Light */}
      <directionalLight
        position={[180, 100, 150]}
        intensity={2.8}
        color="#fffcf5"
        castShadow={false}
      />
      {/* Secondary Fill Light */}
      <directionalLight
        position={[-180, -60, -150]}
        intensity={1.8}
        color="#93c5fd"
        castShadow={false}
      />
      {/* Polar/Top Light */}
      <directionalLight
        position={[0, 220, 0]}
        intensity={1.2}
        color="#ffffff"
        castShadow={false}
      />
      {/* Headlight from viewing direction */}
      <pointLight
        position={[0, 0, 300]}
        intensity={0.8}
        color="#ffffff"
      />

      {/* ── Globe mesh ── */}
      <primitive object={globe} />

      {/* ── Click detection sphere (invisible, full globe surface) ── */}
      <mesh onClick={handleGlobeClick} renderOrder={2}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── OrbitControls ── */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={GLOBE_RADIUS * 1.18}
        maxDistance={GLOBE_RADIUS * 3.8}
        autoRotate={isIdle && !pauseRotation}
        autoRotateSpeed={0.38}
        enabled={!isFlying}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
      />
    </>
  );
}

// ── GlobeCanvas (exported) ───────────────────────────────────────────────────

export default function GlobeCanvas({
  appState,
  flyTarget,
  onCitySelected,
  onArrived,
  pauseRotation,
}: GlobeCanvasProps) {
  const { reverseGeocode } = useCityGeocode();

  const handleReverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      const city = await reverseGeocode(lat, lon);
      onCitySelected(
        city ?? {
          name: 'Selected Location',
          lat,
          lon,
          displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        }
      );
    },
    [reverseGeocode, onCitySelected]
  );

  // Face the globe toward South Asia on load (primary target region)
  const initialCameraPos = useMemo(() => {
    const v = latLonToVector3(18, 80, 240);
    return [v.x, v.y, v.z] as [number, number, number];
  }, []);

  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{ background: '#020817' }}
    >
      <Canvas
        camera={{ position: initialCameraPos, fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <GlobeScene
          appState={appState}
          flyTarget={flyTarget}
          onArrived={onArrived}
          onCitySelected={onCitySelected}
          onReverseGeocode={handleReverseGeocode}
          pauseRotation={pauseRotation}
        />
      </Canvas>
    </div>
  );
}
