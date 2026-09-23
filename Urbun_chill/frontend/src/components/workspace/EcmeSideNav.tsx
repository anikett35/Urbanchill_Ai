'use client';

import React from 'react';
import {
  Globe2,
  MapPin,
  Layers,
  Sliders,
  GitCompare,
  Clock,
  Sparkles,
  Cpu,
  FileDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Thermometer,
  Leaf,
  Building,
  AlertTriangle,
  Eye,
  EyeOff,
  BarChart3,
} from 'lucide-react';

export type WorkspaceView = 'map' | 'analytics' | 'simulation' | 'comparison' | 'mlops';

interface EcmeSideNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeLayers: Record<string, boolean>;
  onToggleLayer: (id: string) => void;
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onOpenVoiceAgent: () => void;
  onToggleTimeSlider: () => void;
  isTimeSliderActive: boolean;
  onExportPdf: () => void;
  onReturnToGlobe: () => void;
  dataQualityScore?: number;
  modelVersion?: string;
  cityName: string;
}

export default function EcmeSideNav({
  isCollapsed,
  onToggleCollapse,
  activeLayers,
  onToggleLayer,
  activeView,
  onSelectView,
  onOpenVoiceAgent,
  onToggleTimeSlider,
  isTimeSliderActive,
  onExportPdf,
  onReturnToGlobe,
  dataQualityScore = 95,
  modelVersion = 'urbanchill-rf-1.1',
  cityName,
}: EcmeSideNavProps) {
  return (
    <aside
      className={`
        side-nav side-nav-bg
        ${isCollapsed ? 'side-nav-collapse w-20' : 'side-nav-expand w-64'}
        transition-all duration-200 border-r border-gray-200 dark:border-gray-800
        flex flex-col justify-between select-none shrink-0
      `}
      aria-label="Ecme Theme Side Navigation"
    >
      {/* ── Brand Header (Height 64px matching Ecme Header) ─────────────── */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                <span>UrbanChill</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">AI</span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Geo-Intelligent Twin</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Scrollable Navigation Tree ────────────────────────────────────── */}
      <div
        className="side-nav-content no-scrollbar px-3 py-4 space-y-5 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Navigation Group 1: DIGITAL TWIN & GEOSPATIAL */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-1.5">
              Digital Twin & Map
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={onReturnToGlobe}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100 transition-colors cursor-pointer
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Return to 3D Globe"
            >
              <Globe2 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100 shrink-0 transition-colors" />
              {!isCollapsed && <span>3D Earth Globe</span>}
            </button>

            <button
              onClick={() => onSelectView('map')}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'map'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="3D City Map"
            >
              <MapPin className={`w-4 h-4 shrink-0 ${activeView === 'map' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{cityName} 3D Map</span>
                  {activeView === 'map' && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </div>
              )}
            </button>

            <button
              onClick={() => onSelectView('analytics')}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'analytics'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Urban Heat & Weather Analytics"
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${activeView === 'analytics' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Urban Analytics</span>
                  {activeView === 'analytics' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* GIS Layers Sub-section */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-1.5 flex items-center justify-between">
              <span>Map Overlays</span>
              <Layers className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )}
          <div className="space-y-1">
            {[
              { id: 'lst', label: 'Ground Surface Heat', icon: Thermometer },
              { id: 'ndvi', label: 'Greenery & Trees', icon: Leaf },
              { id: 'land_use', label: 'Buildings & Roads', icon: Building },
              { id: 'heat_risk', label: 'High Heat Risk Areas', icon: AlertTriangle },
            ].map((layer) => {
              const isOn = !!activeLayers[layer.id];
              const Icon = layer.icon;
              return (
                <button
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`
                    group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium
                    transition-colors cursor-pointer select-none
                    ${
                      isOn
                        ? 'text-gray-900 dark:text-gray-100 font-semibold bg-gray-100/70 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                        : 'text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={`${layer.label}: ${isOn ? 'Visible' : 'Hidden'}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isOn ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    {!isCollapsed && <span className="truncate">{layer.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-gray-400">
                      {isOn ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group 2: RESILIENCE PLANNING */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-1.5">
              Planning & Tools
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={() => onSelectView('simulation')}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'simulation'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Test cooling solutions like trees and reflective roofs"
            >
              <Sliders className={`w-4 h-4 shrink-0 ${activeView === 'simulation' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && <span>Cooling Simulator</span>}
            </button>

            <button
              onClick={() => onSelectView('comparison')}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'comparison'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Compare heat and greenery with other cities"
            >
              <GitCompare className={`w-4 h-4 shrink-0 ${activeView === 'comparison' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && <span>Compare Cities</span>}
            </button>

            <button
              onClick={() => {
                onSelectView('map');
                onToggleTimeSlider();
              }}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'map' && isTimeSliderActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Explore temperature records from 2018 to 2026"
            >
              <Clock className={`w-4 h-4 shrink-0 ${activeView === 'map' && isTimeSliderActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Yearly Trends</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">2018–26</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Group 3: INTELLIGENCE & AUDIT */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-1.5">
              Insights & Assistant
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={onOpenVoiceAgent}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100 transition-colors cursor-pointer
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Talk or chat with the AI climate assistant"
            >
              <Sparkles className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary shrink-0 transition-colors" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Voice Assistant</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">Bilingual</span>
                </div>
              )}
            </button>

            <button
              onClick={() => onSelectView('mlops')}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                transition-colors cursor-pointer
                ${
                  activeView === 'mlops'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="System reliability, data accuracy, and model status"
            >
              <Cpu className={`w-4 h-4 shrink-0 ${activeView === 'mlops' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
              {!isCollapsed && <span>AI Model Health</span>}
            </button>

            <button
              onClick={onExportPdf}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/60 dark:hover:text-gray-100 transition-colors cursor-pointer
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Download a clean PDF report with recommendations"
            >
              <FileDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary shrink-0 transition-colors" />
              {!isCollapsed && <span>Download PDF Report</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ── SideNav Footer Status (Ecme Style) ────────────────────────────── */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Data Reliability
              </span>
              <span className="font-bold text-primary">{dataQualityScore}%</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 text-[10px]">
              <span>System</span>
              <span className="font-medium text-gray-500 dark:text-gray-400">Production Ready</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Data Reliability: ${dataQualityScore}%`}>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </aside>
  );
}
