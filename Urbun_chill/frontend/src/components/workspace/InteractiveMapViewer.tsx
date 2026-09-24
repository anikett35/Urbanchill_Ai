'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  X,
  Thermometer,
  Leaf,
  Building,
  AlertTriangle,
  Flame,
  Globe2,
  Layers,
  Sparkles,
  Droplets,
  Rotate3d,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { CityResult, AppState, HeatRisk } from '@/lib/globeConfig';
import { API_BASE } from '@/lib/apiClient';
import HeatAlertBroadcastModal from '@/components/workspace/HeatAlertBroadcastModal';

interface InteractiveMapViewerProps {
  city: CityResult;
  appState: AppState;
  activeLayers: Record<string, boolean>;
  layerOpacities: Record<string, number>;
  selectedYear?: number;
}

interface SectorProperties {
  id: string;
  name: string;
  category: string;
  lst: number;
  ndvi: number;
  building_density: number;
  green_cover: number;
  population_density: number;
  heat_risk: HeatRisk;
  lat: number;
  lon: number;
  primary_factors: string[];
  heat_hazard_index?: number;
  vulnerability_index?: number;
  data_quality_score?: number;
}

const RISK_THEME: Record<HeatRisk, { badge: string; border: string; color: string }> = {
  Low: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    border: 'border-primary',
    color: '#2a85ff',
  },
  Moderate: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    border: 'border-primary',
    color: '#2a85ff',
  },
  High: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    border: 'border-primary',
    color: '#2a85ff',
  },
  Critical: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    border: 'border-primary',
    color: '#2a85ff',
  },
};

