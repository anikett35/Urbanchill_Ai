import * as THREE from 'three';

// ── Globe geometry constants ─────────────────────────────────────────────────

/** three-globe default globe radius (in Three.js scene units) */
export const GLOBE_RADIUS = 100;

/** Camera distance when hovering at "city level" */
export const CITY_CAM_DISTANCE = 112;

/** Camera distance for the initial space view */
export const SPACE_CAM_DISTANCE = 240;

/** Full fly-to animation duration in seconds */
export const FLY_DURATION_SECONDS = 4.2;

/** Shorter duration for city-to-city hops when workspace is already open */
export const HOP_DURATION_SECONDS = 2.0;

// ── Geocoding ────────────────────────────────────────────────────────────────

export const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// ── Types ────────────────────────────────────────────────────────────────────

export type CityResult = {
  name: string;
  lat: number;
  lon: number;
  displayName: string;
};

export type AppState =
  | 'idle_rotating'   // globe rotates, landing overlay visible
  | 'flying'          // camera fly animation in progress
  | 'arrived'         // camera settled; workspace begins sliding in
  | 'analyzing'       // /analyze request in flight; skeleton loaders visible
  | 'workspace_ready'; // full data loaded, all panels populated

export type HeatRisk = 'Low' | 'Moderate' | 'High' | 'Critical';

export type AnalyzeResult = {
  heatRisk: HeatRisk;
  lst: number;         // Land Surface Temperature °C
  ndvi: number;        // 0–1 vegetation index
  uvIndex: number;
  humidity: number;    // %
  airQualityIndex: number;
  recommendations: string[];
  topHeatZones: { name: string; temp: number; risk: HeatRisk }[];
  weeklyForecast: { day: string; maxTemp: number; minTemp: number }[];
};

// ── Coordinate utilities ─────────────────────────────────────────────────────

/**
 * Convert geographic lat/lon to a THREE.Vector3 in three-globe's coordinate
 * system (North Pole at +Y, prime meridian toward –X).
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = GLOBE_RADIUS
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Convert a 3D point on the globe surface back to geographic lat/lon.
 */
export function vector3ToLatLon(
  x: number,
  y: number,
  z: number
): { lat: number; lon: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const ny = y / r;
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, ny))) * (180 / Math.PI);
  const rawLon = (Math.atan2(z / r, -x / r) * (180 / Math.PI)) - 180;
  const lon = rawLon < -180 ? rawLon + 360 : rawLon;
  return { lat, lon };
}

/** Cubic ease-in-out — smooth start and end, faster in the middle */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Globe city data ──────────────────────────────────────────────────────────

/** Urban heat-island hot-spots shown as red dots on the landing globe */
export const GLOBE_CITIES = [
  { name: 'Delhi',      lat: 28.7041,  lng:  77.1025 },
  { name: 'Mumbai',     lat: 19.0760,  lng:  72.8777 },
  { name: 'Bangalore',  lat: 12.9716,  lng:  77.5946 },
  { name: 'Chennai',    lat: 13.0827,  lng:  80.2707 },
  { name: 'Hyderabad',  lat: 17.3850,  lng:  78.4867 },
  { name: 'Ahmedabad',  lat: 23.0225,  lng:  72.5714 },
  { name: 'Pune',       lat: 18.5204,  lng:  73.8567 },
  { name: 'Kolkata',    lat: 22.5726,  lng:  88.3639 },
  { name: 'Dubai',      lat: 25.2048,  lng:  55.2708 },
  { name: 'Riyadh',     lat: 24.7136,  lng:  46.6753 },
  { name: 'Cairo',      lat: 30.0444,  lng:  31.2357 },
  { name: 'Lagos',      lat:  6.5244,  lng:   3.3792 },
  { name: 'Singapore',  lat:  1.3521,  lng: 103.8198 },
  { name: 'Bangkok',    lat: 13.7563,  lng: 100.5018 },
  { name: 'Tokyo',      lat: 35.6762,  lng: 139.6503 },
  { name: 'Phoenix',    lat: 33.4484,  lng: -112.074 },
  { name: 'Miami',      lat: 25.7617,  lng:  -80.192 },
  { name: 'São Paulo',  lat: -23.550,  lng:  -46.633 },
  { name: 'Karachi',    lat: 24.8607,  lng:   67.010 },
  { name: 'Dhaka',      lat: 23.8103,  lng:   90.412 },
];
