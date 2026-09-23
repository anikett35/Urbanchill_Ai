'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CityResult } from '@/lib/globeConfig';
import HierarchicalLocationSelector from '@/components/landing/HierarchicalLocationSelector';

interface LandingOverlayProps {
  visible: boolean;
  onCitySelected: (city: CityResult) => void;
}

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
          className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4 py-6"
          aria-label="UrbanChill AI landing"
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-auto w-full max-w-xl bg-gray-900/90 backdrop-blur-2xl rounded-2xl border border-gray-700/80 shadow-2xl p-6 sm:p-7 text-center my-auto space-y-4"
          >
            {/* ── Brand Header ────────────────────────────────────────────── */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Urban Climate Intelligence
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-gray-100 mb-1.5">
                UrbanChill{' '}
                <span className="text-primary">AI</span>
              </h1>

              <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Explore real surface temperatures, tree canopy coverage, and heat risk for any country, state, district, taluka, or neighborhood.
              </p>
            </div>

            {/* ── Minimal Search & Region Selector ────────────────────────── */}
            <HierarchicalLocationSelector onLocationSelected={onCitySelected} />
          </motion.div>

          <motion.p
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none mt-4 text-gray-400 text-xs font-mono tracking-widest uppercase select-none"
          >
            Drag to rotate globe • Scroll to zoom • Or select an area above
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
