'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LandingOverlay from './LandingOverlay';
import UrbanWorkspace from '@/components/workspace/UrbanWorkspace';
import type { AppState, CityResult, AnalyzeResult } from '@/lib/globeConfig';

// ── Lazy-load GlobeCanvas (heavy Three.js — SSR must be off) ─────────────────
const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#020817' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
      <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-t-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-semibold">Initialising 3D Engine</p>
          <p className="text-slate-500 text-xs mt-1">Loading globe textures…</p>
        </div>
      </div>
    </div>
  ),
});

import { fetchCityAnalysis } from '@/lib/apiClient';

export default function GlobeLandingPage() {
  const [appState, setAppState] = useState<AppState>('idle_rotating');
  const [flyTarget, setFlyTarget] = useState<CityResult | null>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResult | null>(null);
  const [pauseRotation, setPauseRotation] = useState(false);

  /** Called when the user picks a city (search, quick-preset chip, or globe-click) */
  const handleCitySelected = useCallback(
    async (city: CityResult) => {
      setFlyTarget(city);
      setAppState('flying'); // → overlay fades out immediately, fly begins
    },
    []
  );

  /** Called by GlobeCanvas when the camera fly-to animation completes */
  const handleArrived = useCallback(async () => {
    if (!flyTarget) return;

    setAppState('arrived'); // → workspace begins sliding in
    // Small gap so workspace animation leads the data fetch
    await new Promise((r) => setTimeout(r, 120));
    setAppState('analyzing'); // → skeleton loaders visible

    try {
      const result = await fetchCityAnalysis(flyTarget);
      setAnalyzeData(result);
      setAppState('workspace_ready');
    } catch (err: any) {
      console.error('[UrbanChill] Analysis fetch error:', err);
      alert(err?.message || 'Unable to resolve the requested city. Please verify the city name or provide explicit coordinates.');
      setAppState('idle_rotating');
      setFlyTarget(null);
      setAnalyzeData(null);
    }
  }, [flyTarget]);

  /** Reset to landing */
  const handleReset = useCallback(() => {
    setAppState('idle_rotating');
    setFlyTarget(null);
    setAnalyzeData(null);
    setPauseRotation(false);
  }, []);

  const isWorkspaceVisible =
    appState === 'arrived' ||
    appState === 'analyzing' ||
    appState === 'workspace_ready';

  const isOverlayVisible =
    appState === 'idle_rotating' ||
    appState === 'flying';

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#020817' }}
    >
      {/* ── Globe canvas — ALWAYS MOUNTED, never unmounted ── */}
      <GlobeCanvas
        appState={appState}
        flyTarget={flyTarget}
        onCitySelected={handleCitySelected}
        onArrived={handleArrived}
        pauseRotation={pauseRotation}
      />

      {/* ── Landing overlay (hero card with title + search + quick chips) ── */}
      <LandingOverlay
        visible={isOverlayVisible}
        onCitySelected={handleCitySelected}
      />

      {/* ── Urban Workspace (3-panel shell with persistent top strip) ── */}
      {isWorkspaceVisible && flyTarget && (
        <UrbanWorkspace
          appState={appState}
          city={flyTarget}
          analyzeData={analyzeData}
          onReset={handleReset}
          onCitySelected={handleCitySelected}
        />
      )}
    </div>
  );
}

