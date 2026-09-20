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
  Low: { color: '#10b981', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
  Moderate: { color: '#f59e0b', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: <TrendingUp className="w-4 h-4 text-amber-500" /> },
  High: { color: '#fb732c', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
  Critical: { color: '#ef4444', badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: <Flame className="w-4 h-4 text-red-500" /> },
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
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-3.5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
          {value}
          {unit && <span className="text-xs text-gray-500 font-normal ml-0.5">{unit}</span>}
        </div>
        {sub && <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">{sub}</div>}
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
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.38, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-16 bottom-0 z-30 w-72 xl:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm"
      aria-label="City analytics"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-gray-900 dark:text-gray-100 font-bold text-xs uppercase tracking-wider">Urban Analytics</div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">Satellite Remote Sensing Telemetry</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading || !data ? (
          <>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <SkeletonBlock h="h-3" w="w-2/3" />
              <SkeletonBlock h="h-8" w="w-1/2" />
              <SkeletonBlock h="h-2" w="w-full" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 space-y-2">
                <SkeletonBlock h="h-2" w="w-1/3" />
                <SkeletonBlock h="h-5" w="w-1/2" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Heat Risk Level Banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${riskCfg!.badge}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  ML Heat Vulnerability Index
                </span>
                {riskCfg!.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{data.heatRisk} Risk</div>
              <div
                className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700/80 mt-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1}
                aria-valuemin={1}
                aria-valuemax={4}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(['Low', 'Moderate', 'High', 'Critical'].indexOf(data.heatRisk) + 1) * 25}%`,
                    backgroundColor: riskCfg!.color,
                  }}
                />
              </div>
            </motion.div>

            {/* 4 Core Telemetry Indicator Widgets */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatWidget
                label="LST Temp"
                value={data.lst.toFixed(1)}
                unit="°C"
                icon={<Thermometer className="w-4 h-4" />}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-500"
                sub="Landsat-8 Band 10"
              />
              <StatWidget
                label="Vegetation"
                value={data.ndvi.toFixed(2)}
                icon={<Leaf className="w-4 h-4" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-500"
                sub="Canopy Index (NDVI)"
              />
              <StatWidget
                label="UV Index"
                value={data.uvIndex}
                unit="/ 11"
                icon={<Sun className="w-4 h-4" />}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-500"
                sub={data.uvIndex >= 8 ? 'Very High' : 'Moderate'}
              />
              <StatWidget
                label="Humidity"
                value={data.humidity}
                unit="%"
                icon={<Droplets className="w-4 h-4" />}
                iconBg="bg-sky-500/10"
                iconColor="text-sky-500"
                sub="Relative Humidity"
              />
            </div>

            {/* 7-Day Temperature Forecast Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  7-Day Thermal Forecast
                </span>
                <span className="text-[10px] font-semibold text-primary">Seasonal Max</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-18">
                {data.weeklyForecast.map(({ day, maxTemp, minTemp }) => {
                  const norm = (maxTemp - 26) / 22;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-md transition-all duration-500 bg-primary/80 hover:bg-primary"
                        style={{
                          height: `${Math.max(16, norm * 100)}%`,
                        }}
                        title={`${maxTemp.toFixed(1)}°C / ${minTemp.toFixed(1)}°C`}
                      />
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-[9px] font-medium">{day}</span>
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
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4"
              >
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                  Top Heat Hotspots
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.topHeatZones.map((zone, i) => (
                    <li key={i} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <span className="text-gray-700 dark:text-gray-300 truncate font-medium flex-1 pr-2">{zone.name}</span>
                      <span className="font-mono font-bold text-orange-500">
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
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4"
            >
              <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                Cooling Recommendations
              </div>
              <ul className="space-y-2">
                {data.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                    <TreePine className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </div>

      {/* Export PDF Report Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
        <button
          onClick={handleExportPdf}
          disabled={isLoading || isExporting}
          className="
            w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
            bg-primary hover:bg-primary-deep text-white text-xs font-bold
            shadow-md transition-all duration-150
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
    </motion.aside>
  );
}
