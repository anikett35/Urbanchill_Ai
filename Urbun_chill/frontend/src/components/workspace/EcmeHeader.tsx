'use client';

import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sliders,
  Settings,
  Compass,
  X,
} from 'lucide-react';
import CitySearchBar from '@/components/landing/CitySearchBar';
import HierarchicalLocationSelector from '@/components/landing/HierarchicalLocationSelector';
import type { CityResult } from '@/lib/globeConfig';
import { useTheme } from '@/lib/themeContext';

interface EcmeHeaderProps {
  cityName: string;
  lat: number;
  lon: number;
  onCitySelected: (city: CityResult) => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
  onOpenSimulation: () => void;
  onExportPdf: () => void;
  onOpenVoiceAgent?: () => void;
  onOpenThemeConfig?: () => void;
}

export default function EcmeHeader({
  cityName,
  lat,
  lon,
  onCitySelected,
  isLoading,
  onToggleSidebar,
  onOpenSimulation,
  onExportPdf,
  onOpenVoiceAgent,
  onOpenThemeConfig,
}: EcmeHeaderProps) {
  const { mode, setMode } = useTheme();
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

  return (
    <>
      <header className="header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-30 select-none">
        {/* ── Left Side: Collapse Toggle & Global City Search ───────────── */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="header-action-item text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/60 p-2 rounded-xl transition-colors"
            title="Toggle Navigation Sidebar"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1">
            <CitySearchBar
              onCitySelected={onCitySelected}
              activeCityName={cityName}
              isAnalyzing={isLoading}
              placeholder="Search city, taluka, or area..."
              showSubLabel={false}
            />
          </div>

          {/* Hierarchical Drilldown Quick Trigger Button */}
          <button
            onClick={() => setIsHierarchyModalOpen(true)}
            className="header-action-item text-xs font-semibold px-2.5 py-1.5 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Change Location: Country → State → District → Taluka → Area"
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Regions & Talukas</span>
          </button>
        </div>

      {/* ── Right Side: Primary Action, Theme Mode & Settings ─────────── */}
      <div className="flex items-center gap-3">
        {/* Action: Simulate Cooling */}
        <button
          onClick={onOpenSimulation}
          className="button button-solid rounded-xl px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer"
          title="Test urban cooling interventions"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Cooling Simulator</span>
        </button>

        {/* Ecme Mode Switcher Segmented Pill */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs select-none">
          <button
            onClick={() => setMode('light')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'light'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
            title="Switch to Ecme Light Theme"
          >
            <Sun className={`w-3.5 h-3.5 ${mode === 'light' ? 'text-amber-500 fill-amber-500' : ''}`} />
            <span>Light</span>
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'dark'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
            title="Switch to Ecme Dark Theme"
          >
            <Moon className={`w-3.5 h-3.5 ${mode === 'dark' ? 'fill-current' : ''}`} />
            <span>Dark</span>
          </button>
        </div>

        {/* Ecme Theme Configurator Gear Button */}
        {onOpenThemeConfig && (
          <button
            onClick={onOpenThemeConfig}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
            title="Open Ecme Theme Configurator"
            aria-label="Theme Configurator"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
      </header>

      {/* ── Hierarchical Location Modal Dialog ─────────────────────────── */}
      {isHierarchyModalOpen && (
        <div className="dialog-overlay z-50">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Select Administrative Scope & Location
                </span>
              </div>
              <button
                onClick={() => setIsHierarchyModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <HierarchicalLocationSelector
                onLocationSelected={(loc) => {
                  onCitySelected(loc);
                  setIsHierarchyModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
