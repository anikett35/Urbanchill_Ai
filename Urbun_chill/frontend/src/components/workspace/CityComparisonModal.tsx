'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GitCompare,
  Thermometer,
  Leaf,
  Building,
  Users,
  Flame,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Sun,
  Moon,
  Activity,
  ShieldCheck,
  Info,
} from 'lucide-react';

import { compareTwoCities, ComparisonResult } from '@/lib/apiClient';
import type { HeatRisk } from '@/lib/globeConfig';

interface CityComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityName: string;
}

const COMPARISON_CITIES = ['Pune', 'Mumbai', 'Hyderabad', 'Delhi', 'Bangalore', 'Phoenix', 'Dubai'];

const RISK_BADGES: Record<HeatRisk, { color: string; bg: string; icon: React.ReactNode }> = {
  Low: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <CheckCircle className="w-3.5 h-3.5 text-primary" /> },
  Moderate: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <TrendingUp className="w-3.5 h-3.5 text-primary" /> },
  High: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <AlertTriangle className="w-3.5 h-3.5 text-primary" /> },
  Critical: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <Flame className="w-3.5 h-3.5 text-primary" /> },
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
      <div className="dialog-overlay p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="
            dialog-content relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
            rounded-2xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-750
            p-5 sm:p-6 shadow-2xl
            flex flex-col gap-5 text-gray-900 dark:text-gray-100
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-750 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Comparative Urban Heat Analysis
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Side-by-side multi-city evaluation of thermal exposure, solar phase, and vegetative buffer capacity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* City Selection Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750">
              <label className="text-[10px] font-mono uppercase text-gray-500 dark:text-gray-400 block mb-1.5 font-bold">
                City A (Primary)
              </label>
              <select
                value={cityA}
                onChange={(e) => setCityA(e.target.value)}
                className="input text-sm font-bold bg-white dark:bg-gray-750"
              >
                {COMPARISON_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750">
              <label className="text-[10px] font-mono uppercase text-gray-500 dark:text-gray-400 block mb-1.5 font-bold">
                City B (Benchmark)
              </label>
              <select
                value={cityB}
                onChange={(e) => setCityB(e.target.value)}
                className="input text-sm font-bold bg-white dark:bg-gray-750"
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
            <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
              Synthesizing cross-city telemetry rasters…
            </div>
          ) : (
            <div className="space-y-4">
              {/* Diurnal Confounding Alert */}
              {comparison.diurnal_confounding_warning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Diurnal Confounding Detected: </span>
                    {comparison.diurnal_confounding_warning}
                  </div>
                </div>
              )}

              {/* City Headers with Solar Time and Quality */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold text-center pb-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-750">
                <div className="text-left font-sans font-semibold">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{comparison.city_a.name}</div>
                  <div className="text-[10px] font-mono font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      {comparison.city_a.is_day ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-blue-500" />}
                      {comparison.city_a.diurnal_phase || (comparison.city_a.is_day ? 'Day' : 'Night')}
                    </span>
                    <span>•</span>
                    <span>{comparison.city_a.local_solar_time || 'N/A'}</span>
                    {comparison.city_a.data_quality_score !== undefined && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[9px] border border-gray-200 dark:border-gray-600 text-primary font-bold">
                        DQ {comparison.city_a.data_quality_score}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="uppercase tracking-wider text-[10px] flex items-center justify-center font-mono text-gray-400 dark:text-gray-500">
                  Parameter
                </div>
                <div className="text-right font-sans font-semibold">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{comparison.city_b.name}</div>
                  <div className="text-[10px] font-mono font-normal text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1.5 mt-0.5">
                    {comparison.city_b.data_quality_score !== undefined && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[9px] border border-gray-200 dark:border-gray-600 text-primary font-bold">
                        DQ {comparison.city_b.data_quality_score}%
                      </span>
                    )}
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      {comparison.city_b.is_day ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-blue-500" />}
                      {comparison.city_b.diurnal_phase || (comparison.city_b.is_day ? 'Day' : 'Night')}
                    </span>
                    <span>•</span>
                    <span>{comparison.city_b.local_solar_time || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Rows */}
              {[
                {
                  label: 'Average LST (Skin)',
                  icon: <Thermometer className="w-3.5 h-3.5 text-primary" />,
                  valA: `${comparison.city_a.avg_lst}°C`,
                  valB: `${comparison.city_b.avg_lst}°C`,
                  highlightA: comparison.city_a.avg_lst < comparison.city_b.avg_lst,
                },
                {
                  label: 'Ambient Air Temp',
                  icon: <Thermometer className="w-3.5 h-3.5 text-primary" />,
                  valA: comparison.city_a.ambient_temp !== undefined ? `${comparison.city_a.ambient_temp}°C` : 'N/A',
                  valB: comparison.city_b.ambient_temp !== undefined ? `${comparison.city_b.ambient_temp}°C` : 'N/A',
                  highlightA: (comparison.city_a.ambient_temp || 0) < (comparison.city_b.ambient_temp || 0),
                },
                {
                  label: 'Heat Hazard Index',
                  icon: <Activity className="w-3.5 h-3.5 text-primary" />,
                  valA: comparison.city_a.heat_hazard_index !== undefined ? `${comparison.city_a.heat_hazard_index}/100` : 'N/A',
                  valB: comparison.city_b.heat_hazard_index !== undefined ? `${comparison.city_b.heat_hazard_index}/100` : 'N/A',
                  highlightA: (comparison.city_a.heat_hazard_index || 0) < (comparison.city_b.heat_hazard_index || 0),
                },
                {
                  label: 'Vulnerability Index',
                  icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" />,
                  valA: comparison.city_a.vulnerability_index !== undefined ? `${comparison.city_a.vulnerability_index}/100` : 'N/A',
                  valB: comparison.city_b.vulnerability_index !== undefined ? `${comparison.city_b.vulnerability_index}/100` : 'N/A',
                  highlightA: (comparison.city_a.vulnerability_index || 0) < (comparison.city_b.vulnerability_index || 0),
                },
                {
                  label: 'Vegetation (NDVI Proxy)',
                  icon: <Leaf className="w-3.5 h-3.5 text-primary" />,
                  valA: comparison.city_a.ndvi.toFixed(2),
                  valB: comparison.city_b.ndvi.toFixed(2),
                  highlightA: comparison.city_a.ndvi > comparison.city_b.ndvi,
                },
                {
                  label: 'Canopy Cover %',
                  icon: <Leaf className="w-3.5 h-3.5 text-primary" />,
                  valA: `${comparison.city_a.green_cover_percent}%`,
                  valB: `${comparison.city_b.green_cover_percent}%`,
                  highlightA: comparison.city_a.green_cover_percent > comparison.city_b.green_cover_percent,
                },
                {
                  label: 'Building Footprint',
                  icon: <Building className="w-3.5 h-3.5 text-primary" />,
                  valA: `${comparison.city_a.building_density_percent}%`,
                  valB: `${comparison.city_b.building_density_percent}%`,
                  highlightA: comparison.city_a.building_density_percent < comparison.city_b.building_density_percent,
                },
                {
                  label: 'Population Density',
                  icon: <Users className="w-3.5 h-3.5 text-primary" />,
                  valA: `${comparison.city_a.population_density.toLocaleString()} /km²`,
                  valB: `${comparison.city_b.population_density.toLocaleString()} /km²`,
                  highlightA: false,
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 text-xs"
                >
                  <div className={`font-bold font-mono text-left ${row.highlightA ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-200'}`}>
                    {row.valA}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 text-center font-medium">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                  <div className={`font-bold font-mono text-right ${!row.highlightA && row.label !== 'Population Density' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-200'}`}>
                    {row.valB}
                  </div>
                </div>
              ))}

              {/* Risk Badges Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${RISK_BADGES[comparison.city_a.heat_risk].bg}`}>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comparison.city_a.name} Risk</span>
                  <span className="text-xs font-bold" style={{ color: RISK_BADGES[comparison.city_a.heat_risk].color }}>
                    {comparison.city_a.heat_risk}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${RISK_BADGES[comparison.city_b.heat_risk].bg}`}>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comparison.city_b.name} Risk</span>
                  <span className="text-xs font-bold" style={{ color: RISK_BADGES[comparison.city_b.heat_risk].color }}>
                    {comparison.city_b.heat_risk}
                  </span>
                </div>
              </div>

              {/* Narrative Summary */}
              <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-bold text-primary mr-1">Comparative Synthesis:</span>
                {comparison.comparative_summary}
              </div>

              {/* Data Provenance Note */}
              {comparison.data_provenance_note && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-750 text-[11px] text-gray-500 dark:text-gray-400">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{comparison.data_provenance_note}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-750">
            <button
              onClick={onClose}
              className="button button-default rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
