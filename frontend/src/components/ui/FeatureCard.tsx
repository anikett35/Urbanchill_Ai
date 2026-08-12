"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
  className?: string;
  glowColor?: string;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  delay = 0,
  className = "",
  glowColor = "rgba(239, 68, 68, 0.15)" // Red-500 default glow
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className={`relative group rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 p-6 backdrop-blur-sm transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Hover Glow Effect */}
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)` }}
      />
      
      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
