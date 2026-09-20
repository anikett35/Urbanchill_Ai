'use client';

import dynamic from 'next/dynamic';

// Three.js requires the browser DOM — must be dynamically imported with ssr:false
// This must be a client component (the 'use client' directive above) for ssr:false to work
// in Next.js App Router.
const GlobeLandingPage = dynamic(
  () => import('@/components/landing/GlobeLandingPage'),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#020817' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading UrbanChill AI…</p>
        </div>
      </div>
    ),
  }
);

export default function GlobePage() {
  return <GlobeLandingPage />;
}

