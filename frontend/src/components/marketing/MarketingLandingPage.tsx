'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  Thermometer,
  Leaf,
  Cpu,
  Building2,
  Play,
  Sparkles,
  Compass,
} from 'lucide-react';
import MarketingHeader from './MarketingHeader';
import MarketingFooter from './MarketingFooter';

const HeroGlobeBackground = dynamic(() => import('./HeroGlobeBackground'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#070D18] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-red-500 animate-spin" />
        <p className="text-slate-400 text-xs font-mono">Loading 3D Earth…</p>
      </div>
    </div>
  ),
});

export default function MarketingLandingPage() {
  const PROCESS_STEPS = [
    {
      num: '01',
      title: 'Search or select a city',
      desc: 'Fly to any global municipal boundary or pinpoint exact coordinates on the 3D digital twin.',
    },
    {
      num: '02',
      title: 'Pull satellite imagery',
      desc: 'Ingest multispectral Landsat-8 and Sentinel-2 telemetry bands via Google Earth Engine pipelines.',
    },
    {
      num: '03',
      title: 'Calculate & predict',
      desc: 'Process Land Surface Temperature (LST), NDVI indices, and Random Forest machine learning models.',
    },
    {
      num: '04',
      title: 'Plan & export',
      desc: 'Simulate urban canopy and cool roof interventions, and export comprehensive spatial impact reports.',
    },
  ];

  const CAPABILITIES = [
    {
      icon: <Thermometer className="w-5 h-5 text-[#E24E1B]" />,
      tint: 'bg-[#FBE7DD] border-[#E24E1B]/20',
      title: 'Multispectral Thermal Mapping',
      desc: 'Sub-pixel Land Surface Temperature (LST) derived from thermal infrared satellite sensors to detect micro-urban heat islands.',
    },
    {
      icon: <Leaf className="w-5 h-5 text-[#1E7A52]" />,
      tint: 'bg-[#DEEFE5] border-[#1E7A52]/20',
      title: 'Vegetation & Canopy Density',
      desc: 'Normalized Difference Vegetation Index (NDVI) tracking to quantify shade deficits in vulnerable neighborhoods.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#2E5FA3]" />,
      tint: 'bg-[#E2EDFB] border-[#2E5FA3]/20',
      title: 'Random Forest Risk Forecasts',
      desc: 'AI spatial regression models trained on multi-decade climate data to predict heatwave intensity up to 14 days ahead.',
    },
    {
      icon: <Building2 className="w-5 h-5 text-[#D97706]" />,
      tint: 'bg-[#FEF3C7] border-[#D97706]/20',
      title: 'What-If Cooling Simulations',
      desc: 'Simulate the microclimate temperature reduction from adding 20% urban tree canopy or high-albedo cool roofs.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#16241F] font-sans antialiased selection:bg-[#FBE7DD] selection:text-[#E24E1B]">
      {/* ── Sticky Header ── */}
      <MarketingHeader />

      <main>
        {/* ── Hero Section with 3D Earth Background (Untouched per constraint) ── */}
        <section className="relative min-h-[660px] lg:min-h-[740px] flex items-center overflow-hidden bg-[#070D18] text-white">
          {/* 3D Earth Globe spanning the background */}
          <HeroGlobeBackground />

          {/* Foreground Hero Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl space-y-7 text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[#FBE7DD] text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E24E1B] animate-pulse" />
                Geo-Intelligent Digital Twin
              </div>

              {/* H1 Headline in Display Serif */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
                See the heat before it{' '}
                <span className="text-[#E24E1B]">settles in.</span>
              </h1>

              {/* Subcopy */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl text-pretty">
                Empower municipal planning with continuous satellite thermal analytics. Model land surface temperatures, project microclimate heat islands, and simulate targeted cooling interventions before breaking ground.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/globe"
                  className="
                    inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl
                    bg-[#E24E1B] hover:bg-[#c93f12]
                    text-white text-sm font-semibold
                    shadow-lg shadow-[#E24E1B]/30 hover:shadow-xl hover:shadow-[#E24E1B]/45
                    transition-all duration-150
                    group
                  "
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  className="
                    inline-flex items-center gap-2 px-5 py-3.5 rounded-xl
                    bg-white/5 hover:bg-white/10
                    border border-white/15 hover:border-white/30
                    text-white text-sm font-medium
                    backdrop-blur-md
                    transition-all duration-150
                  "
                >
                  <Play className="w-3.5 h-3.5 text-slate-300 fill-slate-300" />
                  <span>Watch a 90s demo →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom subtle instruction badge (Constraint: stays as-is) */}
          <div className="absolute bottom-5 right-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400 select-none pointer-events-none">
            <Compass className="w-3 h-3 text-[#E24E1B]" />
            <span>Interactive 3D Earth • Drag to orbit • Scroll to zoom</span>
          </div>
        </section>

        {/* ── Process Strip Section (Rich Grid & Mesh Background) ── */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F5] border-y border-[#E1DFD6] overflow-hidden">
          {/* Subtle architectural dot grid background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#C8C5B8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Soft atmospheric corner glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E24E1B]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1E7A52]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto space-y-12">
            {/* Left-aligned Header */}
            <div className="max-w-2xl text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#1E7A52]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A52]" />
                How It Works
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#16241F] tracking-tight">
                From orbit to municipal action in four streamlined stages
              </h2>
            </div>

            {/* 4-Column Numbered Sequence with elevated card styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="
                    relative p-7 rounded-2xl bg-white/90 backdrop-blur-sm
                    border border-[#E1DFD6] shadow-[0_4px_20px_-4px_rgba(22,36,31,0.06),0_1px_3px_rgba(22,36,31,0.03)]
                    hover:shadow-[0_12px_32px_-4px_rgba(22,36,31,0.12)] hover:border-[#1E7A52]/40
                    transition-all duration-300
                    flex flex-col justify-between
                    group
                  "
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#FBE7DD] border border-[#E24E1B]/20 font-mono text-base font-bold text-[#E24E1B]">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-base text-[#16241F] group-hover:text-[#1E7A52] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#55655D] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Capabilities & Interventions (Subtle Layered Warm Background) ── */}
        <section id="platform" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F6F5F1] via-[#EFECE4] to-[#F6F5F1] border-b border-[#E1DFD6] overflow-hidden">
          {/* Subtle contour ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/40 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-left max-w-3xl mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#2E5FA3]">
                <Sparkles className="w-3.5 h-3.5" />
                Geo-Spatial Capabilities
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#16241F] tracking-tight">
                Science-grade intelligence for resilient urban centers
              </h2>
              <p className="text-sm sm:text-base text-[#55655D] leading-relaxed">
                Every feature is built on validated climate data models, enabling civil engineers, planners, and sustainability teams to collaborate effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.title}
                  className="
                    p-7 rounded-2xl bg-white/90 backdrop-blur-sm
                    border border-[#E1DFD6] shadow-[0_4px_20px_-4px_rgba(22,36,31,0.06),0_1px_3px_rgba(22,36,31,0.03)]
                    hover:shadow-[0_12px_32px_-4px_rgba(22,36,31,0.12)] hover:border-[#2E5FA3]/40
                    transition-all duration-300
                    flex flex-col justify-between space-y-6
                    group
                  "
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${cap.tint} border flex items-center justify-center shadow-xs`}>
                      {cap.icon}
                    </div>
                    <h3 className="font-bold text-base text-[#16241F] leading-snug group-hover:text-[#2E5FA3] transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#55655D] leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── High-Impact Call to Action Banner (Separated from Footer) ── */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#F6F5F1]">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-[#0C1713] via-[#10211A] to-[#08100C] text-white p-10 sm:p-14 md:p-16 relative overflow-hidden shadow-2xl border border-white/10 ring-1 ring-emerald-500/20">
              {/* Subtle GIS wireframe grid & node motif in the right-hand area */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none overflow-hidden hidden md:block">
                <svg viewBox="0 0 400 400" className="w-full h-full text-[#E24E1B]" fill="none" stroke="currentColor">
                  <circle cx="280" cy="200" r="140" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="280" cy="200" r="90" strokeWidth="1" strokeDasharray="2 2" />
                  <ellipse cx="280" cy="200" rx="140" ry="45" strokeWidth="1" />
                  <line x1="280" y1="60" x2="280" y2="340" strokeWidth="1" />
                  <circle cx="280" cy="160" r="4" fill="#E24E1B" />
                  <circle cx="340" cy="220" r="3.5" fill="#1E7A52" />
                  <circle cx="220" cy="210" r="3.5" fill="#2E5FA3" />
                  <circle cx="310" cy="120" r="3" fill="#D97706" />
                </svg>
              </div>

              {/* Ambient radial flare */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E24E1B]/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-[#DEEFE5] backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to Analyze Your City
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Step into the 3D Digital Twin today.
                </h2>
                <p className="text-sm sm:text-base text-[#DCE6E0] leading-relaxed">
                  Experience the full Earth-to-City fly sequence, real-time satellite spectral decomposition, and machine learning risk index for your municipality.
                </p>
                <div className="pt-2">
                  <Link
                    href="/globe"
                    className="
                      inline-flex items-center gap-2.5 px-7 py-4 rounded-xl
                      bg-[#E24E1B] hover:bg-[#c93f12]
                      text-white font-semibold text-sm
                      shadow-xl shadow-[#E24E1B]/35 hover:shadow-2xl hover:shadow-[#E24E1B]/50
                      transition-all duration-150
                      group
                    "
                  >
                    <span>Launch Platform</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Dark Night-Side Footer ── */}
      <MarketingFooter />
    </div>
  );
}
