import Map3D from "@/components/Map3D";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-background">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-80 flex-shrink-0 border-r bg-card p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-2">UrbanChill AI</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pre-Heat Prevention & Urban Intelligence
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-medium">UHI Detection</h2>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-red-500">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Heat traps detected in 12 neighborhoods.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium">Intervention Scenarios</h2>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <p className="text-xs text-muted-foreground">Select a region on the map to run cool roof and tree canopy simulations.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative h-full">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded shadow px-4 py-2 text-sm font-medium">
          3D Thermal Twin View
        </div>
        <Map3D />
      </main>
    </div>
  );
}
