"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, TrendingDown, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeatureCard from '@/components/ui/FeatureCard';

export default function CleanLandingPage() {
  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-red-500/20">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Enterprise Grade Platform
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-slate-900"
                >
                  Data-driven cooling for <span className="text-red-500">modern cities.</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-600 mb-8"
                >
                  Equip your municipality with actionable intelligence to combat urban heat islands. Trusted by leading city planners and environmental agencies.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button className="px-8 py-3.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                    Request Demo
                  </button>
                  <button className="px-8 py-3.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                    Read the Whitepaper
                  </button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-10 flex items-center gap-4 text-sm text-slate-500"
                >
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <p>Trusted by 100+ municipalities</p>
                </motion.div>
              </div>

              {/* Dashboard Mockup */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-red-500/5 blur-3xl transform -rotate-6 rounded-[3rem]" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[4/3] flex flex-col">
                    <div className="h-10 border-b border-slate-200 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-4">
                      <div className="h-8 bg-slate-200 rounded w-1/3" />
                      <div className="flex gap-4">
                        <div className="h-32 bg-slate-200 rounded flex-1" />
                        <div className="h-32 bg-slate-200 rounded flex-1" />
                      </div>
                      <div className="h-48 bg-slate-200 rounded w-full mt-auto" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="p-4">
                <p className="text-4xl font-bold text-slate-900 mb-2">2.4°C</p>
                <p className="text-slate-600">Average Temp Reduction</p>
              </div>
              <div className="p-4">
                <p className="text-4xl font-bold text-slate-900 mb-2">50+</p>
                <p className="text-slate-600">Cities Monitored</p>
              </div>
              <div className="p-4">
                <p className="text-4xl font-bold text-slate-900 mb-2">1M+</p>
                <p className="text-slate-600">Data Points Daily</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Urban Analytics</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to analyze, plan, and deploy heat mitigation strategies effectively.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                title="Policy Planning"
                description="Align mitigation strategies with city policies and zoning regulations seamlessly."
                icon={<Building2 className="w-6 h-6" />}
                glowColor="rgba(239, 68, 68, 0.05)"
                className="bg-white border-slate-200 shadow-sm hover:shadow-md"
              />
              <FeatureCard 
                title="Impact Tracking"
                description="Monitor the real-time cooling effects of new green spaces and infrastructure."
                icon={<TrendingDown className="w-6 h-6" />}
                glowColor="rgba(239, 68, 68, 0.05)"
                className="bg-white border-slate-200 shadow-sm hover:shadow-md"
              />
              <FeatureCard 
                title="Community Engagement"
                description="Share simplified heat maps with citizens to raise awareness and support."
                icon={<Users className="w-6 h-6" />}
                glowColor="rgba(239, 68, 68, 0.05)"
                className="bg-white border-slate-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
