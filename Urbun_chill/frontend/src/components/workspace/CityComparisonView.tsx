'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompare,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Thermometer,
  Activity,
  ShieldCheck,
  Leaf,
  Building,
  Users,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Flame,
  Scale,
  Sparkles,
} from 'lucide-react';

import { compareTwoCities, type ComparisonResult } from '@/lib/apiClient';
import type { HeatRisk } from '@/lib/globeConfig';

interface CityComparisonViewProps {
  currentCityName: string;
  onReturnToMap: () => void;
}

const COMPARISON_CITIES = ['Pune', 'Mumbai', 'Hyderabad', 'Delhi', 'Bangalore', 'Phoenix', 'Dubai', 'Singapore'];

const RISK_BADGES: Record<HeatRisk, { color: string; bg: string; icon: React.ReactNode }> = {
  Low: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <CheckCircle className="w-3.5 h-3.5 text-primary" /> },
  Moderate: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <TrendingUp className="w-3.5 h-3.5 text-primary" /> },
  High: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <AlertTriangle className="w-3.5 h-3.5 text-primary" /> },
  Critical: { color: '#2a85ff', bg: 'bg-primary/10 border-primary/20 text-primary', icon: <Flame className="w-3.5 h-3.5 text-primary" /> },
};

export default function CityComparisonView({
  currentCityName,
  onReturnToMap,
}: CityComparisonViewProps) {
  const [cityA, setCityA] = useState(currentCityName);
  const [cityB, setCityB] = useState(currentCityName.toLowerCase() === 'pune' ? 'Hyderabad' : 'Pune');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    compareTwoCities(cityA, cityB)
      .then((res) => setComparison(res))
      .catch((err) => console.error('Comparison error:', err))
      .finally(() => setIsLoading(false));
  }, [cityA, cityB]);

  const handleSwap = () => {
    const temp = cityA;
    setCityA(cityB);
    setCityB(temp);
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
              <span className="font-semibold text-gray-700 dark:text-gray-300">{currentCityName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-primary font-bold">Multi-City Comparison</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
              City Heat & Greenery Comparison
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Compare ground temperatures, tree coverage, and heat risk levels between two cities
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSwap}
              className="button button-default rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              title="Swap City A and City B"
            >
              <Scale className="w-3.5 h-3.5" />
              Swap Cities
            </button>

            <button
              onClick={onReturnToMap}
              className="button button-default rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              title="Return to 3D Digital Twin Map"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to 3D Map
            </button>
          </div>
        </div>

        {/* ── City Selectors Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City A Selector */}
          <div className="card card-border card-shadow p-4 space-y-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Selected City
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMPARISON_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCityA(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    cityA === c
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* City B Selector */}
          <div className="card card-border card-shadow p-4 space-y-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Compare With
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMPARISON_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCityB(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    cityB === c
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Comparison Metrics Content ─────────────────────────────────── */}
        {isLoading || !comparison ? (
          <div className="card card-border card-shadow p-12 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            Querying climate telemetry and urban morphology for {cityA} and {cityB}…
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City A Card */}
              <div className="card card-border card-shadow p-5 space-y-3 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>{comparison.city_a.name}</span>
                    {(comparison.city_a as any).coordinates && (
                      <span className="text-xs font-mono text-gray-400 font-normal">
                        ({(comparison.city_a as any).coordinates.lat.toFixed(1)}°, {(comparison.city_a as any).coordinates.lon.toFixed(1)}°)
                      </span>
                    )}
                  </h3>
                  <span className={`tag ${RISK_BADGES[comparison.city_a.heat_risk]?.bg}`}>
                    {RISK_BADGES[comparison.city_a.heat_risk]?.icon}
                    <span className="ml-1">{comparison.city_a.heat_risk} Risk</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Ground Heat</span>
                    <span className="text-base font-bold font-mono text-gray-900 dark:text-gray-100">{comparison.city_a.avg_lst}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Greenery Index</span>
                    <span className="text-base font-bold font-mono text-primary">{comparison.city_a.ndvi.toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Tree Cover</span>
                    <span className="text-base font-bold font-mono text-primary">{comparison.city_a.green_cover_percent}%</span>
                  </div>
                </div>
              </div>

              {/* City B Card */}
              <div className="card card-border card-shadow p-5 space-y-3 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>{comparison.city_b.name}</span>
                    {(comparison.city_b as any).coordinates && (
                      <span className="text-xs font-mono text-gray-400 font-normal">
                        ({(comparison.city_b as any).coordinates.lat.toFixed(1)}°, {(comparison.city_b as any).coordinates.lon.toFixed(1)}°)
                      </span>
                    )}
                  </h3>
                  <span className={`tag ${RISK_BADGES[comparison.city_b.heat_risk]?.bg}`}>
                    {RISK_BADGES[comparison.city_b.heat_risk]?.icon}
                    <span className="ml-1">{comparison.city_b.heat_risk} Risk</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Ground Heat</span>
                    <span className="text-base font-bold font-mono text-gray-900 dark:text-gray-100">{comparison.city_b.avg_lst}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Greenery Index</span>
                    <span className="text-base font-bold font-mono text-primary">{comparison.city_b.ndvi.toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">Tree Cover</span>
                    <span className="text-base font-bold font-mono text-primary">{comparison.city_b.green_cover_percent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Side-by-Side Indicator Table */}
            <div className="card card-border card-shadow overflow-hidden">
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direct Side-by-Side Comparison
                </span>
                <span className="text-[11px] font-mono text-primary font-semibold">Key Urban Indicators</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700/80">
                {[
                  {
                    label: 'Ground Surface Temperature',
                    icon: <Thermometer className="w-4 h-4 text-primary" />,
                    valA: `${comparison.city_a.avg_lst}°C`,
                    valB: `${comparison.city_b.avg_lst}°C`,
                    diff: `${(comparison.city_a.avg_lst - comparison.city_b.avg_lst).toFixed(1)}°C`,
                    advantage: comparison.city_a.avg_lst < comparison.city_b.avg_lst ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Air Temperature',
                    icon: <Thermometer className="w-4 h-4 text-primary" />,
                    valA: comparison.city_a.ambient_temp !== undefined ? `${comparison.city_a.ambient_temp}°C` : 'N/A',
                    valB: comparison.city_b.ambient_temp !== undefined ? `${comparison.city_b.ambient_temp}°C` : 'N/A',
                    diff: comparison.city_a.ambient_temp && comparison.city_b.ambient_temp ? `${(comparison.city_a.ambient_temp - comparison.city_b.ambient_temp).toFixed(1)}°C` : '—',
                    advantage: (comparison.city_a.ambient_temp || 0) < (comparison.city_b.ambient_temp || 0) ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Heat Intensity Score',
                    icon: <Activity className="w-4 h-4 text-primary" />,
                    valA: comparison.city_a.heat_hazard_index !== undefined ? `${comparison.city_a.heat_hazard_index}/100` : 'N/A',
                    valB: comparison.city_b.heat_hazard_index !== undefined ? `${comparison.city_b.heat_hazard_index}/100` : 'N/A',
                    diff: comparison.city_a.heat_hazard_index && comparison.city_b.heat_hazard_index ? `${comparison.city_a.heat_hazard_index - comparison.city_b.heat_hazard_index}` : '—',
                    advantage: (comparison.city_a.heat_hazard_index || 0) < (comparison.city_b.heat_hazard_index || 0) ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Resident Vulnerability Score',
                    icon: <ShieldCheck className="w-4 h-4 text-primary" />,
                    valA: comparison.city_a.vulnerability_index !== undefined ? `${comparison.city_a.vulnerability_index}/100` : 'N/A',
                    valB: comparison.city_b.vulnerability_index !== undefined ? `${comparison.city_b.vulnerability_index}/100` : 'N/A',
                    diff: comparison.city_a.vulnerability_index && comparison.city_b.vulnerability_index ? `${comparison.city_a.vulnerability_index - comparison.city_b.vulnerability_index}` : '—',
                    advantage: (comparison.city_a.vulnerability_index || 0) < (comparison.city_b.vulnerability_index || 0) ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Plant & Tree Density',
                    icon: <Leaf className="w-4 h-4 text-primary" />,
                    valA: comparison.city_a.ndvi.toFixed(2),
                    valB: comparison.city_b.ndvi.toFixed(2),
                    diff: (comparison.city_a.ndvi - comparison.city_b.ndvi).toFixed(2),
                    advantage: comparison.city_a.ndvi > comparison.city_b.ndvi ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Tree Canopy Coverage',
                    icon: <Leaf className="w-4 h-4 text-primary" />,
                    valA: `${comparison.city_a.green_cover_percent}%`,
                    valB: `${comparison.city_b.green_cover_percent}%`,
                    diff: `${comparison.city_a.green_cover_percent - comparison.city_b.green_cover_percent}%`,
                    advantage: comparison.city_a.green_cover_percent > comparison.city_b.green_cover_percent ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Building Density',
                    icon: <Building className="w-4 h-4 text-primary" />,
                    valA: `${comparison.city_a.building_density_percent}%`,
                    valB: `${comparison.city_b.building_density_percent}%`,
                    diff: `${comparison.city_a.building_density_percent - comparison.city_b.building_density_percent}%`,
                    advantage: comparison.city_a.building_density_percent < comparison.city_b.building_density_percent ? comparison.city_a.name : comparison.city_b.name,
                  },
                  {
                    label: 'Estimated Population Exposure Proxy',
                    icon: <Users className="w-4 h-4 text-primary" />,
                    valA: `${comparison.city_a.population_density.toLocaleString()} /km²`,
                    valB: `${comparison.city_b.population_density.toLocaleString()} /km²`,
                    diff: `${Math.abs(comparison.city_a.population_density - comparison.city_b.population_density).toLocaleString()} /km²`,
                    advantage: 'Population',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center px-5 py-3.5 text-xs hover:bg-gray-50/60 dark:hover:bg-gray-750/30 transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-2.5 font-medium text-gray-700 dark:text-gray-300">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                      {row.valA}
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                      {row.valB}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="tag bg-primary/10 border-primary/20 text-primary font-mono text-[10px]">
                        {row.advantage} {row.diff.startsWith('-') ? row.diff : `+${row.diff}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparative Synthesis Verdict */}
            <div className="card card-border card-shadow p-5 bg-white dark:bg-gray-800 space-y-2">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Comparison Summary
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {comparison.city_a.avg_lst < comparison.city_b.avg_lst
                  ? `${comparison.city_a.name} has a ${Math.abs(comparison.city_a.avg_lst - comparison.city_b.avg_lst).toFixed(1)}°C lower ground temperature than ${comparison.city_b.name}, benefiting from higher tree and greenery coverage (${comparison.city_a.green_cover_percent}% vs ${comparison.city_b.green_cover_percent}%).`
                  : `${comparison.city_b.name} is ${Math.abs(comparison.city_a.avg_lst - comparison.city_b.avg_lst).toFixed(1)}°C cooler than ${comparison.city_a.name}. Higher building and concrete density in ${comparison.city_a.name} traps more daytime solar heat.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
