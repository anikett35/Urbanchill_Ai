/**
 * UrbanChill AI - Unified API Client
 * Connects frontend React components to FastAPI backend services:
 * - /api/analyze (Full city thermal & ML telemetry)
 * - /api/layers (Multi-layer GeoJSON and click-inspection)
 * - /api/timeline (2018-2026 historical time series)
 * - /api/simulate (What-If cooling intervention calculation)
 * - /api/compare (Side-by-side city comparison)
 * - /api/report (ReportLab PDF generation & download)
 * - /api/mlops/status (Model metadata, metrics & drift monitoring)
 *
 * Includes graceful offline fallback when backend is running on alternate ports or restarting.
 */

import type { CityResult, AnalyzeResult, HeatRisk } from './globeConfig';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface SpatialSector {
  id: string;
  row: number;
  col: number;
  lat: number;
  lon: number;
  lst: number;
  ndvi: number;
  building_density: number;
  green_cover: number;
  population_density: number;
  heat_risk: HeatRisk;
  confidence: number;
}

export interface PointInspectionResult {
  latitude: number;
  longitude: number;
  city: string;
  distance_from_center_km: number;
  lst: number;
  ndvi: number;
  building_density: number;
  green_cover_percent: number;
  population_density: number;
  heat_risk: HeatRisk;
  confidence: number;
  primary_factors: string[];
}

export interface TimelineYear {
  year: number;
  avg_lst: number;
  max_lst: number;
  avg_ndvi: number;
  built_up_percent: number;
  green_cover_percent: number;
  heat_risk_level: HeatRisk;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    tree_cover_increase_percent: number;
    cool_roofs_ratio_percent: number;
    urban_parks_added: number;
    water_bodies_expansion_percent: number;
  };
  cooling_breakdown: {
    from_tree_canopy_deg_c: number;
    from_cool_roofs_deg_c: number;
    from_parks_deg_c: number;
    from_water_deg_c: number;
    total_lst_reduction_deg_c: number;
  };
  projected_lst_c: number;
  total_reduction_c: number;
  projected_ndvi: number;
  projected_green_cover_percent: number;
  heat_risk_before: HeatRisk;
  heat_risk_after: HeatRisk;
  heat_hazard_before?: number;
  heat_hazard_after?: number;
  improved: boolean;
}

export interface SimulationResult {
  city: string;
  scenarios?: SimulationScenario[];
  custom_scenario?: SimulationScenario;
  cooling_breakdown: {
    from_tree_canopy_deg_c: number;
    from_cool_roofs_deg_c: number;
    from_parks_deg_c: number;
    from_water_deg_c: number;
    total_lst_reduction_deg_c: number;
  };
  before_vs_after: {
    lst: { before: number; after: number; delta: number };
    ndvi: { before: number; after: number; delta: number };
    green_cover_percent: { before: number; after: number; delta: number };
    heat_risk: { before: HeatRisk; after: HeatRisk; improved: boolean };
  };
  summary: string;
  scientific_disclaimer?: {
    model_notice: string;
    methodology: string;
    limitations: string;
  };
}

export interface ComparisonResult {
  city_a: {
    name: string;
    avg_lst: number;
    max_lst: number;
    ambient_temp?: number;
    weather_condition?: string;
    ndvi: number;
    green_cover_percent: number;
    building_density_percent: number;
    population_density: number;
    heat_hazard_index?: number;
    vulnerability_index?: number;
    heat_risk: HeatRisk;
    confidence: number;
    local_solar_time?: string;
    is_day?: boolean;
    diurnal_phase?: string;
    data_quality_score?: number;
  };
  city_b: {
    name: string;
    avg_lst: number;
    max_lst: number;
    ambient_temp?: number;
    weather_condition?: string;
    ndvi: number;
    green_cover_percent: number;
    building_density_percent: number;
    population_density: number;
    heat_hazard_index?: number;
    vulnerability_index?: number;
    heat_risk: HeatRisk;
    confidence: number;
    local_solar_time?: string;
    is_day?: boolean;
    diurnal_phase?: string;
    data_quality_score?: number;
  };
  deltas: {
    lst_diff: number;
    ndvi_diff: number;
    green_cover_diff: number;
    building_density_diff: number;
    hazard_diff?: number;
  };
  diurnal_confounding_warning?: string | null;
  comparative_summary: string;
  data_provenance_note?: string;
}

export interface MlopsHealthSummary {
  model_name: string;
  model_version: string;
  algorithm: string;
  calibration_status?: string;
  dataset_version?: string;
  scientific_notice?: string;
  trained_at: string;
  sklearn_version?: string;
  accuracy: number;
  f1_macro: number;
  cv_5fold_macro_f1?: string;
  inference_latency_ms?: number;
  total_inferences_logged: number;
  drift_status: string;
  overall_psi?: number;
  feature_importances: Record<string, number>;
  benchmark_comparison?: Array<{
    model_name: string;
    accuracy: number;
    macro_f1: number;
    cv_5fold_macro_f1_mean: number;
    inference_latency_ms: number;
  }>;
}

