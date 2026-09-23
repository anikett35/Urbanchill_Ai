'use client';

import { motion } from 'framer-motion';
import { Layers, Eye, EyeOff, Thermometer, Leaf, AlertTriangle, Building, Sliders, ChevronDown } from 'lucide-react';
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
  { id: 'lst', label: 'Estimated Surface Skin Temperature', icon: <Thermometer className="w-4 h-4" />, color: '#2a85ff', description: 'Reanalysis + UHI thermal proxy model', defaultOn: true },
  { id: 'ndvi', label: 'Vegetation Index Proxy (NDVI)', icon: <Leaf className="w-4 h-4" />, color: '#2a85ff', description: 'Estimated canopy density proxy from urban morphology', defaultOn: true },
  { id: 'heat_risk', label: 'ML Heat-Risk Zones', icon: <AlertTriangle className="w-4 h-4" />, color: '#2a85ff', description: 'Random Forest surrogate predictions per spatial model sector', defaultOn: true },
  { id: 'land_use', label: 'Urban Morphology & Buildings', icon: <Building className="w-4 h-4" />, color: '#2a85ff', description: 'Building footprints & road density massing', defaultOn: false },
];

function SkeletonBlock({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-gray-200 dark:bg-gray-700 animate-pulse`} />;
}

interface LayersSidebarProps {
  isLoading: boolean;
  city: string;
  layerStates?: Record<string, boolean>;
  onToggleLayer?: (id: string) => void;
  opacities?: Record<string, number>;
  onSetOpacity?: (id: string, val: number) => void;
}

export default function LayersSidebar({
  isLoading,
  city,
  layerStates: extStates,
  onToggleLayer: extToggle,
  opacities: extOpacities,
  onSetOpacity: extSetOpacity,
}: LayersSidebarProps) {
  const [localStates, setLocalStates] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOn]))
  );
  const [localOpacities, setLocalOpacities] = useState<Record<string, number>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, 80]))
  );

  const states = extStates || localStates;
  const opacities = extOpacities || localOpacities;

  const toggleLayer = (id: string) => {
    if (extToggle) {
      extToggle(id);
    } else {
      setLocalStates((s) => ({ ...s, [id]: !s[id] }));
    }
  };

  const setOpacity = (id: string, val: number) => {
    if (extSetOpacity) {
      extSetOpacity(id, val);
    } else {
      setLocalOpacities((s) => ({ ...s, [id]: val }));
    }
  };

  return (
    <motion.aside
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.38, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-16 bottom-0 z-30 w-72 xl:w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-2xl text-gray-900 dark:text-gray-100"
      aria-label="Map layers"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-gray-900 dark:text-gray-100 font-bold text-xs uppercase tracking-wider">Map Layers</div>
          <div className="text-gray-500 dark:text-gray-400 text-[11px]">Spatial Model & Proxy Overlays</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card card-border card-shadow p-4 space-y-2">
                <SkeletonBlock h="h-3" w="w-3/4" />
                <SkeletonBlock h="h-2" w="w-1/2" />
                <SkeletonBlock h="h-1.5" w="w-full" />
              </div>
            ))
          : LAYERS.map((layer) => {
              const on = states[layer.id];
              const opacity = opacities[layer.id] ?? 80;
              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    on
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-750 shadow-xs'
                      : 'border-gray-200/50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/40 opacity-55'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{layer.icon}</span>
                      <span className="text-gray-900 dark:text-gray-100 text-xs font-semibold">{layer.label}</span>
                    </div>
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      aria-label={`${on ? 'Hide' : 'Show'} ${layer.label}`}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {on ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3 leading-relaxed">{layer.description}</p>
                  {on && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700/80">
                      <div className="flex items-center justify-between mb-1 mt-1">
                        <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-semibold tracking-wider">Opacity</span>
                        <span className="text-primary font-mono text-[10px] font-bold">{opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={opacity}
                        onChange={(e) => setOpacity(layer.id, parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-primary"
                        aria-label={`${layer.label} opacity`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
      </div>

      <div className="px-5 py-3.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Active GIS Synchronized</span>
        </div>
      </div>
    </motion.aside>
  );
}
