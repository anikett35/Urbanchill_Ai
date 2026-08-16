'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export default function HeroGlobePreview() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="
        relative w-full aspect-[4/3] sm:aspect-[16/11] max-w-xl mx-auto
        rounded-3xl overflow-hidden
        bg-gradient-to-br from-[#101B2E] via-[#0D1627] to-[#080E1A]
        border border-white/10
        shadow-2xl shadow-slate-900/30
        p-6 flex flex-col justify-between
        select-none
      "
    >
      {/* ── Subtle Starfield Background ── */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 60px 110px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 120px 50px, #93c5fd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 180px 170px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 240px 90px, #fef08a, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 310px 220px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 390px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 450px 180px, #93c5fd, rgba(0,0,0,0))
          `,
          backgroundSize: '320px 240px',
        }}
      />

      {/* ── Atmospheric Radial Glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* ── Top Row: Status tag & Top-right Locate Control Preview ── */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Instrument tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
            Live Telemetry
          </span>
        </div>

        {/* Top-right locate control (decorative preview mirroring /globe) */}
        <Link
          href="/globe"
          className="
            group flex flex-col items-end
            p-2 rounded-2xl bg-white/6 hover:bg-white/10
            border border-white/10 hover:border-[#E24E1B]/50
            backdrop-blur-xl
            transition-all duration-200
          "
        >
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300">
            <Search className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span className="text-slate-400 font-mono text-[11px]">Locate city…</span>
            <span className="text-[10px] font-mono px-1 rounded bg-white/10 text-slate-400">/globe</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 mr-1 text-[9px] font-mono text-emerald-400 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Global Feed Active
          </div>
        </Link>
      </div>

      {/* ── Center: Rotating Wireframe Earth Sphere ── */}
      <div className="relative z-0 my-auto flex items-center justify-center pointer-events-none">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full">
          {/* Base Globe Body Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0b1329] via-[#132247] to-[#1e3a8a] shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.25)] border border-blue-400/20" />

          {/* SVG Rotating Lat/Lon Wireframe Grid */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full animate-globe-rotate"
            aria-hidden="true"
          >
            {/* Equator & Latitudes */}
            <ellipse cx="100" cy="100" rx="98" ry="98" fill="none" stroke="rgba(147, 197, 253, 0.25)" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="98" ry="30" fill="none" stroke="rgba(147, 197, 253, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
            <ellipse cx="100" cy="65" rx="88" ry="22" fill="none" stroke="rgba(147, 197, 253, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" />
            <ellipse cx="100" cy="135" rx="88" ry="22" fill="none" stroke="rgba(147, 197, 253, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" />
            
            {/* Longitude Ellipses */}
            <ellipse cx="100" cy="100" rx="32" ry="98" fill="none" stroke="rgba(147, 197, 253, 0.25)" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="68" ry="98" fill="none" stroke="rgba(147, 197, 253, 0.2)" strokeWidth="0.8" />
            <line x1="100" y1="2" x2="100" y2="198" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="0.8" />
            <line x1="2" y1="100" x2="198" y2="100" stroke="rgba(147, 197, 253, 0.35)" strokeWidth="0.8" />
          </svg>

          {/* Glowing Heat Accent Points */}
          <div className="absolute top-[42%] left-[68%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E24E1B] opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E24E1B] shadow-[0_0_10px_#E24E1B]" />
            </span>
          </div>

          <div className="absolute top-[58%] left-[45%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400 shadow-[0_0_8px_#fb923c]" />
            </span>
          </div>

          <div className="absolute top-[32%] left-[34%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Coordinate Readout & Interactive Prompt ── */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/8">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#E24E1B]" />
          <span className="text-[11px] font-mono text-slate-300">
            PUNE, IN • 18.5204° N, 73.8567° E
          </span>
        </div>

        <Link
          href="/globe"
          className="
            flex items-center gap-1 text-xs font-medium text-white/90
            hover:text-[#E24E1B] transition-colors
            group
          "
        >
          <span>Explore 3D Twin</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

