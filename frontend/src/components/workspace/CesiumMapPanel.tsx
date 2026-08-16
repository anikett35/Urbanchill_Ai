'use client';

import { motion } from 'framer-motion';
import { Compass, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import type { CityResult, AppState } from '@/lib/globeConfig';

interface CesiumMapPanelProps {
  city: CityResult;
  appState: AppState;
}

export default function CesiumMapPanel({ city, appState }: CesiumMapPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="
        fixed
        left-0 sm:left-72 xl:left-80
        right-0 sm:right-72 xl:right-80
        top-14 bottom-0
        z-10
        pointer-events-none
      "
      aria-label="Globe map viewport"
    >
      {/* Right-side floating map navigation controls */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="
          pointer-events-auto
          absolute right-3 top-4
          flex flex-col gap-1.5
        "
      >
        {[
          { Icon: ZoomIn,     label: 'Zoom in',       title: 'Zoom in' },
          { Icon: ZoomOut,    label: 'Zoom out',      title: 'Zoom out' },
          { Icon: Compass,    label: 'Reset bearing', title: 'Reset bearing' },
          { Icon: Maximize2,  label: 'Fit to city',   title: 'Fit to city' },
        ].map(({ Icon, label, title }) => (
          <button
            key={label}
            aria-label={label}
            title={title}
            className="
              w-8 h-8 rounded-xl
              bg-slate-950/85 backdrop-blur-xl
              border border-white/12
              flex items-center justify-center
              text-slate-300 hover:text-white
              hover:bg-slate-800/90 hover:border-white/25
              transition-all duration-150
              shadow-lg shadow-black/50
            "
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </motion.div>

      {/* Bottom hint bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="
          px-3.5 py-1.5 rounded-full
          bg-slate-950/80 backdrop-blur-xl
          border border-white/10
          text-slate-400 text-[11px] font-mono
          shadow-lg shadow-black/60
          select-none
        ">
          3D Digital Twin • Drag to orbit • Scroll to zoom
        </div>
      </div>
    </motion.div>
  );
}

