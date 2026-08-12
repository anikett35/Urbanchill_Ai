"use client";

import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Satellite, CloudRain, Sun } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load the Globe3D component with ssr: false
const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        <p className="text-sm font-medium animate-pulse text-red-500">Loading 3D Engine...</p>
      </div>
    </div>
  ),
});

export default function InteractiveLandingPage() {
  const { scrollYProgress } = useScroll();
  
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const opacity2 = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [0, 1, 0]);
  const x2 = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [100, 0, -100]);

  const opacity3 = useTransform(scrollYProgress, [0.5, 0.7, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.7], [100, 0]);

  return (
    <div className="bg-slate-950 min-h-[300vh] text-slate-50 font-sans selection:bg-red-500/30">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none z-10" />
        <ErrorBoundary>
          <Globe3D />
        </ErrorBoundary>
      </div>

      {/* Scrollytelling Content */}
      <div className="relative z-10 container mx-auto px-4 pt-16 h-full pointer-events-none">
        
        {/* Section 1 */}
        <motion.div 
          style={{ opacity: opacity1, y: y1 }}
          className="h-screen flex items-center justify-center pointer-events-auto"
        >
          <div className="max-w-2xl text-center bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-slate-800/80 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              The Globe is <br/><span className="text-red-500">Heating Up.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Scroll down to explore how UrbanChill AI visualizes global thermal data to help cities adapt to extreme heat.
            </p>
            <div className="animate-bounce">
              <ArrowRight className="w-6 h-6 mx-auto text-red-500 rotate-90" />
            </div>
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div 
          style={{ opacity: opacity2, x: x2 }}
          className="h-screen flex items-center justify-end pointer-events-auto"
        >
          <div className="max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-6">
              <Satellite className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Live Satellite Telemetry</h2>
            <p className="text-slate-300 mb-6">
              We aggregate thousands of data points from low-earth orbit satellites, creating real-time heat maps of every major city on Earth.
            </p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Land Surface Temperature (LST)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Albedo Index Tracking</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Vegetation Density Mapping</li>
            </ul>
          </div>
        </motion.div>

        {/* Section 3 */}
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="h-screen flex items-center justify-start pointer-events-auto"
        >
          <div className="max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <CloudRain className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Predict & Mitigate</h2>
            <p className="text-slate-300 mb-8">
              Use our predictive models to simulate the impact of urban canopies, cool roofs, and wind corridors before deploying resources.
            </p>
            <button className="w-full py-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              Launch Dashboard
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
