'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  X,
  Thermometer,
  Leaf,
  Building,
  AlertTriangle,
  Flame,
  CheckCircle,
  TrendingUp,
  Info,
  Layers,
  Sparkles,
  Droplets,
} from 'lucide-react';

import type { CityResult, AppState, HeatRisk } from '@/lib/globeConfig';

interface InteractiveMapViewerProps {
  city: CityResult;
  appState: AppState;
  activeLayers: Record<string, boolean>;
  layerOpacities: Record<string, number>;
  selectedYear?: number;
}

interface UrbanSector {
  id: string;
  name: string;
  category: string;
  baseTemp: number;
  ndvi: number;
  buildingDensity: number;
  greenCover: number;
  populationDensity: number;
  risk: HeatRisk;
  path: string; // SVG path definition
  center: [number, number]; // x, y on 800x600 canvas
  primaryFactors: string[];
}

const RISK_THEME: Record<HeatRisk, { text: string; badge: string; border: string; glow: string }> = {
  Low: {
    text: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border: 'border-emerald-500/50',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  Moderate: {
    text: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    border: 'border-amber-500/50',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  High: {
    text: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    border: 'border-orange-500/50',
    glow: 'rgba(251, 115, 44, 0.5)',
  },
  Critical: {
    text: 'text-red-500 dark:text-red-400',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    border: 'border-red-500/50',
    glow: 'rgba(239, 68, 68, 0.6)',
  },
};

export default function InteractiveMapViewer({
  city,
  appState,
  activeLayers,
  layerOpacities,
  selectedYear = 2026,
}: InteractiveMapViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);

  // Year anomaly relative to 2026 (0.3°C increase per year)
  const yearDelta = (selectedYear - 2026) * 0.32;

  // Realistic city sectors mapped on an 800 x 540 digital twin canvas
  const sectors: UrbanSector[] = useMemo(() => {
    const isPune = city.name.toLowerCase().includes('pune');
    const isMumbai = city.name.toLowerCase().includes('mumbai');
    const isDelhi = city.name.toLowerCase().includes('delhi');

    const baseCityLST = isDelhi ? 41.5 : isMumbai ? 38.2 : 36.5;

    return [
      {
        id: 'sector_central',
        name: isPune ? 'Shivajinagar Central Core' : isMumbai ? 'BKC Commercial Hub' : 'Connaught Place Core',
        category: 'Commercial & High-Density Mixed',
        baseTemp: baseCityLST + 2.1,
        ndvi: 0.18,
        buildingDensity: 0.78,
        greenCover: 0.14,
        populationDensity: 19500,
        risk: 'High',
        path: 'M 320,180 L 480,170 L 510,290 L 340,310 Z',
        center: [415, 235],
        primaryFactors: [
          'High thermal absorption from asphalt & concrete mass',
          'Deep street canyon with trapped longwave radiation',
          'Deficit in permeable vegetative surfaces (NDVI 0.18)',
        ],
      },
      {
        id: 'sector_industrial',
        name: isPune ? 'Hadapsar Industrial Corridor' : isMumbai ? 'Dharavi Industrial Zone' : 'Okhla Industrial Area',
        category: 'Manufacturing & Heavy Built-up',
        baseTemp: baseCityLST + 4.6,
        ndvi: 0.11,
        buildingDensity: 0.88,
        greenCover: 0.08,
        populationDensity: 24000,
        risk: 'Critical',
        path: 'M 500,165 L 680,180 L 690,320 L 520,305 Z',
        center: [600, 240],
        primaryFactors: [
          'Acute industrial waste heat & metal roof radiation',
          'Extremely low vegetative canopy (NDVI 0.11)',
          'High impervious surface fraction (>85%)',
        ],
      },
      {
        id: 'sector_residential_west',
        name: isPune ? 'Kothrud Residential Corridor' : isMumbai ? 'Bandra Residential West' : 'South Delhi Residential',
        category: 'Residential Medium-Density',
        baseTemp: baseCityLST - 1.2,
        ndvi: 0.36,
        buildingDensity: 0.54,
        greenCover: 0.32,
        populationDensity: 12000,
        risk: 'Moderate',
        path: 'M 140,210 L 310,195 L 330,335 L 160,350 Z',
        center: [230, 270],
        primaryFactors: [
          'Street tree canopy providing partial shading',
          'Moderate roof albedo and residential setbacks',
          'Adequate micro-climatic ventilation',
        ],
      },
      {
        id: 'sector_tech_north',
        name: isPune ? 'Viman Nagar Tech Park' : isMumbai ? 'Powai Tech Corridor' : 'Noida Cyber Zone',
        category: 'Tech Campus & Commercial Hub',
        baseTemp: baseCityLST + 1.6,
        ndvi: 0.24,
        buildingDensity: 0.65,
        greenCover: 0.22,
        populationDensity: 14500,
        risk: 'High',
        path: 'M 350,60 L 560,50 L 530,165 L 335,175 Z',
        center: [445, 115],
        primaryFactors: [
          'Extensive glass facades and HVAC thermal discharge',
          'Surface parking lots creating heat sinks',
          'Moderate green buffers around IT buildings',
        ],
      },
      {
        id: 'sector_green_reserve',
        name: isPune ? 'ARAI Hills Ecological Reserve' : isMumbai ? 'Sanjay Gandhi Forest Reserve' : 'Delhi Ridge Forest',
        category: 'Protected Natural Forest & Hills',
        baseTemp: baseCityLST - 4.8,
        ndvi: 0.68,
        buildingDensity: 0.08,
        greenCover: 0.74,
        populationDensity: 900,
        risk: 'Low',
        path: 'M 120,360 L 290,345 L 260,490 L 90,470 Z',
        center: [190, 420],
        primaryFactors: [
          'Dense continuous tree canopy providing evapotranspiration',
          'Minimal impervious pavement (<10%)',
          'Cool island buffer reducing regional ambient temperatures',
        ],
      },
      {
        id: 'sector_river_basin',
        name: isPune ? 'Mula-Mutha Riverfront Buffer' : isMumbai ? 'Mithi River Basin' : 'Yamuna Riverfront',
        category: 'Riparian Wetland & Basin',
        baseTemp: baseCityLST - 3.2,
        ndvi: 0.44,
        buildingDensity: 0.28,
        greenCover: 0.42,
        populationDensity: 4200,
        risk: 'Low',
        path: 'M 320,320 L 520,310 L 490,460 L 280,470 Z',
        center: [400, 390],
        primaryFactors: [
          'Surface water thermal buffering and breeze generation',
          'Riparian wetland vegetation',
          'Natural cooling corridor through urban core',
        ],
      },
    ];
  }, [city.name]);

  const activeSector = sectors.find((s) => s.id === activeSectorId) || null;

  const lstOpacity = (layerOpacities['lst'] ?? 80) / 100;
  const ndviOpacity = (layerOpacities['ndvi'] ?? 80) / 100;
  const riskOpacity = (layerOpacities['heat_risk'] ?? 80) / 100;

  return (
    <div
      className="
        fixed
        left-0 sm:left-72 xl:left-80
        right-0 sm:right-72 xl:right-80
        top-16 bottom-0
        z-10
        overflow-hidden
        bg-gray-950
      "
      aria-label="Interactive 3D Digital Twin Map Viewport"
    >
      {/* Subtle Background Topographical Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Digital Twin SVG Canvas */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          animate={{ scale: zoomLevel }}
          transition={{ type: 'spring', stiffness: 220, damping: 25 }}
          className="relative w-full max-w-[840px] aspect-[4/3] rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden"
        >
          <svg
            viewBox="0 0 800 540"
            className="w-full h-full select-none"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
          >
            <defs>
              {/* Thermal Gradient Isotherms */}
              <radialGradient id="thermal_hotspot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#fb732c" stopOpacity="0.65" />
                <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cool_island" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Road Pattern */}
              <pattern id="road_mesh" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0,10 L 20,10 M 10,0 L 10,20" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base Canvas Ground */}
            <rect width="800" height="540" fill="#0f172a" />

            {/* Natural River / Water Buffer Line */}
            <path
              d="M 50,290 C 200,280 280,350 420,330 C 560,310 650,420 780,410"
              fill="none"
              stroke="#0284c7"
              strokeWidth="24"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 50,290 C 200,280 280,350 420,330 C 560,310 650,420 780,410"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Arterial Road Network Overlay */}
            {activeLayers['land_use'] && (
              <g stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeDasharray="6,4" fill="none">
                <path d="M 120,60 L 415,235 L 680,480" />
                <path d="M 700,80 L 415,235 L 120,460" />
                <circle cx="415" cy="235" r="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              </g>
            )}

            {/* Urban Sector Polygons */}
            {sectors.map((sector) => {
              const isSelected = activeSectorId === sector.id;
              const isHovered = hoveredSectorId === sector.id;
              const displayTemp = Number((sector.baseTemp + yearDelta).toFixed(1));

              // Fill based on active layer
              let sectorFill = '#1e293b';
              if (activeLayers['lst']) {
                sectorFill =
                  sector.risk === 'Critical'
                    ? '#7f1d1d'
                    : sector.risk === 'High'
                    ? '#7c2d12'
                    : sector.risk === 'Moderate'
                    ? '#78350f'
                    : '#064e3b';
              } else if (activeLayers['ndvi']) {
                sectorFill = sector.ndvi > 0.4 ? '#065f46' : '#1e293b';
              }

              return (
                <g key={sector.id}>
                  {/* Sector Base Polygon */}
                  <path
                    d={sector.path}
                    fill={sectorFill}
                    fillOpacity={activeLayers['lst'] ? lstOpacity : 0.8}
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : isHovered
                        ? '#fb732c'
                        : activeLayers['heat_risk']
                        ? RISK_THEME[sector.risk].glow
                        : 'rgba(255,255,255,0.15)'
                    }
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredSectorId(sector.id)}
                    onMouseLeave={() => setHoveredSectorId(null)}
                    onClick={() => setActiveSectorId(sector.id)}
                  />

                  {/* Thermal Hotspot Plume Radial Glow */}
                  {activeLayers['lst'] && (sector.risk === 'High' || sector.risk === 'Critical') && (
                    <circle
                      cx={sector.center[0]}
                      cy={sector.center[1]}
                      r={sector.risk === 'Critical' ? 90 : 65}
                      fill="url(#thermal_hotspot)"
                      opacity={lstOpacity * 0.75}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Vegetative Cooling Glow */}
                  {activeLayers['ndvi'] && sector.risk === 'Low' && (
                    <circle
                      cx={sector.center[0]}
                      cy={sector.center[1]}
                      r={70}
                      fill="url(#cool_island)"
                      opacity={ndviOpacity * 0.8}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Hotspot Label & Pin Badge */}
                  <g
                    transform={`translate(${sector.center[0]}, ${sector.center[1]})`}
                    className="cursor-pointer pointer-events-none"
                  >
                    {/* Pulsing indicator for High / Critical zones */}
                    {(sector.risk === 'Critical' || sector.risk === 'High') && (
                      <circle
                        r="18"
                        fill={sector.risk === 'Critical' ? '#ef4444' : '#fb732c'}
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    {/* Sector Card Badge Pill */}
                    <rect
                      x="-55"
                      y="-18"
                      width="110"
                      height="36"
                      rx="18"
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1.2"
                    />

                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      {displayTemp}°C
                    </text>

                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill={
                        sector.risk === 'Critical'
                          ? '#f87171'
                          : sector.risk === 'High'
                          ? '#fb923c'
                          : sector.risk === 'Moderate'
                          ? '#fbbf24'
                          : '#34d399'
                      }
                      fontSize="8"
                      fontWeight="600"
                      letterSpacing="0.5"
                    >
                      {sector.risk.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Top Left City & Year Status Tag */}
          <div className="absolute top-4 left-5 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-gray-100 uppercase tracking-wider">
              {city.name} Digital Twin Model • {selectedYear}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
              High-Resolution Topography
            </span>
          </div>

          {/* Bottom Left Continuous LST Heat Gradient Scale */}
          <div className="absolute bottom-4 left-5 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl px-4 py-2.5 shadow-lg flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
              <span>Calibrated Thermal Scale (LST)</span>
              <span className="text-gray-200 font-bold">28°C — 44°C</span>
            </div>
            <div className="w-56 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 shadow-inner" />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
              <span>Cool Canopy</span>
              <span>Moderate</span>
              <span>Thermal Hotspot</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Map Navigation HUD Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-30 pointer-events-auto">
        {[
          { Icon: ZoomIn, label: 'Zoom In', action: () => setZoomLevel((z) => Math.min(1.4, z + 0.1)) },
          { Icon: ZoomOut, label: 'Zoom Out', action: () => setZoomLevel((z) => Math.max(0.7, z - 0.1)) },
          { Icon: Compass, label: 'Reset Bearing', action: () => setZoomLevel(1) },
          { Icon: Maximize2, label: 'Fit to City View', action: () => setZoomLevel(1) },
        ].map(({ Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            title={label}
            className="
              w-9 h-9 rounded-xl
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              flex items-center justify-center
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              shadow-md transition-colors
            "
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Interactive Click-to-Inspect HUD Modal Card */}
      <AnimatePresence>
        {activeSector && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              absolute left-6 top-6 z-30
              w-84 rounded-3xl
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              p-5 shadow-2xl
              pointer-events-auto
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {activeSector.name}
                  </h3>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {activeSector.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSectorId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Badge */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border mb-3 ${RISK_THEME[activeSector.risk].badge}`}>
              <span className="text-xs font-semibold">Vulnerability Classification</span>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                {activeSector.risk === 'Critical' ? <Flame className="w-3.5 h-3.5 text-red-500" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {activeSector.risk} Risk
              </span>
            </div>

            {/* 4 Telemetry Indicator Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">LST Temperature</span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
                  {(activeSector.baseTemp + yearDelta).toFixed(1)}°C
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">Vegetation (NDVI)</span>
                <span className="text-base font-bold text-emerald-500 dark:text-emerald-400 font-mono">
                  {activeSector.ndvi.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">Built-up Mass</span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
                  {Math.round(activeSector.buildingDensity * 100)}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">Green Canopy</span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
                  {Math.round(activeSector.greenCover * 100)}%
                </span>
              </div>
            </div>

            {/* Primary Factors */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-primary" /> Key Contributing Drivers
              </span>
              <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                {activeSector.primaryFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-primary font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
