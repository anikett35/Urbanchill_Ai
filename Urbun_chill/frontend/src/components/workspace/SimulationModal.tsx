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
      <div className="dialog-overlay p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="
            dialog-content relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
            rounded-2xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-750
            p-5 sm:p-6 shadow-2xl
            flex flex-col gap-5 text-gray-900 dark:text-gray-100
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-750 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  What-If Cooling Strategy Simulator
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary font-bold">
                    {cityName}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Model urban cooling interventions with non-linear diminishing returns
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              aria-label="Close simulation modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Intervention Sliders */}
          <div className="space-y-3.5">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              1. Adjust Mitigation Interventions
            </div>

            {/* Tree Plantation */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <TreePine className="w-4 h-4 text-primary" /> Tree Canopy Expansion
                </span>
                <span className="font-mono text-primary font-bold">+{treeCover}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={treeCover}
                onChange={(e) => setTreeCover(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="Tree Canopy expansion percentage"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Vegetative street canopy reduces sensible heat via active evapotranspiration
              </p>
            </div>

            {/* Cool Reflective Roofs */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Sun className="w-4 h-4 text-primary" /> High-Albedo Cool Roofs
                </span>
                <span className="font-mono text-primary font-bold">{coolRoofs}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={coolRoofs}
                onChange={(e) => setCoolRoofs(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="Cool roofs adoption percentage"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Solar reflectance &gt;0.65 prevents solar thermal absorption in commercial zones
              </p>
            </div>

            {/* Urban Parks & Water Bodies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
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
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Number of urban parks added"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                    <Droplets className="w-3.5 h-3.5 text-primary" /> Water Expansion
                  </span>
                  <span className="font-mono text-primary font-bold">+{waterBodies}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={waterBodies}
                  onChange={(e) => setWaterBodies(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Water bodies expansion percentage"
                />
              </div>
            </div>
          </div>

          {/* Recalculated Outcomes */}
          {simResult && (
            <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Projected Cooling Impact
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-primary">
                  <TrendingDown className="w-4 h-4" />
                  -{simResult.cooling_breakdown.total_lst_reduction_deg_c}°C Reduction
                </span>
              </div>

              {/* Before vs After Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Surface Temp</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.lst.before}°C</span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                    <span className="text-primary font-bold">{simResult.before_vs_after.lst.after}°C</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Vegetation</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.ndvi.before}</span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                    <span className="text-primary font-bold">{simResult.before_vs_after.ndvi.after}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Heat Risk</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1">
                    <span>{simResult.before_vs_after.heat_risk.before}</span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                    <span className="text-primary font-bold">{simResult.before_vs_after.heat_risk.after}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Scenario Suite Comparison Table */}
              {simResult.scenarios && simResult.scenarios.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/20 dark:border-primary/20">
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Comparative Scenario Evaluation (Bounded / Non-linear)
                  </div>
                  <div className="space-y-1.5">
                    {simResult.scenarios.map((sc) => (
                      <div
                        key={sc.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                          sc.id === 'scenario_custom'
                            ? 'bg-primary/10 border-primary/30 font-semibold text-primary'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex-1 truncate pr-2">
                          <span className="font-bold">{sc.name}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">{sc.description}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{sc.total_reduction_c}°C</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            {sc.heat_risk_after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                {simResult.summary}
              </p>

              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-tight">
                ⚠ Modelled estimate — not a guaranteed real-world temperature change. Uses non-linear asymptotic saturation curves to prevent physically unrealistic linear compounding.
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-750">
            <button
              onClick={handleReset}
              className="button button-plain text-xs flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Interventions
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="button button-default rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
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
                className="button button-solid rounded-xl px-4 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
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
