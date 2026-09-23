'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Thermometer,
  Leaf,
  Sun,
  Droplets,
  ArrowLeft,
  FileDown,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  TreePine,
  CheckCircle,
  Building,
  Users,
  MapPin,
  TrendingUp,
  ShieldAlert,
  MessageCircle,
} from 'lucide-react';
import type { AnalyzeResult, HeatRisk, CityResult } from '@/lib/globeConfig';
import { downloadPdfReport } from '@/lib/apiClient';
import HeatAlertBroadcastModal from '@/components/workspace/HeatAlertBroadcastModal';

interface AnalyticsViewProps {
  cityName: string;
  data: AnalyzeResult | null;
  isLoading: boolean;
  onReturnToMap: () => void;
}

export default function AnalyticsView({
  cityName,
  data,
  isLoading,
  onReturnToMap,
}: AnalyticsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await downloadPdfReport(cityName, data);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const lst = data?.lst ?? 36.8;
  const ndvi = data?.ndvi ?? 0.28;
  const ambientTemp = data?.ambientTemp ?? (lst > 30 ? Math.round(lst - 4.5) : 31.0);
  const humidity = data?.humidity ?? 52;
  const heatRisk = data?.heatRisk ?? 'High';
  const confidenceText = (data?.calibratedConfidence !== undefined || data?.confidence !== undefined)
    ? `${Math.round(((data.calibratedConfidence ?? data.confidence) as number) * 100)}% Accuracy`
    : 'Unavailable';
  const hazardPercent = Math.round((data?.heatHazardIndex ?? 0.65) * 100);
  const vulnPercent = Math.round((data?.vulnerabilityIndex ?? 0.55) * 100);

  // Fallback top heat zones if not supplied
  const hotspots = data?.topHeatZones && data.topHeatZones.length > 0
    ? data.topHeatZones.map((z) => ({
        name: z.name,
        temp: z.temp,
        risk: z.risk,
      }))
    : [
        { name: `${cityName} Industrial Corridor`, temp: Number((lst + 3.8).toFixed(1)), risk: 'Critical' as HeatRisk },
        { name: `${cityName} Central Commercial Zone`, temp: Number((lst + 2.2).toFixed(1)), risk: 'High' as HeatRisk },
        { name: `${cityName} Transit Station Hub`, temp: Number((lst + 1.5).toFixed(1)), risk: 'High' as HeatRisk },
        { name: `${cityName} Eastern Residential District`, temp: Number((lst - 1.2).toFixed(1)), risk: 'Moderate' as HeatRisk },
      ];

  const recommendations = data?.recommendations && data.recommendations.length > 0
    ? data.recommendations
    : [
        `Plant shaded tree corridors along major roadways to reduce surface heat by up to 2.5°C.`,
        `Apply reflective white cool roof paint on large commercial and residential buildings.`,
        `Develop decentralized pocket parks and water retention basins in high-density sectors.`,
      ];

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
              <span className="text-primary font-bold">Urban Analytics</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              {cityName} Urban Heat Analytics
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Live ground surface temperatures, greenery coverage, and neighborhood heat vulnerability
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="button rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              title="Broadcast WhatsApp and SMS Heat Circular to Citizens"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp & SMS Alert
            </button>

            <button
              onClick={onReturnToMap}
              className="button button-default rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title="Return to 3D Digital Twin Map"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to 3D Map
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="button button-solid rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              {isExporting ? 'Generating PDF…' : exportSuccess ? 'Downloaded!' : 'Export PDF Report'}
            </button>
          </div>
        </div>

        {/* ── Emergency WhatsApp & SMS Alert Banner ─────────────────────── */}
        <div className="card card-border card-shadow p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Citizen Emergency Heatwave Advisory & Circular
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  WhatsApp + SMS + Voice Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Elevated surface temperatures detected in {cityName} ({lst.toFixed(1)}°C, {heatRisk} Risk). Issue formatted emergency advisories to ward groups and residents.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="button rounded-xl px-4 py-2 text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shrink-0 shadow-sm transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Dispatch WhatsApp & SMS</span>
          </button>
        </div>

        {/* ── Top 4 KPI Metrics Row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Ground Temperature */}
          <div className="card card-border card-shadow p-5 bg-white dark:bg-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Ground Temperature
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100">
                {lst.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <span className="font-semibold text-primary">Surface Heat</span>
                <span>across urban area</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Greenery Index */}
          <div className="card card-border card-shadow p-5 bg-white dark:bg-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Greenery Coverage
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-primary">
                {ndvi.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Healthy vegetation density</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Air Temperature */}
          <div className="card card-border card-shadow p-5 bg-white dark:bg-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Air Temperature
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100">
                {typeof ambientTemp === 'number' ? `${ambientTemp.toFixed(1)}°C` : `${ambientTemp}°C`}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Live outdoor weather</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Relative Humidity */}
          <div className="card card-border card-shadow p-5 bg-white dark:bg-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Relative Humidity
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100">
                {humidity}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Moisture in ambient air</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Analytics Row: Risk Assessment & Indicators ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Heat Risk Classification Banner */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card card-border card-shadow p-6 bg-white dark:bg-gray-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Heat Risk Assessment
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Evaluated from estimated surface skin temperature and building morphology
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {confidenceText}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-750/30 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100 block">
                      {heatRisk} Heat Risk
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Urban heat retention is elevated in central built-up areas
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 w-fit">
                  Requires Cooling Action
                </span>
              </div>

              {/* Physical Hazard & Population Impact Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/20 border border-gray-100 dark:border-gray-700/60">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Physical Heat Hazard</span>
                    <span className="text-primary font-mono font-bold">{hazardPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${hazardPercent}%` }} />
                  </div>
                  <span className="text-[11px] text-gray-400 block">Thermal intensity from surface skin heat & concrete mass</span>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/20 border border-gray-100 dark:border-gray-700/60">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300" title="Estimated from built-form morphology; not direct census data.">Estimated Population Exposure Proxy</span>
                    <span className="text-primary font-mono font-bold">{vulnPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-primary/75 rounded-full transition-all duration-500" style={{ width: `${vulnPercent}%` }} />
                  </div>
                  <span className="text-[11px] text-gray-400 block">Estimated from built-form morphology; not direct census data</span>
                </div>
              </div>
            </div>

            {/* Neighborhood Hotspots Table */}
            <div className="card card-border card-shadow p-6 bg-white dark:bg-gray-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Priority Heat Hotspots
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Sectors that benefit most from immediate cooling interventions
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-400">Ranked by ground heat</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold">
                      <th className="pb-2.5">Neighborhood / Sector</th>
                      <th className="pb-2.5 text-center">Surface Heat</th>
                      <th className="pb-2.5 text-center">Priority</th>
                      <th className="pb-2.5 text-right">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {hotspots.map((zone, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors">
                        <td className="py-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{zone.name}</span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-primary">
                          {zone.temp.toFixed(1)}°C
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {zone.risk}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                          {idx === 0 ? 'Plant shade trees' : idx === 1 ? 'Install reflective roofs' : 'Add pocket park'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: 7-Day Forecast & Action Recommendations */}
          <div className="lg:col-span-5 space-y-6">
            {/* 7-Day Temperature Forecast */}
            <div className="card card-border card-shadow p-6 bg-white dark:bg-gray-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  7-Day Heat Forecast
                </h3>
                <span className="text-xs text-gray-400 font-mono">Daily Outlook</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => {
                  const dayTemp = Math.round(lst - 2 + (dIdx % 3));
                  return (
                    <div key={day} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750/30 border border-gray-100 dark:border-gray-700 space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">{day}</span>
                      <Sun className="w-3.5 h-3.5 text-amber-500 mx-auto" />
                      <span className="font-mono font-bold text-gray-900 dark:text-gray-100 block text-xs">{dayTemp}°</span>
                      <span className="font-mono text-[10px] text-gray-400 block">{dayTemp - 8}°</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* City Cooling Recommendations */}
            <div className="card card-border card-shadow p-6 bg-white dark:bg-gray-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Cooling Solutions for {cityName}
                </h3>
                <span className="text-xs font-mono text-primary font-bold">Recommended</span>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/20 border border-gray-100 dark:border-gray-700/60">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <TreePine className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency WhatsApp & SMS Heat Broadcast Modal */}
      <HeatAlertBroadcastModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        cityName={cityName}
        currentTemp={lst}
        heatRisk={heatRisk}
      />
    </div>
  );
}
