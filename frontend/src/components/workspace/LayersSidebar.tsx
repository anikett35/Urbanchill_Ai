'use client';

import { motion } from 'framer-motion';
import {
  Layers, Eye, EyeOff, Thermometer, Leaf, AlertTriangle,
  Building, ToggleLeft, Sliders, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface LayerItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  defaultOn: boolean;
}

const LAYERS: LayerItem[] = [
  {
    id: 'lst',
    label: 'Land Surface Temperature',
    icon: <Thermometer className="w-4 h-4" />,
    color: '#ef4444',
    description: 'Thermal infrared from Landsat-8 / Sentinel-3',
    defaultOn: true,
  },
  {
    id: 'ndvi',
    label: 'Vegetation Index (NDVI)',
    icon: <Leaf className="w-4 h-4" />,
    color: '#22c55e',
    description: 'Green-cover density — Google Earth Engine',
    defaultOn: true,
  },
  {
    id: 'heat_risk',
    label: 'ML Heat-Risk Zones',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: '#f97316',
    description: 'Random Forest predictions per spatial zone',
    defaultOn: false,
  },
  {
    id: 'land_use',
    label: 'Land-Use / Zoning',
    icon: <Building className="w-4 h-4" />,
    color: '#6366f1',
    description: 'Urban zoning classification overlay',
    defaultOn: false,
  },
];

function SkeletonBlock({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return (
    <div className={`${w} ${h} rounded bg-white/5 animate-pulse`} />
  );
}

interface LayersSidebarProps {
  isLoading: boolean;
  city: string;
}

export default function LayersSidebar({ isLoading, city }: LayersSidebarProps) {
  const [layerStates, setLayerStates] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOn]))
  );
  const [opacities, setOpacities] = useState<Record<string, number>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, 80]))
  );

  const toggleLayer = (id: string) =>
    setLayerStates((s) => ({ ...s, [id]: !s[id] }));
  const setOpacity = (id: string, val: number) =>
    setOpacities((s) => ({ ...s, [id]: val }));

  return (
    <motion.aside
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.38, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="
        fixed left-0 top-14 bottom-0 z-30
        w-72 xl:w-80
        bg-slate-950/92 backdrop-blur-2xl
        border-r border-white/10
        flex flex-col
        overflow-hidden
        shadow-2xl shadow-black/80
      "
      aria-label="Map layers"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/8 bg-white/2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-xs uppercase tracking-wider">Map Layers</div>
          <div className="text-slate-400 text-[11px]">Spectral & Zoning Overlays</div>
        </div>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/5 p-3.5 space-y-2">
                <SkeletonBlock h="h-3" w="w-3/4" />
                <SkeletonBlock h="h-2" w="w-1/2" />
                <SkeletonBlock h="h-1.5" w="w-full" />
              </div>
            ))
          : LAYERS.map((layer) => {
              const on = layerStates[layer.id];
              const opacity = opacities[layer.id];
              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    rounded-xl border p-3.5 transition-all duration-200
                    ${on
                      ? 'border-white/10 bg-white/3'
                      : 'border-white/4 bg-transparent opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ color: layer.color }}>{layer.icon}</span>
                      <span className="text-white text-xs font-semibold">
                        {layer.label}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      aria-label={`${on ? 'Hide' : 'Show'} ${layer.label}`}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {on ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-slate-500 text-[11px] mb-3 leading-relaxed">
                    {layer.description}
                  </p>

                  {on && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">
                          Opacity
                        </span>
                        <span className="text-slate-400 text-[10px]">{opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={opacity}
                        onChange={(e) => setOpacity(layer.id, parseInt(e.target.value))}
                        className="w-full h-1 appearance-none rounded-full cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${layer.color} ${opacity}%, rgba(255,255,255,0.1) ${opacity}%)`,
                        }}
                        aria-label={`${layer.label} opacity`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
      </div>

      {/* Footer controls */}
      <div className="px-4 py-4 border-t border-white/6">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/4 hover:bg-white/8 border border-white/6 text-slate-300 text-xs font-medium transition-colors">
          <Sliders className="w-3.5 h-3.5" />
          Advanced Layer Settings
          <ChevronDown className="w-3 h-3 ml-auto" />
        </button>
      </div>
    </motion.aside>
  );
}
