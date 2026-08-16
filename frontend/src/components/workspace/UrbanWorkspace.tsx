'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, MapPin, Radio, Layers, BarChart3, Map } from 'lucide-react';
import { useState } from 'react';
import LayersSidebar from './LayersSidebar';
import AnalyticsSidebar from './AnalyticsSidebar';
import CesiumMapPanel from './CesiumMapPanel';
import CitySearchBar from '@/components/landing/CitySearchBar';
import type { AppState, CityResult, AnalyzeResult } from '@/lib/globeConfig';

interface UrbanWorkspaceProps {
  appState: AppState;
  city: CityResult;
  analyzeData: AnalyzeResult | null;
  onReset: () => void;
  onCitySelected: (city: CityResult) => void;
}

export default function UrbanWorkspace({
  appState,
  city,
  analyzeData,
  onReset,
  onCitySelected,
}: UrbanWorkspaceProps) {
  const isLoading = appState === 'arrived' || appState === 'analyzing';

  return (
    <AnimatePresence>
      <div
        key="workspace-container"
        className="fixed inset-0 z-20 pointer-events-none"
        aria-label="Urban Intelligence Workspace"
      >
        {/* ── Persistent Top Navigation Strip (h-14 = 56px) ── */}
        <motion.header
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="
            pointer-events-auto
            fixed top-0 left-0 right-0 h-14 z-40
            bg-slate-950/90 backdrop-blur-2xl
            border-b border-white/10
            flex items-center justify-between
            px-4 sm:px-6
            shadow-xl shadow-black/50
          "
        >
          {/* Left: Back to globe button + City Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onReset}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-white/6 hover:bg-white/12
                border border-white/10 hover:border-white/20
                text-slate-300 hover:text-white
                text-xs font-semibold
                transition-all duration-150
                flex-shrink-0
              "
              aria-label="Return to global view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Globe</span>
            </button>

            <div className="h-4 w-px bg-white/15 flex-shrink-0 hidden sm:block" />

            {/* City breadcrumb badge */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm truncate">{city.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                    {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Live Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs font-mono">
            {isLoading ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="text-amber-400">Ingesting satellite bands…</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-emerald-400">Landsat-8 & Sentinel-2 Sync</span>
              </>
            )}
          </div>

          {/* Right: Integrated Compact Search HUD */}
          <div className="flex items-center gap-2">
            <CitySearchBar
              onCitySelected={onCitySelected}
              activeCityName={city.name}
              isAnalyzing={isLoading}
              placeholder="Hop to another city…"
            />
          </div>
        </motion.header>

        {/* ── Left Sidebar (starts below h-14 top strip) ── */}
        <div className="pointer-events-auto">
          <LayersSidebar isLoading={isLoading} city={city.name} />
        </div>

        {/* ── Center Map Panel Toolbar (transparent — globe visible behind) ── */}
        <CesiumMapPanel city={city} appState={appState} />

        {/* ── Right Sidebar (starts below h-14 top strip) ── */}
        <div className="pointer-events-auto">
          <AnalyticsSidebar
            isLoading={isLoading}
            data={analyzeData}
            city={city.name}
          />
        </div>

        {/* ── Mobile Bottom Tab Bar ── */}
        <MobileTabBar city={city.name} isLoading={isLoading} data={analyzeData} />
      </div>
    </AnimatePresence>
  );
}

// ── Mobile-only bottom sheet with tabs (< md breakpoint) ─────────────────────

function MobileTabBar({
  city,
  isLoading,
  data,
}: {
  city: string;
  isLoading: boolean;
  data: AnalyzeResult | null;
}) {
  const [activeTab, setActiveTab] = useState<'map' | 'layers' | 'analytics'>('map');

  const TABS = [
    { id: 'layers' as const, label: 'Layers', Icon: Layers },
    { id: 'map' as const, label: 'Map', Icon: Map },
    { id: 'analytics' as const, label: 'Analytics', Icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-auto">
      {/* Sheet content */}
      <AnimatePresence>
        {activeTab !== 'map' && (
          <motion.div
            key={activeTab}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="
              bg-slate-950/98 backdrop-blur-2xl
              border-t border-white/10
              rounded-t-3xl
              max-h-[50vh] overflow-y-auto
              px-4 pt-4 pb-20
              shadow-2xl shadow-black
            "
          >
            {activeTab === 'layers' && (
              <div>
                <h2 className="text-white font-semibold text-sm mb-3">Map Layers — {city}</h2>
                <p className="text-slate-400 text-xs">Toggle LST, NDVI, and Heat-risk layers from desktop workspace</p>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-white font-semibold text-sm mb-3">Thermal Analytics — {city}</h2>
                {isLoading ? (
                  <p className="text-amber-400 text-xs animate-pulse">Loading satellite telemetry…</p>
                ) : data ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-slate-400">Heat Risk Level</span>
                      <span className="text-red-400 font-bold">{data.heatRisk}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-slate-400">Land Surface Temp</span>
                      <span className="text-white font-bold">{data.lst.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-slate-400">Vegetation Index (NDVI)</span>
                      <span className="text-emerald-400 font-bold">{data.ndvi.toFixed(2)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="
        flex
        bg-slate-950/95 backdrop-blur-xl
        border-t border-white/10
        pb-safe
      ">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-3
              text-[10px] font-mono uppercase tracking-wider
              transition-colors duration-150
              ${activeTab === id ? 'text-red-400 font-bold' : 'text-slate-400'}
            `}
            aria-pressed={activeTab === id}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

