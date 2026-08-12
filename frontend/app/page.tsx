import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load the Globe3D component with ssr: false
const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        <p className="text-sm font-medium animate-pulse text-red-100">Initializing 3D Earth...</p>
      </div>
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      {/* Overlay UI */}
      <div className="absolute top-0 left-0 z-10 w-full p-8 pointer-events-none">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
              UrbanChill <span className="text-red-500">AI</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md drop-shadow-sm">
              Geo-intelligent decision support for urban heat island mitigation.
            </p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 max-w-xs text-right shadow-xl">
            <p className="text-sm text-slate-300">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Live Heat Traps Detected
            </p>
            <p className="text-xs text-slate-400 mt-1">Select a glowing marker to enter the planner dashboard.</p>
          </div>
        </header>
      </div>

      {/* 3D Canvas Area */}
      <main className="absolute inset-0 z-0">
        <ErrorBoundary>
          <Globe3D />
        </ErrorBoundary>
      </main>
    </div>
  );
}
