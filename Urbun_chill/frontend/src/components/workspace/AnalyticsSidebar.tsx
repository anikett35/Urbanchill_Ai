'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Thermometer,
  Leaf,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  TreePine,
  Sun,
  FileDown,
  Flame,
  Check,
} from 'lucide-react';

import type { AnalyzeResult, HeatRisk } from '@/lib/globeConfig';
import { downloadPdfReport } from '@/lib/apiClient';

function SkeletonBlock({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-gray-200 dark:bg-gray-700 animate-pulse`} />;
}

const RISK_CONFIG: Record<HeatRisk, { color: string; badge: string; icon: React.ReactNode }> = {
  Low: { color: '#2a85ff', badge: 'bg-primary/10 text-primary border-primary/20', icon: <CheckCircle className="w-4 h-4 text-primary" /> },
  Moderate: { color: '#2a85ff', badge: 'bg-primary/10 text-primary border-primary/20', icon: <TrendingUp className="w-4 h-4 text-primary" /> },
  High: { color: '#2a85ff', badge: 'bg-primary/10 text-primary border-primary/20', icon: <AlertTriangle className="w-4 h-4 text-primary" /> },
  Critical: { color: '#2a85ff', badge: 'bg-primary/10 text-primary border-primary/20', icon: <Flame className="w-4 h-4 text-primary" /> },
};

interface AnalyticsSidebarProps {
  isLoading: boolean;
  data: AnalyzeResult | null;
  city: string;
}

function StatWidget({
  label,
  value,
  unit,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="card card-border card-shadow p-3.5 flex flex-col justify-between hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
          {value}
          {unit && <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-0.5">{unit}</span>}
        </div>
        {sub && <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5 font-mono">{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsSidebar({ isLoading, data, city }: AnalyticsSidebarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const riskCfg = data ? RISK_CONFIG[data.heatRisk] : null;

  const handleExportPdf = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await downloadPdfReport(city, data);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside
      className="w-80 xl:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-xs h-full shrink-0 select-none"
      aria-label="City analytics"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-gray-900 dark:text-gray-100 font-bold text-xs uppercase tracking-wider">Urban Analytics</div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">Real-Time Climatological Digital Twin</div>
          </div>
        </div>
        {data?.weatherCondition && (
          <span className="tag bg-primary/10 border-primary/20 text-primary text-[10px]">
            {data.weatherCondition}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {isLoading || !data ? (
          <>
            <div className="card card-border card-shadow p-4 space-y-3">
              <SkeletonBlock h="h-3" w="w-2/3" />
              <SkeletonBlock h="h-8" w="w-1/2" />
              <SkeletonBlock h="h-2" w="w-full" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="card card-border card-shadow p-3.5 space-y-2">
                <SkeletonBlock h="h-2" w="w-1/3" />
                <SkeletonBlock h="h-5" w="w-1/2" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Heat Risk Level Banner with Calibrated Confidence & Data Quality */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card card-border card-shadow p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Heat Risk Classification
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                    BENCHMARK
                  </span>
                </div>
                {riskCfg!.icon}
              </div>
              
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.heatRisk} Risk</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {data.calibratedConfidence !== undefined || data.confidence !== undefined
                    ? `${Math.round(((data.calibratedConfidence ?? data.confidence) as number) * 100)}% Confidence`
                    : 'Unavailable'}
                </span>
              </div>

              <div
                className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 mt-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1}
                aria-valuemin={1}
                aria-valuemax={4}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${(['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1) * 25}%`,
                  }}
                />
              </div>

              {/* Data Quality Score Bar */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/80 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                <span>Data Quality Score:</span>
                <span className="font-bold text-primary">
                  {data.dataQuality?.score ?? 85}/100 ({data.dataQuality?.level ?? 'GOOD'})
                </span>
              </div>
            </motion.div>

            {/* Separated Physical Heat Hazard & Human Exposure Vulnerability */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="card card-border card-shadow p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-bold uppercase tracking-wider">
                  <span>Physical Hazard</span>
                  <span className="font-mono font-bold text-primary">
                    {((data.heatHazardIndex ?? 0.65) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((data.heatHazardIndex ?? 0.65) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1.5">Thermal & Built Mass</span>
              </div>

              <div className="card card-border card-shadow p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-bold uppercase tracking-wider">
                  <span>Exposure Proxy</span>
                  <span className="font-mono font-bold text-primary">
                    {((data.vulnerabilityIndex ?? 0.55) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-primary/75 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((data.vulnerabilityIndex ?? 0.55) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1.5">Demographic Footprint</span>
              </div>
            </div>

            {/* 4 Core Telemetry Indicator Widgets with Scientific Provenance Labels */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatWidget
                label="Surface Temp"
                value={data.lst.toFixed(1)}
                unit="°C"
                icon={<Thermometer className="w-4 h-4" />}
                sub="[PROXY] Reanalysis + UHI"
              />
              <StatWidget
                label="Vegetation"
                value={data.ndvi.toFixed(2)}
                icon={<Leaf className="w-4 h-4" />}
                sub="[PROXY] EVI Vector Index"
              />
              <StatWidget
                label="Ambient Air"
                value={data.ambientTemp !== undefined && data.ambientTemp !== null ? data.ambientTemp.toFixed(1) : "--"}
                unit="°C"
                icon={<Sun className="w-4 h-4" />}
                sub="[OBSERVED] Open-Meteo"
              />
              <StatWidget
                label="Humidity"
                value={data.humidity}
                unit="%"
                icon={<Droplets className="w-4 h-4" />}
                sub="[OBSERVED] Live Humidity"
              />
            </div>

            {/* 7-Day Temperature Forecast Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card card-border card-shadow p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  7-Day Thermal Forecast
                </span>
                <span className="text-[10px] font-semibold text-primary">Daily Max/Min</span>
              </div>
              <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
                {data.weeklyForecast.map(({ day, maxTemp, minTemp }) => {
                  const minScale = 18;
                  const maxScale = 45;
                  const norm = Math.min(1, Math.max(0.2, (maxTemp - minScale) / (maxScale - minScale)));
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors font-bold">
                        {Math.round(maxTemp)}°
                      </span>
                      <div className="w-full h-14 flex items-end">
                        <div
                          className="w-full rounded-md transition-all duration-300 bg-primary/70 group-hover:bg-primary shadow-xs"
                          style={{
                            height: `${Math.round(norm * 100)}%`,
                          }}
                          title={`${maxTemp.toFixed(1)}°C / ${minTemp.toFixed(1)}°C`}
                        />
                      </div>
                      <span className="text-gray-400 font-mono text-[9px] font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Heat Vulnerability Zones */}
            {data.topHeatZones && data.topHeatZones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="card card-border card-shadow p-4 bg-white dark:bg-gray-800"
              >
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                  Top Heat Hotspots
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/80">
                  {data.topHeatZones.map((zone, i) => (
                    <li key={i} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <span className="text-gray-700 dark:text-gray-300 truncate font-medium flex-1 pr-2">{zone.name}</span>
                      <span className="font-mono font-bold text-primary">
                        {zone.temp.toFixed(1)}°C
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Actionable Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="card card-border card-shadow p-4 bg-white dark:bg-gray-800"
            >
              <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                Cooling Recommendations
              </div>
              <ul className="space-y-2">
                {data.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                    <TreePine className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </div>

      {/* Export PDF Report Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
        <button
          onClick={handleExportPdf}
          disabled={isLoading || isExporting}
          className="
            button button-solid w-full py-3 px-4 rounded-xl
            text-xs font-bold shadow-md transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Generating PDF Report…</span>
            </>
          ) : exportDone ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Report Downloaded!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>Export PDF Report</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