// ── 1. Full City Analysis ───────────────────────────────────────────────────
export async function fetchCityAnalysis(city: CityResult): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: city.name, lat: city.lat, lon: city.lon }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Unable to resolve city analysis for '${city.name}' (status ${res.status}).`);
  }

  const data = await res.json();
  return {
    heatRisk: data.heatRisk as HeatRisk,
    confidence: data.calibratedConfidence ?? data.confidence,
    lst: data.lst,
    ndvi: data.ndvi,
    uvIndex: data.uvIndex,
    humidity: data.humidity,
    airQualityIndex: data.airQualityIndex,
    recommendations: data.recommendations,
    topHeatZones: data.topHeatZones,
    weeklyForecast: data.weeklyForecast,
    heatHazardIndex: data.heatHazardIndex,
    vulnerabilityIndex: data.vulnerabilityIndex,
  };
}

// ── 2. Spatial Grid / Layer Data ────────────────────────────────────────────
export async function fetchCitySpatialGrid(cityName: string, lat?: number, lon?: number, gridSize = 5): Promise<SpatialSector[]> {
  let url = `${API_BASE}/layers/${encodeURIComponent(cityName)}/heatmap?grid_size=${gridSize}`;
  if (lat !== undefined && lon !== undefined) {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Unable to fetch spatial grid for '${cityName}' (status ${res.status}).`);
  }
  const data = await res.json();
  if (data.geojson && Array.isArray(data.geojson.features)) {
    return data.geojson.features.map((f: any) => f.properties as SpatialSector);
  }
  return [];
}

// ── 3. Point Inspection ─────────────────────────────────────────────────────
export async function inspectPointAt(cityName: string, lat: number, lon: number): Promise<PointInspectionResult> {
  const res = await fetch(`${API_BASE}/layers/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName, lat, lon }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Unable to inspect coordinates (status ${res.status}).`);
  }
  const data = await res.json();
  return data.inspection as PointInspectionResult;
}

// ── 4. Historical Timeline ──────────────────────────────────────────────────
export async function fetchHistoricalTimeline(cityName: string): Promise<TimelineYear[]> {
  const res = await fetch(`${API_BASE}/timeline?city=${encodeURIComponent(cityName)}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Unable to fetch historical timeline for '${cityName}' (status ${res.status}).`);
  }
  const data = await res.json();
  return (data.timeline || []) as TimelineYear[];
}

// ── 5. What-If Cooling Simulation ───────────────────────────────────────────
export async function runCoolingSimulation(
  cityName: string,
  treeCoverIncrease: number,
  coolRoofsRatio: number,
  urbanParksAdded: number,
  waterBodiesExpansion: number
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city: cityName,
      tree_cover_increase: treeCoverIncrease,
      cool_roofs_ratio: coolRoofsRatio,
      urban_parks_added: urbanParksAdded,
      water_bodies_expansion: waterBodiesExpansion,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Simulation calculation failed for '${cityName}' (status ${res.status}).`);
  }
  return (await res.json()) as SimulationResult;
}

export interface SimulateCoolingInput {
  city: string;
  lat?: number;
  lon?: number;
  interventions?: {
    tree_canopy_cover_percent?: number;
    cool_roof_adoption_percent?: number;
    urban_parks_count?: number;
    water_bodies_expansion_percent?: number;
  };
  tree_cover_increase?: number;
  cool_roofs_ratio?: number;
  urban_parks_added?: number;
  water_bodies_expansion?: number;
}

export async function simulateCooling(input: SimulateCoolingInput): Promise<SimulationResult> {
  const trees = input.interventions?.tree_canopy_cover_percent ?? input.tree_cover_increase ?? 20;
  const roofs = input.interventions?.cool_roof_adoption_percent ?? input.cool_roofs_ratio ?? 35;
  const parks = input.interventions?.urban_parks_count ?? input.urban_parks_added ?? 3;
  const water = input.interventions?.water_bodies_expansion_percent ?? input.water_bodies_expansion ?? 5;
  return runCoolingSimulation(input.city, trees, roofs, parks, water);
}

// ── 6. Comparative City Analysis ────────────────────────────────────────────
export async function compareTwoCities(cityA: string, cityB: string): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city_a: cityA, city_b: cityB }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Comparison failed between '${cityA}' and '${cityB}' (status ${res.status}).`);
  }
  return (await res.json()) as ComparisonResult;
}

// ── 7. MLOps Status & Model Governance ──────────────────────────────────────
export type MlopsStatus = MlopsHealthSummary;

export async function fetchMlopsHealth(): Promise<MlopsHealthSummary> {
  const res = await fetch(`${API_BASE}/mlops/status`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Unable to retrieve MLOps health metrics (status ${res.status}).`);
  }
  const data = await res.json();
  return data.mlops as MlopsHealthSummary;
}

export const getMlopsStatus = fetchMlopsHealth;

export async function triggerRetrain(nSamples: number = 2000): Promise<{
  status: string;
  message: string;
  new_version?: string;
  accuracy?: number;
  f1_macro?: number;
}> {
  const res = await fetch(`${API_BASE}/mlops/retrain?n_samples=${nSamples}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Model retraining request failed (status ${res.status}).`);
  }
  return await res.json();
}

// ── 8. PDF Report Export ────────────────────────────────────────────────────
export async function downloadPdfReport(cityName: string, analysisData?: any): Promise<void> {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName, analysis_data: analysisData }),
  });

  if (res.ok) {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UrbanChill_Heat_Resilience_Report_${cityName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return;
  }
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `PDF report generation failed (status ${res.status}).`);
}

// ── 9. Voice & Conversational Climatology Agent ─────────────────────────────
export interface VoiceAgentResponse {
  reply: string;
  speech: string;
  language: 'en' | 'hi';
  suggestions: string[];
  city: string;
}

export async function fetchVoiceAgentResponse(
  message: string,
  cityContext: Record<string, any>,
  language: 'en' | 'hi' = 'en'
): Promise<VoiceAgentResponse> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      language,
      city_context: cityContext,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Voice agent request failed (status ${res.status}).`);
  }
  return (await res.json()) as VoiceAgentResponse;
}


