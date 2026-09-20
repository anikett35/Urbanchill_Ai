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

// ── Mock /analyze endpoint ────────────────────────────────────────────────────
// Replace the body of this function with a real fetch() to POST /analyze
// once the FastAPI backend is running.

const RECOMMENDATIONS = [
  'Plant 20% more urban tree canopy in high-density zones',
  'Install cool roofs on commercial buildings (reflectivity > 0.65)',
  'Create wind corridors along main arterial roads',
  'Expand green-cover parks in heat-island hotspots',
  'Deploy ground-level misting systems at transit nodes',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

async function mockAnalyze(city: CityResult): Promise<AnalyzeResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

  const lstBase = 32 + Math.random() * 14;
  const riskIdx = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
  const riskLabels = ['Low', 'Moderate', 'High', 'Critical'] as const;

  return {
    heatRisk: riskLabels[riskIdx],
    lst: lstBase,
    ndvi: 0.12 + Math.random() * 0.45,
    uvIndex: 4 + Math.floor(Math.random() * 9),
    humidity: 35 + Math.floor(Math.random() * 50),
    airQualityIndex: 40 + Math.floor(Math.random() * 120),
    recommendations: RECOMMENDATIONS.slice(0, 3 + Math.floor(Math.random() * 3)),
    topHeatZones: [
      { name: `${city.name} Industrial Area`, temp: lstBase + 4.2, risk: 'Critical' },
      { name: `${city.name} City Centre`,     temp: lstBase + 2.1, risk: 'High'     },
      { name: `${city.name} Residential West`,temp: lstBase - 1.0, risk: 'Moderate' },
    ],
    weeklyForecast: DAYS.map((day, i) => ({
      day,
      maxTemp: lstBase + Math.sin(i * 0.9) * 3 + Math.random() * 2,
      minTemp: lstBase - 6 + Math.random() * 2,
    })),
  };
}

import { fetchCityAnalysis } from '@/lib/apiClient';
import CitySearchBar from './CitySearchBar';

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
    } catch {
      // Fail gracefully — workspace shows empty state
      setAppState('workspace_ready');
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

      {/* ── Top-right HUD Search Control (visible during landing) ── */}
      {isOverlayVisible && (
        <div className="fixed top-4 right-4 z-40">
          <CitySearchBar
            onCitySelected={handleCitySelected}
            onFocus={() => setPauseRotation(true)}
            onBlur={() => setPauseRotation(false)}
            placeholder="Search any global city…"
          />
        </div>
      )}

      {/* ── Landing overlay (hero card with title + quick chips) ── */}
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