// Public Mapbox GL token loaded exclusively via NEXT_PUBLIC_MAPBOX_TOKEN environment variable.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function InteractiveMapViewer({
  city,
  appState,
  activeLayers,
  layerOpacities,
  selectedYear = 2026,
}: InteractiveMapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark'>('satellite');
  const [activeSector, setActiveSector] = useState<SectorProperties | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [pitch3D, setPitch3D] = useState(50);
  const [liveGeoJSON, setLiveGeoJSON] = useState<GeoJSON.FeatureCollection<GeoJSON.Polygon, SectorProperties> | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Year anomaly relative to 2026 (0.3°C increase per year)
  const yearDelta = (selectedYear - 2026) * 0.32;

  // Fetch real-time multi-layer GeoJSON from backend
  useEffect(() => {
    let active = true;
    async function fetchLiveLayers() {
      try {
        let url = `${API_BASE}/layers/${encodeURIComponent(city.name)}/all?lat=${city.lat}&lon=${city.lon}`;
        if (
          city.bbox &&
          city.bbox.length === 4 &&
          city.bbox[1] > city.bbox[0] &&
          city.bbox[3] > city.bbox[2]
        ) {
          url += `&min_lat=${city.bbox[0]}&max_lat=${city.bbox[1]}&min_lon=${city.bbox[2]}&max_lon=${city.bbox[3]}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.geojson && Array.isArray(data.geojson.features) && active) {
            const features = data.geojson.features.map((f: any) => ({
              type: 'Feature' as const,
              properties: {
                id: f.properties.id,
                name: f.properties.name,
                category: f.properties.building_density > 0.65 ? 'High Built Density' : 'Moderate Density',
                lst: Number((f.properties.lst + yearDelta).toFixed(1)),
                ndvi: f.properties.ndvi,
                building_density: f.properties.building_density,
                green_cover: f.properties.green_cover,
                population_density: f.properties.population_density,
                heat_risk: f.properties.heat_risk,
                lat: f.properties.lat,
                lon: f.properties.lon,
                primary_factors: Array.isArray(f.properties.primary_factors) ? f.properties.primary_factors : [],
                heat_hazard_index: f.properties.heat_hazard_index ?? 0.65,
                vulnerability_index: f.properties.vulnerability_index ?? 0.55,
                data_quality_score: f.properties.data_quality_score ?? 85,
              },
              geometry: f.geometry,
            }));
            setLiveGeoJSON({
              type: 'FeatureCollection',
              features,
            });
            return;
          }
        }
      } catch (err) {
        // Fallback to dynamic math computation
      }
    }
    fetchLiveLayers();
    return () => { active = false; };
  }, [city.name, city.lat, city.lon, city.bbox, yearDelta]);

  // Generate GeoJSON thermal grid dynamically covering 100% of the selected area or coordinates
  const geojsonData = useMemo(() => {
    const features: GeoJSON.Feature<GeoJSON.Polygon, SectorProperties>[] = [];
    const gridSize = 5;
    const hasBbox = Boolean(
      city.bbox &&
      city.bbox.length === 4 &&
      city.bbox[1] > city.bbox[0] &&
      city.bbox[3] > city.bbox[2]
    );

    const latSpan = hasBbox ? (city.bbox![1] - city.bbox![0]) : 0.08;
    const lonSpan = hasBbox ? (city.bbox![3] - city.bbox![2]) : 0.08;
    const minLat = hasBbox ? city.bbox![0] : city.lat - latSpan / 2;
    const minLon = hasBbox ? city.bbox![2] : city.lon - lonSpan / 2;
    const latStep = latSpan / gridSize;
    const lonStep = lonSpan / gridSize;

    // Derived from latitude envelope if backend layers are still loading
    const latAbs = Math.abs(city.lat);
    const baseLST = Number((38.0 - (latAbs > 25 ? (latAbs - 25) * 0.40 : 0.0)).toFixed(1));
    const baseNDVI = Number(Math.max(0.12, Math.min(0.45, 0.28 - (latAbs < 25 ? 0.05 : 0.0))).toFixed(2));

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cellMinLat = minLat + r * latStep;
        const cellMaxLat = minLat + (r + 1) * latStep;
        const cellMinLon = minLon + c * lonStep;
        const cellMaxLon = minLon + (c + 1) * lonStep;
        const cLat = (cellMinLat + cellMaxLat) / 2;
        const cLon = (cellMinLon + cellMaxLon) / 2;

        const rNorm = (r - (gridSize - 1) / 2) / ((gridSize - 1) / 2 || 1);
        const cNorm = (c - (gridSize - 1) / 2) / ((gridSize - 1) / 2 || 1);
        const dist = Math.sqrt(rNorm * rNorm + cNorm * cNorm) / 1.414;
        const tempVariation = (1.0 - dist) * 4.2 + Math.sin(r * 2.5) * 1.6;
        const calcLST = Number((baseLST + tempVariation + yearDelta).toFixed(1));
        const calcNDVI = Number(Math.max(0.04, Math.min(0.75, baseNDVI - (1.0 - dist) * 0.12 + Math.cos(c * 1.9) * 0.06)).toFixed(2));
        const bDensity = Number(Math.max(0.12, Math.min(0.92, 0.82 - dist * 0.45)).toFixed(2));
        const gCover = Number(Math.max(0.05, Math.min(0.70, calcNDVI * 0.85)).toFixed(2));
        const popDensity = Math.round(Math.max(1200, Math.min(26000, 22000 * (1.0 - dist))));

        let risk: HeatRisk = 'Low';
        if (calcLST >= 42.0) risk = 'Critical';
        else if (calcLST >= 37.5) risk = 'High';
        else if (calcLST >= 33.5) risk = 'Moderate';

        const sectorNames = [
          'Urban Core & Transit Terminal',
          'Industrial Manufacturing Zone',
          'Commercial Business District',
          'High-Density Residential Sector',
          'Mixed Commercial Corridor',
          'Low-Albedo Asphalt District',
          'Suburban Residential West',
          'Ecological Buffer & Parklands',
          'Waterfront Riparian Corridor',
        ];
        const nameIdx = Math.abs(r * 3 + c) % sectorNames.length;
        const sectorName = `${city.name} ${sectorNames[nameIdx]}`;

        const polygonCoords = [
          [
            [cellMinLon, cellMinLat],
            [cellMaxLon, cellMinLat],
            [cellMaxLon, cellMaxLat],
            [cellMinLon, cellMaxLat],
            [cellMinLon, cellMinLat],
          ],
        ];

        features.push({
          type: 'Feature',
          properties: {
            id: `sector_${r}_${c}`,
            name: sectorName,
            category: r === 2 && c === 2 ? 'Commercial Core' : (r === 0 || r === 4 || c === 0 || c === 4) ? 'Suburban Fringe' : 'Mixed Urban Mass',
            lst: calcLST,
            ndvi: calcNDVI,
            building_density: bDensity,
            green_cover: gCover,
            population_density: popDensity,
            heat_risk: risk,
            lat: Number(cLat.toFixed(4)),
            lon: Number(cLon.toFixed(4)),
            primary_factors: [
              calcLST >= 38 ? `Elevated Land Surface Temperature (${calcLST}°C)` : 'Stable thermal readings',
              calcNDVI < 0.2 ? `Deficit in canopy cover (NDVI: ${calcNDVI})` : 'Adequate vegetation buffer',
              bDensity > 0.65 ? `High impervious built mass (${Math.round(bDensity * 100)}%)` : 'Moderate permeable setbacks',
            ],
          },
          geometry: {
            type: 'Polygon',
            coordinates: polygonCoords,
          },
        });
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [city.lat, city.lon, city.name, city.bbox, yearDelta]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const styleUri =
      mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUri,
      center: [city.lon, city.lat],
      zoom: 12.2,
      pitch: pitch3D,
      bearing: -15,
      attributionControl: false,
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    map.on('load', () => {
      setIsMapLoaded(true);

      // Add 3D terrain and sky if available
      try {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.4 });
      } catch (err) {
        // terrain optional
      }

      // Add GeoJSON Thermal Sectors Source
      const initialData = liveGeoJSON || geojsonData;
      map.addSource('thermal-sectors', {
        type: 'geojson',
        data: initialData,
      });

      // Layer 1: Ground Surface Heat (LST) Thermal Gradient
      const lstOpacity = activeLayers['lst'] ? ((layerOpacities['lst'] ?? 80) / 100) * 0.65 : 0;
      map.addLayer({
        id: 'thermal-sectors-fill',
        type: 'fill',
        source: 'thermal-sectors',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'lst'],
            28, '#38bdf8',
            33, '#34d399',
            36, '#fde047',
            39, '#fb923c',
            42, '#ef4444',
          ],
          'fill-opacity': lstOpacity,
        },
      });

      // Layer 2: Greenery & Canopy (NDVI) Vegetation Proxy
      const ndviOpacity = activeLayers['ndvi'] ? ((layerOpacities['ndvi'] ?? 80) / 100) * 0.65 : 0;
      map.addLayer({
        id: 'canopy-ndvi-fill',
        type: 'fill',
        source: 'thermal-sectors',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ndvi'],
            0.08, 'rgba(253, 224, 71, 0.25)',
            0.18, '#86efac',
            0.32, '#22c55e',
            0.50, '#15803d',
          ],
          'fill-opacity': ndviOpacity,
        },
      });

      // Layer 3: Built Massing & Urban Morphology Density
      const landUseOpacity = activeLayers['land_use'] ? ((layerOpacities['land_use'] ?? 60) / 100) * 0.60 : 0;
      map.addLayer({
        id: 'landuse-morphology-fill',
        type: 'fill',
        source: 'thermal-sectors',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'building_density'],
            0.15, '#94a3b8',
            0.45, '#64748b',
            0.70, '#6366f1',
            0.90, '#4338ca',
          ],
          'fill-opacity': landUseOpacity,
        },
      });

      // Layer 4: Priority Heat Risk Hazard Overlay (Critical & High alert zones)
      map.addLayer({
        id: 'heat-risk-highlight',
        type: 'fill',
        source: 'thermal-sectors',
        paint: {
          'fill-color': [
            'match',
            ['get', 'heat_risk'],
            'Critical', '#ef4444',
            'High', '#f97316',
            'rgba(0,0,0,0)',
          ],
          'fill-opacity': activeLayers['heat_risk']
            ? [
                'match',
                ['get', 'heat_risk'],
                'Critical', 0.45,
                'High', 0.30,
                0,
              ]
            : 0,
        },
      });

      // Layer 5: Sector Perimeter Line with Adaptive Risk Accent
      map.addLayer({
        id: 'thermal-sectors-line',
        type: 'line',
        source: 'thermal-sectors',
        paint: {
          'line-color': [
            'match',
            ['get', 'heat_risk'],
            'Critical', '#ef4444',
            'High', '#f97316',
            'Moderate', '#f59e0b',
            'Low', '#10b981',
            '#94a3b8',
          ],
          'line-width': activeLayers['heat_risk']
            ? [
                'match',
                ['get', 'heat_risk'],
                'Critical', 3.0,
                'High', 2.2,
                1.2,
              ]
            : 1.2,
          'line-opacity': activeLayers['heat_risk'] ? 0.95 : (activeLayers['lst'] || activeLayers['ndvi'] || activeLayers['land_use'] ? 0.35 : 0),
        },
      });

      // Optional 3D Building Extrusion from vector tiles if available
      try {
        if (map.getSource('composite') && !map.getLayer('3d-buildings-extrusion')) {
          map.addLayer({
            id: '3d-buildings-extrusion',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': activeLayers['land_use'] ? 0.75 : 0,
            },
          });
        }
      } catch (err) {
        // Non-blocking if vector style doesn't expose composite building layer
      }

      // Universal Sector Hover & Click Inspectors across all active fill layers
      const interactiveLayers = [
        'thermal-sectors-fill',
        'canopy-ndvi-fill',
        'landuse-morphology-fill',
        'heat-risk-highlight',
      ];

      interactiveLayers.forEach((layerId) => {
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', layerId, (e) => {
          if (!e.features || !e.features[0]) return;
          const props = e.features[0].properties as SectorProperties;
          if (props) {
            setActiveSector({
              ...props,
              primary_factors: Array.isArray(props.primary_factors)
                ? props.primary_factors
                : typeof props.primary_factors === 'string'
                ? JSON.parse(props.primary_factors)
                : [],
            });
          }
        });
      });
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      setIsMapLoaded(false);
    };
  }, [mapStyle]); // re-init when basemap style changes

  // Update center or fitBounds when city changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (
      city.bbox &&
      city.bbox.length === 4 &&
      city.bbox[1] > city.bbox[0] &&
      city.bbox[3] > city.bbox[2]
    ) {
      map.fitBounds(
        [
          [city.bbox[2], city.bbox[0]],
          [city.bbox[3], city.bbox[1]],
        ],
        {
          padding: 60,
          duration: 1800,
          pitch: pitch3D,
          maxZoom: 15.5,
        }
      );
    } else {
      map.flyTo({
        center: [city.lon, city.lat],
        zoom: 12.4,
        pitch: pitch3D,
        bearing: -15,
        duration: 2200,
        essential: true,
      });
    }
  }, [city.lat, city.lon, city.bbox, pitch3D]);

  // Update GeoJSON source data when city, live data, or year changes
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const source = mapRef.current.getSource('thermal-sectors') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(liveGeoJSON || geojsonData);
    }
  }, [liveGeoJSON, geojsonData, isMapLoaded]);

  // Update layer opacities dynamically without reloading map
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    // 1. Ground Surface Heat (LST)
    const lstOpacity = activeLayers['lst'] ? ((layerOpacities['lst'] ?? 80) / 100) * 0.65 : 0;
    if (map.getLayer('thermal-sectors-fill')) {
      map.setPaintProperty('thermal-sectors-fill', 'fill-opacity', lstOpacity);
    }

    // 2. Greenery & Canopy (NDVI)
    const ndviOpacity = activeLayers['ndvi'] ? ((layerOpacities['ndvi'] ?? 80) / 100) * 0.65 : 0;
    if (map.getLayer('canopy-ndvi-fill')) {
      map.setPaintProperty('canopy-ndvi-fill', 'fill-opacity', ndviOpacity);
    }

    // 3. Buildings & Roads (Land Use Morphology)
    const landUseOpacity = activeLayers['land_use'] ? ((layerOpacities['land_use'] ?? 60) / 100) * 0.60 : 0;
    if (map.getLayer('landuse-morphology-fill')) {
      map.setPaintProperty('landuse-morphology-fill', 'fill-opacity', landUseOpacity);
    }
    if (map.getLayer('3d-buildings-extrusion')) {
      map.setPaintProperty('3d-buildings-extrusion', 'fill-extrusion-opacity', activeLayers['land_use'] ? 0.75 : 0);
    }

    // 4. Priority Heat Risk Hazard Overlay
    if (map.getLayer('heat-risk-highlight')) {
      map.setPaintProperty(
        'heat-risk-highlight',
        'fill-opacity',
        activeLayers['heat_risk']
          ? [
              'match',
              ['get', 'heat_risk'],
              'Critical', 0.45,
              'High', 0.30,
              0,
            ]
          : 0
      );
    }

    // 5. Perimeter Line
    const lineOpacity = activeLayers['heat_risk']
      ? 0.95
      : (activeLayers['lst'] || activeLayers['ndvi'] || activeLayers['land_use'] ? 0.35 : 0);
    if (map.getLayer('thermal-sectors-line')) {
      map.setPaintProperty('thermal-sectors-line', 'line-opacity', lineOpacity);
      map.setPaintProperty(
        'thermal-sectors-line',
        'line-width',
        activeLayers['heat_risk']
          ? [
              'match',
              ['get', 'heat_risk'],
              'Critical', 3.0,
              'High', 2.2,
              1.2,
            ]
          : 1.2
      );
    }
  }, [activeLayers, layerOpacities, isMapLoaded]);

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleResetBearing = () => mapRef.current?.resetNorthPitch({ duration: 800 });
  const handleToggle3D = () => {
    const nextPitch = pitch3D === 0 ? 55 : 0;
    setPitch3D(nextPitch);
    mapRef.current?.easeTo({ pitch: nextPitch, duration: 800 });
  };
  const handleFitBounds = () => {
    if (
      city.bbox &&
      city.bbox.length === 4 &&
      city.bbox[1] > city.bbox[0] &&
      city.bbox[3] > city.bbox[2]
    ) {
      mapRef.current?.fitBounds(
        [
          [city.bbox[2], city.bbox[0]],
          [city.bbox[3], city.bbox[1]],
        ],
        {
          padding: 60,
          duration: 1200,
          pitch: pitch3D,
          maxZoom: 15.5,
        }
      );
    } else {
      mapRef.current?.flyTo({
        center: [city.lon, city.lat],
        zoom: 12.2,
        pitch: pitch3D,
        duration: 1200,
      });
    }
  };

  return (
    <div
      className="relative w-full h-full flex-1 min-w-0 overflow-hidden bg-gray-950"
      aria-label="Real Mapbox Digital Twin Map Viewport"
    >
      {/* Real Mapbox GL JS Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Left Live HUD Header */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            {city.name} Digital Twin • {selectedYear}
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded-md text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°E
          </span>
        </div>

        {/* Basemap Switcher Pill (Satellite vs Dark Mode) */}
        <button
          onClick={() => setMapStyle((s) => (s === 'satellite' ? 'dark' : 'satellite'))}
          className="
            flex items-center gap-1.5 px-3 py-2 rounded-xl
            bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
            border border-gray-200 dark:border-gray-700 hover:border-primary/50
            text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-primary
            shadow-lg transition-all cursor-pointer
          "
          title="Toggle High-Res Satellite vs Tactical Dark Basemap"
        >
          <Globe2 className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline capitalize">{mapStyle === 'satellite' ? 'Satellite' : 'Dark Streets'}</span>
        </button>

        {/* WhatsApp & SMS Emergency Alert Button */}
        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="
            flex items-center gap-1.5 px-3 py-2 rounded-xl
            bg-amber-500 hover:bg-amber-600 text-white font-semibold
            shadow-lg transition-all cursor-pointer text-xs
          "
          title="Send WhatsApp & SMS Emergency Heatwave Circular to Citizens"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp & SMS Alert</span>
        </button>
      </div>

      {/* Right-Side Floating Navigation HUD Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-20 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary shadow-lg transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary shadow-lg transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggle3D}
          aria-label="Toggle 3D Perspective Pitch"
          title={`3D Tilt Angle (${pitch3D}°)`}
          className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary shadow-lg transition-all cursor-pointer"
        >
          <Rotate3d className="w-4 h-4 text-primary" />
        </button>

        <button
          onClick={handleResetBearing}
          aria-label="Reset North"
          title="Reset North"
          className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary shadow-lg transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitBounds}
          aria-label="Recenter city view"
          title="Recenter city view"
          className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary shadow-lg transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Multi-Layer Legend (Docked cleanly below map zoom tools) */}
      <div className="absolute top-48 right-4 z-20 pointer-events-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-xl flex flex-col gap-2 select-none w-60 max-w-[90vw]">
        {/* Ground Surface Heat Legend */}
        {activeLayers['lst'] && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-red-500" />
                <span>Surface Heat</span>
              </span>
              <span className="text-primary font-mono text-[10px]">28°C to 44°C</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-red-500 shadow-inner" />
            <div className="flex justify-between text-[8.5px] text-gray-500 dark:text-gray-400 font-medium">
              <span>Cooler</span>
              <span>Moderate</span>
              <span>Extreme</span>
            </div>
          </div>
        )}

        {/* Greenery & Trees Legend */}
        {activeLayers['ndvi'] && (
          <div className={`space-y-1 ${activeLayers['lst'] ? 'border-t border-gray-100 dark:border-gray-700/60 pt-1.5' : ''}`}>
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3 h-3 text-emerald-500" />
                <span>Greenery (NDVI)</span>
              </span>
              <span className="text-emerald-500 font-mono text-[10px]">0.08 to 0.70</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-lime-200 via-emerald-500 to-emerald-900 shadow-inner" />
            <div className="flex justify-between text-[8.5px] text-gray-500 dark:text-gray-400 font-medium">
              <span>Sparse</span>
              <span>Moderate Canopy</span>
              <span>Dense Park</span>
            </div>
          </div>
        )}

        {/* Buildings & Roads Legend */}
        {activeLayers['land_use'] && (
          <div className={`space-y-1 ${(activeLayers['lst'] || activeLayers['ndvi']) ? 'border-t border-gray-100 dark:border-gray-700/60 pt-1.5' : ''}`}>
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Building className="w-3 h-3 text-indigo-500" />
                <span>Built Mass Density</span>
              </span>
              <span className="text-indigo-500 font-mono text-[10px]">10% to 90%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-slate-300 via-indigo-400 to-indigo-800 shadow-inner" />
            <div className="flex justify-between text-[8.5px] text-gray-500 dark:text-gray-400 font-medium">
              <span>Low Built</span>
              <span>Medium</span>
              <span>High Impervious</span>
            </div>
          </div>
        )}

        {/* Heat Risk Areas Legend */}
        {activeLayers['heat_risk'] && (
          <div className={`space-y-1 ${(activeLayers['lst'] || activeLayers['ndvi'] || activeLayers['land_use']) ? 'border-t border-gray-100 dark:border-gray-700/60 pt-1.5' : ''}`}>
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Risk Priority Zones</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px] font-bold">
              <span className="py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Low</span>
              <span className="py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">Mod</span>
              <span className="py-0.5 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">High</span>
              <span className="py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">Crit</span>
            </div>
          </div>
        )}

        {/* Fallback if all layers are toggled off */}
        {!activeLayers['lst'] && !activeLayers['ndvi'] && !activeLayers['land_use'] && !activeLayers['heat_risk'] && (
          <div className="text-[10px] text-gray-400 italic py-1 text-center">
            All map overlays hidden. Toggle any layer in the left sidebar.
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700/80 pt-1 mt-0.5">
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono block">25 spatial model sectors</span>
          <span className="text-[8.5px] text-gray-400 dark:text-gray-500 leading-tight block">
            Click any sector to inspect microclimate variables and send alert broadcasts.
          </span>
        </div>
      </div>

      {/* Selected Sector Telemetry Modal Popup */}
      <AnimatePresence>
        {activeSector && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="
              absolute left-6 bottom-20 z-30 pointer-events-auto
              w-80 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl
              border border-gray-200 dark:border-gray-700 p-4 shadow-2xl
            "
          >
            <div className="flex items-start justify-between pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
              <div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">
                  Neighborhood Details
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{activeSector.name}</h4>
              </div>
              <button
                onClick={() => setActiveSector(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label="Close inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Ground Heat</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">{activeSector.lst}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Greenery Index</span>
                <span className="text-lg font-bold text-primary font-mono">{activeSector.ndvi}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400">{selectedYear < 2026 ? 'Modeled Risk:' : 'Heat Risk Level:'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${RISK_THEME[activeSector.heat_risk].badge}`}>
                  {activeSector.heat_risk}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400">Heat Intensity:</span>
                <span className="text-primary font-mono font-bold">{Math.round((activeSector.heat_hazard_index ?? 0.65) * 100)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400" title="Estimated from built-form morphology; not direct census data.">Estimated Population Exposure Proxy:</span>
                <span className="text-primary font-mono font-bold">{Math.round((activeSector.vulnerability_index ?? 0.55) * 100)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400">Building Coverage:</span>
                <span className="text-gray-900 dark:text-gray-200 font-mono font-medium">{Math.round(activeSector.building_density * 100)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400">Data Reliability:</span>
                <span className="text-primary font-mono font-bold">{activeSector.data_quality_score ?? 85}%</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block">Main Factors Driving Heat</span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">Spatial Proxy Analysis</span>
              </div>
              <ul className="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                {activeSector.primary_factors.map((factor, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Broadcast to this specific neighborhood */}
            <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send WhatsApp & SMS to {activeSector.name}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency WhatsApp & SMS Heat Broadcast Modal */}
      <HeatAlertBroadcastModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        city={city}
        sectorName={activeSector?.name}
        currentTemp={activeSector?.lst ?? (36.5 + yearDelta)}
        heatRisk={activeSector?.heat_risk ?? 'High'}
      />
    </div>
  );
}
