'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Layers,
  BarChart3,
  Map as MapIcon,
} from 'lucide-react';

import EcmeSideNav, { type WorkspaceView } from './EcmeSideNav';
import EcmeHeader from './EcmeHeader';
import AnalyticsView from './AnalyticsView';
import InteractiveMapViewer from './InteractiveMapViewer';
import TimeSliderBar from './TimeSliderBar';
import SimulationView from './SimulationView';
import CityComparisonView from './CityComparisonView';
import MlopsDashboardView from './MlopsDashboardView';
import VoiceAgentWidget from './VoiceAgentWidget';
import EcmeThemeConfigurator from '@/components/template/EcmeThemeConfigurator';
import { downloadPdfReport, type SimulationResult } from '@/lib/apiClient';
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

  // Navigation sidebar collapse state
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  // Active Main View (Map, Simulation, Comparison, or MLOps)
  const [activeView, setActiveView] = useState<WorkspaceView>('map');

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

  // Copilot voice assistant state
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);

  // Ecme Theme Configurator slide-over drawer state
  const [isThemeConfigOpen, setIsThemeConfigOpen] = useState(false);

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

  const handleExportPdf = () => {
    downloadPdfReport(city.name, analyzeData);
  };

  return (
    <div
      className="app-layout-collapsible-side fixed inset-0 z-20 flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden"
      aria-label="Urban Intelligence Workspace"
    >
      {/* ── Left Side: Ecme Collapsible Navigation Sidebar ─────────────── */}
      <EcmeSideNav
        isCollapsed={isSideNavCollapsed}
        onToggleCollapse={() => setIsSideNavCollapsed((v) => !v)}
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenVoiceAgent={() => setIsVoiceAgentOpen((v) => !v)}
        onToggleTimeSlider={() => setIsTimeSliderActive((v) => !v)}
        isTimeSliderActive={isTimeSliderActive}
        onExportPdf={handleExportPdf}
        onReturnToGlobe={onReset}
        dataQualityScore={95}
        modelVersion="urbanchill-rf-1.1"
        cityName={city.name}
      />

      {/* ── Main Column: Sticky Header & Viewport Canvas Area ──────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
        {/* Ecme Top Header Strip */}
        <EcmeHeader
          cityName={city.name}
          lat={city.lat}
          lon={city.lon}
          onCitySelected={(c) => {
            onCitySelected(c);
            setActiveView('map');
          }}
          isLoading={isLoading}
          onToggleSidebar={() => setIsSideNavCollapsed((v) => !v)}
          onOpenSimulation={() => setActiveView('simulation')}
          onExportPdf={handleExportPdf}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen((v) => !v)}
          onOpenThemeConfig={() => setIsThemeConfigOpen(true)}
        />

        {/* Viewport Row: Digital Twin Map Viewport OR Full In-Place Page Views */}
        <div className="flex flex-1 min-h-0 relative overflow-hidden">
          {activeView === 'map' && (
            <div className="flex-1 h-full relative overflow-hidden">
              <InteractiveMapViewer
                city={city}
                appState={appState}
                activeLayers={activeLayers}
                layerOpacities={layerOpacities}
                selectedYear={selectedYear}
              />

              {/* Historical Time Slider Bar (Centered STRICTLY over the 3D Map) */}
              {isTimeSliderActive && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden sm:block max-w-[90%]">
                  <TimeSliderBar currentYear={selectedYear} onYearChange={setSelectedYear} />
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              cityName={city.name}
              data={analyzeData}
              isLoading={isLoading}
              onReturnToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'simulation' && (
            <SimulationView
              cityName={city.name}
              onReturnToMap={() => setActiveView('map')}
              onApplySimulation={(res) => {
                setActiveSimResult(res);
                setActiveView('map');
              }}
            />
          )}

          {activeView === 'comparison' && (
            <CityComparisonView
              currentCityName={city.name}
              onReturnToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'mlops' && (
            <MlopsDashboardView
              onReturnToMap={() => setActiveView('map')}
            />
          )}
        </div>
      </div>

      {/* ── Floating Voice Agent Copilot Widget (English & Hindi) ──────── */}
      <VoiceAgentWidget
        city={city}
        analyzeResult={analyzeData}
        isOpenExternal={isVoiceAgentOpen}
        onToggleExternal={() => setIsVoiceAgentOpen((v) => !v)}
      />

      {/* Ecme Theme Configurator Slide-Over Drawer */}
      <EcmeThemeConfigurator
        isOpen={isThemeConfigOpen}
        onClose={() => setIsThemeConfigOpen(false)}
      />

      {/* Mobile Bottom Tab Navigation */}
      <MobileTabBar
        city={city.name}
        isLoading={isLoading}
        data={analyzeData}
        onOpenSim={() => setActiveView('simulation')}
        onOpenCompare={() => setActiveView('comparison')}
      />
    </div>
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
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-750 rounded-t-2xl max-h-[50vh] overflow-y-auto px-4 pt-4 pb-20 shadow-2xl"
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
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-3">Urban Heat & Weather — {city}</h2>
                {isLoading ? (
                  <p className="text-amber-500 text-xs animate-pulse">Loading spatial climate telemetry…</p>
                ) : data ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-750">
                      <span className="text-gray-500 dark:text-gray-400">Heat Risk Level</span>
                      <span className="text-primary font-bold">{data.heatRisk}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-750">
                      <span className="text-gray-500 dark:text-gray-400">Ground Temperature</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{data.lst.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-750">
                      <span className="text-gray-500 dark:text-gray-400">Greenery Index</span>
                      <span className="text-primary font-bold">{data.ndvi.toFixed(2)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-750 pb-safe">
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
