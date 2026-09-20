'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GitCompare,
  ArrowRight,
  Thermometer,
  Leaf,
  Building,
  Users,
  Flame,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { compareTwoCities, ComparisonResult } from '@/lib/apiClient';
import type { HeatRisk } from '@/lib/globeConfig';

interface CityComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityName: string;
}

const COMPARISON_CITIES = ['Pune', 'Mumbai', 'Hyderabad', 'Delhi', 'Bangalore'];

const RISK_BADGES: Record<HeatRisk, { color: string; bg: string; icon: React.ReactNode }> = {
  Low: { color: '#10b981', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> },
  Moderate: { color: '#f59e0b', bg: 'bg-amber-500/15 border-amber-500/30', icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> },
  High: { color: '#fb732c', bg: 'bg-orange-500/15 border-orange-500/30', icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> },
  Critical: { color: '#ef4444', bg: 'bg-red-500/15 border-red-500/30', icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
};

export default function CityComparisonModal({
  isOpen,
  onClose,
  currentCityName,
}: CityComparisonModalProps) {
  const [cityA, setCityA] = useState(currentCityName);
  const [cityB, setCityB] = useState(currentCityName.toLowerCase() === 'pune' ? 'Hyderabad' : 'Pune');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    compareTwoCities(cityA, cityB)
      .then((res) => setComparison(res))
      .finally(() => setIsLoading(false));
  }, [isOpen, cityA, cityB]);

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
            relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
            rounded-3xl bg-gray-900 border border-gray-700
            p-5 sm:p-7 shadow-2xl shadow-black
            flex flex-col gap-5
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-100">
                  Comparative Urban Heat Analysis
                </h2>
                <p className="text-xs text-gray-400">
                  Side-by-side multi-city evaluation of thermal exposure and vegetative buffer capacity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition-colors"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* City Selection Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-gray-800/80 border border-gray-700">
              <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                City A (Primary)
              </label>
              <select
                value={cityA}
                onChange={(e) => setCityA(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 font-bold focus:outline-none focus:border-primary"
              >
                {COMPARISON_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-gray-800/80 border border-gray-700">
              <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                City B (Benchmark)
              </label>
              <select
                value={cityB}
                onChange={(e) => setCityB(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 font-bold focus:outline-none focus:border-primary"
              >
                {COMPARISON_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparative Results Table */}
          {isLoading || !comparison ? (
            <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
              Synthesizing cross-city remote sensing rasters…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold text-center pb-1 text-gray-400">
                <div className="text-left text-gray-300 font-sans font-semibold">{comparison.city_a.name}</div>
                <div className="uppercase tracking-wider text-[10px]">Metric Parameter</div>
                <div className="text-right text-gray-300 font-sans font-semibold">{comparison.city_b.name}</div>
              </div>

              {/* Rows */}
              {[
                {
                  label: 'Average LST',
                  icon: <Thermometer className="w-3.5 h-3.5 text-primary" />,
                  valA: `${comparison.city_a.avg_lst}°C`,
                  valB: `${comparison.city_b.avg_lst}°C`,
                  highlightA: comparison.city_a.avg_lst < comparison.city_b.avg_lst,
                },
                {
                  label: 'Vegetation (NDVI)',
                  icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />,
                  valA: comparison.city_a.ndvi.toFixed(2),
                  valB: comparison.city_b.ndvi.toFixed(2),
                  highlightA: comparison.city_a.ndvi > comparison.city_b.ndvi,
                },
                {
                  label: 'Canopy Cover %',
                  icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />,
                  valA: `${comparison.city_a.green_cover_percent}%`,
                  valB: `${comparison.city_b.green_cover_percent}%`,
                  highlightA: comparison.city_a.green_cover_percent > comparison.city_b.green_cover_percent,
                },
                {
                  label: 'Building Footprint',
                  icon: <Building className="w-3.5 h-3.5 text-blue-400" />,
                  valA: `${comparison.city_a.building_density_percent}%`,
                  valB: `${comparison.city_b.building_density_percent}%`,
                  highlightA: comparison.city_a.building_density_percent < comparison.city_b.building_density_percent,
                },
                {
                  label: 'Population Density',
                  icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
                  valA: `${comparison.city_a.population_density.toLocaleString()} /km²`,
                  valB: `${comparison.city_b.population_density.toLocaleString()} /km²`,
                  highlightA: false,
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 items-center p-3 rounded-2xl bg-gray-800/60 border border-gray-800 text-xs"
                >
                  <div className={`font-bold font-mono text-left ${row.highlightA ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {row.valA}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-center font-medium">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                  <div className={`font-bold font-mono text-right ${!row.highlightA && row.label !== 'Population Density' ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {row.valB}
                  </div>
                </div>
              ))}

              {/* Risk Badges Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${RISK_BADGES[comparison.city_a.heat_risk].bg}`}>
                  <span className="text-xs font-semibold text-gray-200">{comparison.city_a.name} Heat Risk</span>
                  <span className="text-xs font-bold" style={{ color: RISK_BADGES[comparison.city_a.heat_risk].color }}>
                    {comparison.city_a.heat_risk} Risk
                  </span>
                </div>
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${RISK_BADGES[comparison.city_b.heat_risk].bg}`}>
                  <span className="text-xs font-semibold text-gray-200">{comparison.city_b.name} Heat Risk</span>
                  <span className="text-xs font-bold" style={{ color: RISK_BADGES[comparison.city_b.heat_risk].color }}>
                    {comparison.city_b.heat_risk} Risk
                  </span>
                </div>
              </div>

              {/* Narrative Summary */}
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-200 leading-relaxed">
                <span className="font-bold text-primary mr-1">Planning Synthesis:</span>
                {comparison.comparative_summary}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
