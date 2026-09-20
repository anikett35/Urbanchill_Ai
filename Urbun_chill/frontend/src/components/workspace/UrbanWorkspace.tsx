'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Sliders,
  GitCompare,
  Cpu,
  Clock,
  Layers,
  BarChart3,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react';

import LayersSidebar from './LayersSidebar';
import AnalyticsSidebar from './AnalyticsSidebar';
import InteractiveMapViewer from './InteractiveMapViewer';
import TimeSliderBar from './TimeSliderBar';
import SimulationModal from './SimulationModal';
import CityComparisonModal from './CityComparisonModal';
import MlopsDashboardModal from './MlopsDashboardModal';
import CitySearchBar from '@/components/landing/CitySearchBar';
import type { AppState, CityResult, AnalyzeResult } from '@/lib/globeConfig';
import type { SimulationResult } from '@/lib/apiClient';

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

  // Layer States & Opacities synchronized across sidebars and map canvas
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    lst: true,
    ndvi: true,
    heat_risk: true,
    land_use: false,
  });
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({
    lst: 80,
    ndvi: 80,
    heat_risk: 80,
    land_use: 60,
  });

  // Modal States
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isMlopsOpen, setIsMlopsOpen] = useState(false);

  // Time Slider State
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isTimeSliderActive, setIsTimeSliderActive] = useState<boolean>(true);

  // Active Simulation Applied (optional)
  const [activeSimResult, setActiveSimResult] = useState<SimulationResult | null>(null);

  const toggleLayer = (id: string) => {
    setActiveLayers((s) => ({ ...s, [id]: !s[id] }));
  };

  const setOpacity = (id: string, val: number) => {
    setLayerOpacities((s) => ({ ...s, [id]: val }));
  };

  return (
    <AnimatePresence>
      <div
        key="workspace-container"
        className="fixed inset-0 z-20 pointer-events-none"
        aria-label="Urban Intelligence Workspace"
      >
        {/* Top Navigation Strip matching Ecme Theme Header */}
        <motion.header
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="
            pointer-events-auto fixed top-0 left-0 right-0 h-16 z-40
            bg-white dark:bg-gray-800
            border-b border-gray-200 dark:border-gray-700
            flex items-center justify-between px-4 sm:px-6 shadow-xs
          "
        >
          {/* Left: Return button & City Name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onReset}
              className="
                flex items-center gap-2 px-3.5 py-2 rounded-xl
                bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600
                text-gray-700 dark:text-gray-200
                text-xs font-semibold
                transition-colors duration-150 flex-shrink-0
              "
              aria-label="Return to global view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Globe</span>
            </button>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-sm truncate">{city.name}</span>
                  <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 hidden md:inline">
                    {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Action Toolbar matching Theme Pills */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsSimOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>Simulate Cooling</span>
            </button>

            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-sky-500" />
              <span>Compare Cities</span>
            </button>

            <button
              onClick={() => setIsMlopsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>MLOps Telemetry</span>
            </button>

            <button
              onClick={() => setIsTimeSliderActive((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isTimeSliderActive
                  ? 'bg-primary text-white font-bold'
                  : 'hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historical Timeline</span>
            </button>
          </div>

          {/* Right: Search bar & Satellite indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sentinel-2 Active</span>
            </div>
            <CitySearchBar
              onCitySelected={onCitySelected}
              activeCityName={city.name}
              isAnalyzing={isLoading}
              placeholder="Search global city"
            />
          </div>
        </motion.header>

        {/* Left GIS Layers Sidebar */}
        <div className="pointer-events-auto">
          <LayersSidebar
            isLoading={isLoading}
            city={city.name}
            layerStates={activeLayers}
            onToggleLayer={toggleLayer}
            opacities={layerOpacities}
            onSetOpacity={setOpacity}
          />
        </div>

        {/* Center Multi-Layer Interactive Digital Twin Viewport */}
        <InteractiveMapViewer
          city={city}
          appState={appState}
          activeLayers={activeLayers}
          layerOpacities={layerOpacities}
          selectedYear={selectedYear}
        />

        {/* Bottom Historical Time Slider Control */}
        {isTimeSliderActive && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden sm:block">
            <TimeSliderBar currentYear={selectedYear} onYearChange={setSelectedYear} />
          </div>
        )}

        {/* Right Remote Sensing Analytics Sidebar */}
        <div className="pointer-events-auto">
          <AnalyticsSidebar isLoading={isLoading} data={analyzeData} city={city.name} />
        </div>

        {/* What-If Cooling Simulation Modal */}
        <SimulationModal
          isOpen={isSimOpen}
          onClose={() => setIsSimOpen(false)}
          cityName={city.name}
          onApplySimulation={(res) => setActiveSimResult(res)}
        />

        {/* Side-by-Side City Comparison Modal */}
        <CityComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          currentCityName={city.name}
        />

        {/* MLOps Governance Dashboard Modal */}
        <MlopsDashboardModal
          isOpen={isMlopsOpen}
          onClose={() => setIsMlopsOpen(false)}
        />

        {/* Mobile Tab Bar */}
        <MobileTabBar
          city={city.name}
          isLoading={isLoading}
          data={analyzeData}
          onOpenSim={() => setIsSimOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
        />
      </div>
    </AnimatePresence>
  );
}

function MobileTabBar({
  city,
  isLoading,
  data,
  onOpenSim,
  onOpenCompare,
}: {
  city: string;
  isLoading: boolean;
  data: AnalyzeResult | null;
  onOpenSim: () => void;
  onOpenCompare: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'map' | 'layers' | 'analytics'>('map');
  const TABS = [
    { id: 'layers' as const, label: 'Layers', Icon: Layers },
    { id: 'map' as const, label: 'Map', Icon: MapIcon },
    { id: 'analytics' as const, label: 'Analytics', Icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-auto">
      <AnimatePresence>
        {activeTab !== 'map' && (
          <motion.div
            key={activeTab}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl max-h-[50vh] overflow-y-auto px-4 pt-4 pb-20 shadow-2xl"
          >
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">Interactive GIS Tools — {city}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={onOpenSim}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold"
                  >
                    Simulate Cooling
                  </button>
                  <button
                    onClick={onOpenCompare}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold"
                  >
                    Compare Cities
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-3">Thermal Telemetry — {city}</h2>
                {isLoading ? (
                  <p className="text-amber-500 text-xs animate-pulse">Querying satellite telemetry</p>
                ) : data ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">Heat Risk Level</span>
                      <span className="text-primary font-bold">{data.heatRisk}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">Land Surface Temp</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{data.lst.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">Vegetation Index (NDVI)</span>
                      <span className="text-emerald-500 font-bold">{data.ndvi.toFixed(2)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150 ${
              activeTab === id ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
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
