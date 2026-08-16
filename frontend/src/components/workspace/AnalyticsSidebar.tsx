'use client';

import { motion } from 'framer-motion';
import {
  BarChart3, Thermometer, Leaf, Wind, Droplets,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  TreePine, Building2, Sun
} from 'lucide-react';
import type { AnalyzeResult, HeatRisk } from '@/lib/globeConfig';

function SkeletonBlock({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-white/5 animate-pulse`} />;
}

const RISK_CONFIG: Record<HeatRisk, { color: string; bg: string; icon: React.ReactNode }> = {
  Low:      { color: '#22c55e', bg: 'bg-green-500/15',  icon: <CheckCircle className="w-4 h-4 text-green-400" /> },
  Moderate: { color: '#f59e0b', bg: 'bg-amber-500/15',  icon: <TrendingUp  className="w-4 h-4 text-amber-400" /> },
  High:     { color: '#f97316', bg: 'bg-orange-500/15', icon: <AlertTriangle className="w-4 h-4 text-orange-400" /> },
  Critical: { color: '#ef4444', bg: 'bg-red-500/15',    icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
};

interface AnalyticsSidebarProps {
  isLoading: boolean;
  data: AnalyzeResult | null;
  city: string;
}

function StatCard({
  label,
  value,
  unit,
  icon,
  sub,
  color = '#94a3b8',
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/3 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-xl font-bold text-white">
        {value}
        {unit && <span className="text-sm text-slate-400 font-normal ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-slate-500 text-[11px] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AnalyticsSidebar({ isLoading, data, city }: AnalyticsSidebarProps) {
  const riskCfg = data ? RISK_CONFIG[data.heatRisk] : null;

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.38, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="
        fixed right-0 top-14 bottom-0 z-30
        w-72 xl:w-80
        bg-slate-950/92 backdrop-blur-2xl
        border-l border-white/10
        flex flex-col
        overflow-hidden
        shadow-2xl shadow-black/80
      "
      aria-label="City analytics"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/8 bg-white/2">
        <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-xs uppercase tracking-wider">Urban Analytics</div>
          <div className="text-slate-400 text-[11px]">Thermal Risk Indices</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading || !data ? (
          <>
            {/* Heat risk skeleton */}
            <div className="rounded-xl border border-white/5 p-4 space-y-3">
              <SkeletonBlock h="h-3" w="w-2/3" />
              <SkeletonBlock h="h-8" w="w-1/2" />
              <SkeletonBlock h="h-2" w="w-full" />
            </div>
            {/* Stat skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-white/5 p-3.5 space-y-2">
                <SkeletonBlock h="h-2" w="w-1/3" />
                <SkeletonBlock h="h-5" w="w-1/2" />
              </div>
            ))}
            {/* Forecast skeleton */}
            <div className="rounded-xl border border-white/5 p-3.5 space-y-2">
              <SkeletonBlock h="h-2" w="w-1/4" />
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 h-14 rounded bg-white/5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Heat Risk Banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border border-white/8 ${riskCfg!.bg} p-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                  Heat Risk Level
                </span>
                {riskCfg!.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {data.heatRisk}
              </div>
              <div
                className="w-full h-1.5 rounded-full bg-black/30 mt-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1}
                aria-valuemin={1}
                aria-valuemax={4}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1) * 25}%`,
                    background: riskCfg!.color,
                  }}
                />
              </div>
            </motion.div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                label="LST"
                value={data.lst.toFixed(1)}
                unit="°C"
                icon={<Thermometer className="w-4 h-4" />}
                color="#ef4444"
                sub="Land Surface Temp"
              />
              <StatCard
                label="NDVI"
                value={data.ndvi.toFixed(2)}
                icon={<Leaf className="w-4 h-4" />}
                color="#22c55e"
                sub="Vegetation Index"
              />
              <StatCard
                label="UV Index"
                value={data.uvIndex}
                icon={<Sun className="w-4 h-4" />}
                color="#f59e0b"
                sub={data.uvIndex >= 8 ? 'Very High' : data.uvIndex >= 6 ? 'High' : 'Moderate'}
              />
              <StatCard
                label="Humidity"
                value={data.humidity}
                unit="%"
                icon={<Droplets className="w-4 h-4" />}
                color="#38bdf8"
                sub="Relative humidity"
              />
            </div>

            {/* 7-day forecast mini chart */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/6 bg-white/3 p-3.5"
            >
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-3">
                7-Day Temperature Forecast
              </div>
              <div className="flex items-end justify-between gap-1 h-16">
                {data.weeklyForecast.map(({ day, maxTemp, minTemp }) => {
                  const norm = (maxTemp - 28) / 20; // normalise roughly 28–48°C range
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all duration-500"
                        style={{
                          height: `${Math.max(8, norm * 100)}%`,
                          background: `linear-gradient(to top, #ef4444, #f97316)`,
                          opacity: 0.8,
                        }}
                        title={`${maxTemp}°C / ${minTemp}°C`}
                      />
                      <span className="text-slate-600 text-[9px]">{day}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-xl border border-white/6 bg-white/3 p-3.5"
            >
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-3">
                Cooling Recommendations
              </div>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <TreePine className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Top Heat Zones */}
            {data.topHeatZones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="rounded-xl border border-white/6 bg-white/3 p-3.5"
              >
                <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-3">
                  Top Heat Zones
                </div>
                <ul className="space-y-2">
                  {data.topHeatZones.map((zone, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-slate-300 text-xs truncate flex-1">{zone.name}</span>
                      <span
                        className="text-xs font-bold ml-2 flex-shrink-0"
                        style={{ color: RISK_CONFIG[zone.risk].color }}
                      >
                        {zone.temp.toFixed(1)}°C
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.aside>
  );
}
