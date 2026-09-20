'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  TreePine,
  Sun,
  Droplets,
  Layers,
  Sparkles,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

import { runCoolingSimulation, SimulationResult } from '@/lib/apiClient';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onApplySimulation?: (result: SimulationResult) => void;
}

export default function SimulationModal({
  isOpen,
  onClose,
  cityName,
  onApplySimulation,
}: SimulationModalProps) {
  const [treeCover, setTreeCover] = useState(25);
  const [coolRoofs, setCoolRoofs] = useState(45);
  const [urbanParks, setUrbanParks] = useState(3);
  const [waterBodies, setWaterBodies] = useState(6);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsCalculating(true);
    const timer = setTimeout(() => {
      runCoolingSimulation(cityName, treeCover, coolRoofs, urbanParks, waterBodies)
        .then((res) => setSimResult(res))
        .finally(() => setIsCalculating(false));
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen, cityName, treeCover, coolRoofs, urbanParks, waterBodies]);

  const handleReset = () => {
    setTreeCover(0);
    setCoolRoofs(0);
    setUrbanParks(0);
    setWaterBodies(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="
            relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
            rounded-3xl bg-gray-900 border border-gray-700
            p-5 sm:p-7 shadow-2xl shadow-black
            flex flex-col gap-5
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  What-If Cooling Strategy Simulator
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/20 text-primary font-semibold">
                    {cityName}
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Model proposed urban cooling interventions and observe projected heat mitigation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition-colors"
              aria-label="Close simulation modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Intervention Sliders */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              1. Adjust Mitigation Interventions
            </div>

            {/* Tree Plantation */}
            <div className="p-3.5 rounded-2xl bg-gray-800/80 border border-gray-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-2 text-gray-200">
                  <TreePine className="w-4 h-4 text-emerald-400" /> Tree Canopy Expansion
                </span>
                <span className="font-mono text-emerald-400 font-bold">+{treeCover}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={treeCover}
                onChange={(e) => setTreeCover(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-400"
                aria-label="Tree Canopy expansion percentage"
              />
              <p className="text-[11px] text-gray-400">
                Vegetative street canopy reduces sensible heat via active evapotranspiration
              </p>
            </div>

            {/* Cool Reflective Roofs */}
            <div className="p-3.5 rounded-2xl bg-gray-800/80 border border-gray-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-2 text-gray-200">
                  <Sun className="w-4 h-4 text-amber-400" /> High-Albedo Cool Roofs
                </span>
                <span className="font-mono text-amber-400 font-bold">{coolRoofs}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={coolRoofs}
                onChange={(e) => setCoolRoofs(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-400"
                aria-label="Cool roofs adoption percentage"
              />
              <p className="text-[11px] text-gray-400">
                Solar reflectance &gt;0.65 prevents solar thermal absorption in commercial zones
              </p>
            </div>

            {/* Urban Parks & Water Bodies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-800/80 border border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-gray-200">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Urban Parks
                  </span>
                  <span className="font-mono text-primary font-bold">+{urbanParks} parks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={urbanParks}
                  onChange={(e) => setUrbanParks(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Number of urban parks added"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-800/80 border border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-gray-200">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" /> Water Expansion
                  </span>
                  <span className="font-mono text-sky-400 font-bold">+{waterBodies}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={waterBodies}
                  onChange={(e) => setWaterBodies(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-sky-400"
                  aria-label="Water bodies expansion percentage"
                />
              </div>
            </div>
          </div>

          {/* Recalculated Outcomes */}
          {simResult && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Projected Cooling Impact
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                  <TrendingDown className="w-4 h-4" />
                  -{simResult.cooling_breakdown.total_lst_reduction_deg_c}°C Reduction
                </span>
              </div>

              {/* Before vs After Cards */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800">
                  <div className="text-[10px] text-gray-400 uppercase">LST Temp</div>
                  <div className="text-sm font-bold text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.lst.before}°C</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{simResult.before_vs_after.lst.after}°C</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800">
                  <div className="text-[10px] text-gray-400 uppercase">NDVI Index</div>
                  <div className="text-sm font-bold text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.ndvi.before}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{simResult.before_vs_after.ndvi.after}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800">
                  <div className="text-[10px] text-gray-400 uppercase">Heat Risk</div>
                  <div className="text-sm font-bold text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.heat_risk.before}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{simResult.before_vs_after.heat_risk.after}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                {simResult.summary}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Interventions
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (simResult && onApplySimulation) {
                    onApplySimulation(simResult);
                  }
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold shadow-md shadow-primary/30 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Apply to Digital Twin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
