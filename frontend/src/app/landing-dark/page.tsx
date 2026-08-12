"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Activity, Thermometer, MapPin, BarChart3, Shield, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeatureCard from '@/components/ui/FeatureCard';

export default function DarkLandingPage() {
  return (
    <div className="dark bg-slate-950 min-h-screen text-slate-50 selection:bg-red-500/30 font-sans selection:text-red-200">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live Heat Island Tracking v2.0
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500"
              >
                Cooling the cities of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">tomorrow.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10"
              >
                UrbanChill AI provides real-time geo-intelligent decision support for urban heat island mitigation. Empowering planners with predictive thermal models.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-500 hover:to-red-400 transition-all shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 group">
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 rounded-full bg-slate-900 border border-slate-700 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  View Demo
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mockup Section */}
        <section className="relative px-4 pb-32">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative rounded-2xl md:rounded-[2rem] border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-2 md:p-4 shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                <div className="text-slate-600 flex flex-col items-center gap-4">
                  <Activity className="w-12 h-12 text-slate-700 animate-pulse" />
                  <p className="text-sm uppercase tracking-widest font-medium">Interactive Map UI Placeholder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-24 px-4 bg-slate-900/50 border-t border-slate-800">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Intelligence for <span className="text-red-500">Urban Planners</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                Our platform aggregates satellite imagery, thermal sensors, and meteorological data to pinpoint critical heat traps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                title="Thermal Mapping" 
                description="High-resolution heat maps generated from live satellite data to identify urban heat islands."
                icon={<Thermometer className="w-6 h-6" />}
                delay={0.1}
              />
              <FeatureCard 
                title="Predictive Models" 
                description="AI-driven forecasts that predict heat wave impacts up to 14 days in advance."
                icon={<Activity className="w-6 h-6" />}
                delay={0.2}
              />
              <FeatureCard 
                title="Zoning Analysis" 
                description="Overlay heat maps with city zoning data to prioritize cooling interventions."
                icon={<MapPin className="w-6 h-6" />}
                delay={0.3}
              />
              <FeatureCard 
                title="Impact Analytics" 
                description="Measure the effectiveness of planted trees and cool roofs over time."
                icon={<BarChart3 className="w-6 h-6" />}
                delay={0.4}
              />
              <FeatureCard 
                title="Data Security" 
                description="Enterprise-grade encryption for all municipal datasets and models."
                icon={<Shield className="w-6 h-6" />}
                delay={0.5}
              />
              <FeatureCard 
                title="Real-time Alerts" 
                description="Automated notifications for critical temperature thresholds in vulnerable neighborhoods."
                icon={<Zap className="w-6 h-6" />}
                delay={0.6}
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
