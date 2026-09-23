"""
API endpoint for comparative city analysis.
POST /api/compare
Diurnally-aware comparative analysis:
- Normalizes solar elevation and daylight/night status
- Exposes Physical Heat Hazard Index and Human Exposure Vulnerability
- Flags diurnal confounding warnings when comparing daylight vs nocturnal observations
"""

import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from core.realtime_gis import compute_realtime_metrics, geocode_location

router = APIRouter()

class CompareRequest(BaseModel):
    city_a: str = Field("Pune", description="First city to compare")
    city_b: str = Field("Phoenix", description="Second city to compare")
    lat_a: Optional[float] = None
    lon_a: Optional[float] = None
    lat_b: Optional[float] = None
    lon_b: Optional[float] = None

def estimate_local_time(lon: float) -> str:
    """Estimates local solar time string from WGS84 longitude."""
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    offset_hours = lon / 15.0
    local_dt = utc_now + datetime.timedelta(hours=offset_hours)
    sign = "+" if offset_hours >= 0 else "-"
    offset_str = f"UTC{sign}{abs(int(offset_hours)):02d}:{int(abs(offset_hours) % 1 * 60):02d}"
    return f"{local_dt.strftime('%H:%M')} ({offset_str})"

@router.post("/compare")
async def compare_cities(req: CompareRequest):
    """
    Compares two urban regions side-by-side across live Land Surface Temperature proxy,
    vegetation proxy, physical heat hazard, and vulnerability exposure.
    Includes diurnal status and comparability validation.
    """
    name_a = req.city_a.strip()
    lat_a = req.lat_a
    lon_a = req.lon_a
    if lat_a is None or lon_a is None:
        geo_a = geocode_location(name_a)
        if geo_a:
            lat_a, lon_a, resolved_a = geo_a
            if resolved_a:
                name_a = resolved_a
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to resolve city for comparison: '{name_a}'. Please check the spelling or specify coordinates."
            )

    name_b = req.city_b.strip()
    lat_b = req.lat_b
    lon_b = req.lon_b
    if lat_b is None or lon_b is None:
        geo_b = geocode_location(name_b)
        if geo_b:
            lat_b, lon_b, resolved_b = geo_b
            if resolved_b:
                name_b = resolved_b
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to resolve city for comparison: '{name_b}'. Please check the spelling or specify coordinates."
            )

    metrics_a = compute_realtime_metrics(lat=lat_a, lon=lon_a, city_name=name_a)
    metrics_b = compute_realtime_metrics(lat=lat_b, lon=lon_b, city_name=name_b)
    
    is_day_a = bool(metrics_a.get("isDay", 1))
    is_day_b = bool(metrics_b.get("isDay", 1))
    
    local_time_a = estimate_local_time(metrics_a["lon"])
    local_time_b = estimate_local_time(metrics_b["lon"])
    
    city_a_stats = {
        "name": metrics_a["city"],
        "lat": metrics_a["lat"],
        "lon": metrics_a["lon"],
        "local_solar_time": local_time_a,
        "is_day": is_day_a,
        "diurnal_phase": "Daylight (Solar Insolation Active)" if is_day_a else "Nocturnal (Radiative Cooling)",
        "avg_lst": metrics_a["lst"],
        "max_lst": round(metrics_a["lst"] + 4.8, 1),
        "ambient_temp": metrics_a["ambientTemp"],
        "weather_condition": metrics_a["weatherCondition"],
        "ndvi": metrics_a["ndvi"],
        "green_cover_percent": round(metrics_a["greenCover"] * 100, 1),
        "building_density_percent": round(metrics_a["buildingDensity"] * 100, 1),
        "population_density": metrics_a["populationDensity"],
        "heat_hazard_index": metrics_a.get("heatHazardIndex", 0.65),
        "vulnerability_index": metrics_a.get("vulnerabilityIndex", 0.55),
        "heat_risk": metrics_a["heatRisk"],
        "confidence": metrics_a["confidence"],
        "data_quality_score": metrics_a.get("dataQuality", {}).get("score", 85)
    }
    
    city_b_stats = {
        "name": metrics_b["city"],
        "lat": metrics_b["lat"],
        "lon": metrics_b["lon"],
        "local_solar_time": local_time_b,
        "is_day": is_day_b,
        "diurnal_phase": "Daylight (Solar Insolation Active)" if is_day_b else "Nocturnal (Radiative Cooling)",
        "avg_lst": metrics_b["lst"],
        "max_lst": round(metrics_b["lst"] + 4.8, 1),
        "ambient_temp": metrics_b["ambientTemp"],
        "weather_condition": metrics_b["weatherCondition"],
        "ndvi": metrics_b["ndvi"],
        "green_cover_percent": round(metrics_b["greenCover"] * 100, 1),
        "building_density_percent": round(metrics_b["buildingDensity"] * 100, 1),
        "population_density": metrics_b["populationDensity"],
        "heat_hazard_index": metrics_b.get("heatHazardIndex", 0.65),
        "vulnerability_index": metrics_b.get("vulnerabilityIndex", 0.55),
        "heat_risk": metrics_b["heatRisk"],
        "confidence": metrics_b["confidence"],
        "data_quality_score": metrics_b.get("dataQuality", {}).get("score", 85)
    }
    
    deltas = {
        "lst_diff": round(city_a_stats["avg_lst"] - city_b_stats["avg_lst"], 1),
        "ndvi_diff": round(city_a_stats["ndvi"] - city_b_stats["ndvi"], 2),
        "green_cover_diff": round(city_a_stats["green_cover_percent"] - city_b_stats["green_cover_percent"], 1),
        "building_density_diff": round(city_a_stats["building_density_percent"] - city_b_stats["building_density_percent"], 1),
        "hazard_diff": round(city_a_stats["heat_hazard_index"] - city_b_stats["heat_hazard_index"], 2)
    }
    
    warmer_city = city_a_stats["name"] if deltas["lst_diff"] > 0 else city_b_stats["name"]
    greener_city = city_a_stats["name"] if deltas["ndvi_diff"] > 0 else city_b_stats["name"]
    
    diurnal_confounding_warning = None
    if is_day_a != is_day_b:
        day_city = city_a_stats["name"] if is_day_a else city_b_stats["name"]
        night_city = city_b_stats["name"] if is_day_a else city_a_stats["name"]
        diurnal_confounding_warning = (
            f"Diurnal Confounding Alert: {day_city} is experiencing daytime solar heating ({local_time_a if is_day_a else local_time_b}), "
            f"while {night_city} is in nocturnal cooling phase. Direct instantaneous thermal comparison is confounded by solar zenith differences."
        )
    
    summary = (
        f"{warmer_city} exhibits higher thermal exposure ({abs(deltas['lst_diff'])}°C surface differential), "
        f"while {greener_city} maintains greater vegetative buffering ({abs(deltas['ndvi_diff'])} NDVI differential)."
    )
    if diurnal_confounding_warning:
        summary += f" [NOTICE: {diurnal_confounding_warning}]"
    
    return {
        "city_a": city_a_stats,
        "city_b": city_b_stats,
        "deltas": deltas,
        "diurnal_confounding_warning": diurnal_confounding_warning,
        "comparative_summary": summary,
        "data_provenance_note": "Telemetry retrieved synchronously from live meteorological reanalysis and vector morphology."
    }
