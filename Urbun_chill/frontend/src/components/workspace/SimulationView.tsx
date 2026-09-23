'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  TreePine,
  Sun,
  Droplets,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

import { simulateCooling, type SimulationResult } from '@/lib/apiClient';

interface SimulationViewProps {
  cityName: string;
  onReturnToMap: () => void;
  onApplySimulation?: (result: SimulationResult) => void;
}

export default function SimulationView({
  cityName,
  onReturnToMap,
  onApplySimulation,
}: SimulationViewProps) {
  const [treeCover, setTreeCover] = useState(15);
  const [coolRoofs, setCoolRoofs] = useState(30);
  const [urbanParks, setUrbanParks] = useState(2);
  const [waterBodies, setWaterBodies] = useState(5);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  // Trigger simulation run
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateCooling({
        city: cityName,
        interventions: {
          tree_canopy_cover_percent: treeCover,
          cool_roof_adoption_percent: coolRoofs,
          urban_parks_count: urbanParks,
          water_bodies_expansion_percent: waterBodies,
        },
      });
      setSimResult(res);
      setHasApplied(false);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run automatically on initial mount
  React.useEffect(() => {
    handleRunSimulation();
  }, [cityName]);

  const handleReset = () => {
    setTreeCover(15);
    setCoolRoofs(30);
    setUrbanParks(2);
    setWaterBodies(5);
    handleRunSimulation();
  };

  const handleApply = () => {
    if (simResult && onApplySimulation) {
      onApplySimulation(simResult);
      setHasApplied(true);
      setTimeout(() => setHasApplied(false), 3000);
    }
  };

  const applyPreset = (preset: { trees: number; roofs: number; parks: number; water: number }) => {
    setTreeCover(preset.trees);
    setCoolRoofs(preset.roofs);
    setUrbanParks(preset.parks);
    setWaterBodies(preset.water);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Breadcrumb & Page Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Digital Twin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{cityName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-primary font-bold">Resilience Planning</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              Urban Cooling Simulator
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Test how planting trees, painting reflective roofs, and adding parks can reduce summer heat across {cityName}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleReset}
              className="button button-default rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5"
              title="Reset sliders to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={onReturnToMap}
              className="button button-default rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5"
              title="Return to 3D Digital Twin Map"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to 3D Map
            </button>

            {simResult && (
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className="button button-solid rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
              >
                {hasApplied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {hasApplied ? 'Applied to 3D Map!' : 'Apply to 3D Map'}
              </button>
            )}
          </div>
        </div>

        {/* ── Quick Preset Chips ─────────────────────────────────────────── */}
        <div className="card card-border card-shadow p-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">
            Action Presets:
          </span>
          <button
            onClick={() => {
              applyPreset({ trees: 35, roofs: 15, parks: 5, water: 5 });
              setTimeout(handleRunSimulation, 50);
            }}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-750 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-medium transition-all"
          >
            🌿 Tree Planting (+35% Canopy)
          </button>
          <button
            onClick={() => {
              applyPreset({ trees: 10, roofs: 65, parks: 2, water: 0 });
              setTimeout(handleRunSimulation, 50);
            }}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-750 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-medium transition-all"
          >
            ☀️ White Roofs (65% Cool Roofs)
          </button>
          <button
            onClick={() => {
              applyPreset({ trees: 25, roofs: 40, parks: 6, water: 15 });
              setTimeout(handleRunSimulation, 50);
            }}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-750 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-medium transition-all"
          >
            💧 Green & Water (+15% Water, +6 Parks)
          </button>
          <button
            onClick={() => {
              applyPreset({ trees: 50, roofs: 80, parks: 10, water: 25 });
              setTimeout(handleRunSimulation, 50);
            }}
            className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold transition-all"
          >
            🚀 Maximum Cooling Plan (All Combined)
          </button>
        </div>

        {/* ── 2-Column Responsive Dashboard Layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Intervention Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card card-border card-shadow p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cooling Solutions
                </span>
                <span className="text-[11px] font-mono text-primary font-semibold">Adjust Levels</span>
              </div>

              {/* Tree Plantation Slider */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <TreePine className="w-4 h-4 text-primary" /> Tree Canopy & Shaded Streets
                  </span>
                  <span className="font-mono text-primary font-bold text-sm">+{treeCover}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={treeCover}
                  onChange={(e) => setTreeCover(parseInt(e.target.value))}
                  onMouseUp={handleRunSimulation}
                  onTouchEnd={handleRunSimulation}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Tree Canopy expansion percentage"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Trees provide natural shade and cool surrounding air.
                </p>
              </div>

              {/* Cool Reflective Roofs Slider */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Sun className="w-4 h-4 text-primary" /> Reflective White Roofs
                  </span>
                  <span className="font-mono text-primary font-bold text-sm">{coolRoofs}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={coolRoofs}
                  onChange={(e) => setCoolRoofs(parseInt(e.target.value))}
                  onMouseUp={handleRunSimulation}
                  onTouchEnd={handleRunSimulation}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Cool roofs adoption percentage"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Reflective coating stops roofs and buildings from trapping summer sun.
                </p>
              </div>

              {/* Urban Parks Grid Slider */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Layers className="w-4 h-4 text-primary" /> Neighborhood Parks Added
                  </span>
                  <span className="font-mono text-primary font-bold text-sm">+{urbanParks} parks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={urbanParks}
                  onChange={(e) => setUrbanParks(parseInt(e.target.value))}
                  onMouseUp={handleRunSimulation}
                  onTouchEnd={handleRunSimulation}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Number of urban parks added"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Neighborhood green spaces break up hot concrete blocks.
                </p>
              </div>

              {/* Water Bodies Expansion */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Droplets className="w-4 h-4 text-primary" /> Ponds & Water Bodies
                  </span>
                  <span className="font-mono text-primary font-bold text-sm">+{waterBodies}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={waterBodies}
                  onChange={(e) => setWaterBodies(parseInt(e.target.value))}
                  onMouseUp={handleRunSimulation}
                  onTouchEnd={handleRunSimulation}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label="Surface water expansion percentage"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Ponds and water bodies cool passing breezes.
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="button button-solid w-full py-3 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSimulating ? 'Calculating Cooling…' : 'Calculate Cooling Impact'}
              </button>
            </div>
          </div>

          {/* Column 2: Simulation Outcomes (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {isSimulating && !simResult ? (
              <div className="card card-border card-shadow p-12 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                Calculating cooling impact for {cityName}…
              </div>
            ) : simResult ? (
              <>
                {/* Projected Cooling Impact Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card card-border card-shadow p-5 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Projected City Cooling Impact
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      -{simResult.cooling_breakdown.total_lst_reduction_deg_c}°C Cooler
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Scientific cooling models show how combined greenery, reflective roofs, and water bodies lower neighborhood temperatures safely and realistically.
                  </p>

                  {/* Before vs After KPI Cards */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                        Ground Temperature
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1.5 font-mono">
                        <span>{simResult.before_vs_after.lst.before}°C</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="text-primary font-bold">{simResult.before_vs_after.lst.after}°C</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                        Greenery Index
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1.5 font-mono">
                        <span>{simResult.before_vs_after.ndvi.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="text-primary font-bold">{simResult.before_vs_after.ndvi.after}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                        Heat Risk Level
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center justify-center gap-1.5">
                        <span>{simResult.before_vs_after.heat_risk.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="text-primary font-bold">{simResult.before_vs_after.heat_risk.after}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Multi-Scenario Comparative Evaluation Suite */}
                {simResult.scenarios && simResult.scenarios.length > 0 && (
                  <div className="card card-border card-shadow p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Compare City Planning Scenarios
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">4 Action Plans</span>
                    </div>

                    <div className="space-y-2">
                      {simResult.scenarios.map((sc) => (
                        <div
                          key={sc.id}
                          className={`flex items-center justify-between p-3 rounded-xl text-xs border transition-colors ${
                            sc.id === 'scenario_custom'
                              ? 'bg-primary/10 border-primary/30 font-semibold text-primary'
                              : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5">
                              {sc.name}
                              {sc.id === 'scenario_custom' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary text-white font-mono">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{sc.description}</div>
                          </div>
                          <div className="text-right font-mono shrink-0 ml-3">
                            <span className="text-primary font-bold block text-sm">
                              -{sc.total_reduction_c}°C
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Risk: {sc.heat_risk_after}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physics Mechanism Breakdown */}
                <div className="card card-border card-shadow p-5 space-y-3">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                    Temperature Drop by Solution Type
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Tree Shade</span>
                      <span className="text-sm font-mono font-bold text-primary">
                        -{simResult.cooling_breakdown.from_tree_canopy_deg_c.toFixed(2)}°C
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Reflective Roofs</span>
                      <span className="text-sm font-mono font-bold text-primary">
                        -{simResult.cooling_breakdown.from_cool_roofs_deg_c.toFixed(2)}°C
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Parks & Gardens</span>
                      <span className="text-sm font-mono font-bold text-primary">
                        -{simResult.cooling_breakdown.from_parks_deg_c.toFixed(2)}°C
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Ponds & Water</span>
                      <span className="text-sm font-mono font-bold text-primary">
                        -{simResult.cooling_breakdown.from_water_deg_c.toFixed(2)}°C
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
