'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Zap, ArrowUpRight, Compass } from 'lucide-react';
import type { CityResult } from '@/lib/globeConfig';

interface LandingOverlayProps {
  visible: boolean;
  onCitySelected: (city: CityResult) => void;
}

const FEATURE_PILLS = [
  { icon: Satellite, label: 'Landsat-8 & Sentinel-2 LST' },
  { icon: Zap, label: 'ML Heat-Risk Forecast' },
  { icon: Globe, label: 'Global 3D Digital Twin' },
];

const PRESET_CITIES: CityResult[] = [
  { name: 'Pune', lat: 18.5204, lon: 73.8567, displayName: 'Pune, Maharashtra, India' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, displayName: 'Dubai, UAE' },
  { name: 'Phoenix', lat: 33.4484, lon: -112.074, displayName: 'Phoenix, Arizona, USA' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, displayName: 'Singapore' },
];

export default function LandingOverlay({ visible, onCitySelected }: LandingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="landing-overlay"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4"
          aria-label="UrbanChill AI landing"
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-auto w-full max-w-xl bg-gray-900/75 backdrop-blur-2xl rounded-2xl border border-gray-700 shadow-2xl px-8 py-9 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Geo-Intelligent Digital Twin
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-gray-100 mb-3">
              UrbanChill{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-mild to-primary">AI</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base mb-6 leading-relaxed">
              Explore real-time land surface temperature, vegetation canopy density, and predictive urban heat risk for any city on Earth.
            </p>

            <div className="mb-6">
              <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
                <Compass className="w-3 h-3 text-primary" />
                Quick Fly to Hotspots
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => onCitySelected(city)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-primary/20 border border-gray-700 hover:border-primary/40 text-gray-200 hover:text-white text-xs font-medium transition-all duration-150 group"
                  >
                    <span>{city.name}</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-xs text-gray-400 mb-6">
              Use the <span className="text-gray-100 font-medium">top-right search instrument</span> to find any global coordinate, or click directly on the Earth globe.
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-[11px] font-medium">
                  <Icon className="w-3 h-3 text-gray-500" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.p
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none mt-6 text-gray-500 text-xs font-mono tracking-widest uppercase select-none"
          >
            Drag to rotate  Scroll to zoom  Click globe to select
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
