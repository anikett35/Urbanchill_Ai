"""
Data Quality Engine for UrbanChill AI.
Evaluates the integrity, freshness, provider availability, and proxy constraints
of all incoming environmental, meteorological, and geospatial telemetry.
Zero fabrication: computed purely from deterministic evaluation rules.
"""

from typing import Dict, Any, List
import datetime

def evaluate_data_quality(
    climate: Dict[str, Any],
    weather_aqi: Dict[str, Any],
    morph: Dict[str, Any],
    lat: float,
    lon: float
) -> Dict[str, Any]:
    """
    Computes a transparent 0-100 Data Quality Score along with individual audit factors.
    """
    score = 0
    factors: List[Dict[str, Any]] = []
    
    # 1. Geographic Coordinate Validity (Max 10 pts)
    if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
        score += 10
        factors.append({
            "source": "geocoding",
            "name": "Geographic Coordinates",
            "status": "VALID",
            "points": 10,
            "details": f"Coordinates ({round(lat, 4)}, {round(lon, 4)}) within valid WGS84 bounding envelope."
        })
    else:
        factors.append({
            "source": "geocoding",
            "name": "Geographic Coordinates",
            "status": "INVALID",
            "points": 0,
            "details": "Out of bounds geographic coordinate."
        })

    # 2. Meteorological Reanalysis Telemetry (Max 30 pts)
    ambient_valid = -40.0 <= climate.get("ambient_temp", 999) <= 60.0
    skin_valid = -20.0 <= climate.get("skin_temp", 999) <= 75.0
    solar_valid = climate.get("direct_radiation", -1) >= 0.0
    
    if ambient_valid and skin_valid and solar_valid:
        score += 30
        factors.append({
            "source": "meteorology",
            "name": "Open-Meteo Reanalysis",
            "status": "OPTIMAL",
            "points": 30,
            "details": "Real-time ECMWF/GFS seamless surface and 2m ambient flux retrieved successfully."
        })
    elif ambient_valid:
        score += 15
        factors.append({
            "source": "meteorology",
            "name": "Open-Meteo Reanalysis",
            "status": "PARTIAL",
            "points": 15,
            "details": "Surface skin or solar insolation missing; relying on default thermodynamic approximations."
        })
    else:
        factors.append({
            "source": "meteorology",
            "name": "Open-Meteo Reanalysis",
            "status": "FAILED",
            "points": 0,
            "details": "Meteorological reanalysis unavailable."
        })

    # 3. Vector GIS Morphology Sampling (Max 25 pts)
    sample_count = morph.get("feature_sample_count", 0)
    density_conf = morph.get("density_confidence", "Normal")
    
    if sample_count > 0:
        if sample_count >= 50:
            score += 20
            factors.append({
                "source": "gis_vector",
                "name": "Mapbox Vector Tilequery",
                "status": "CEILING_REACHED",
                "points": 20,
                "details": "50 vector features sampled (provider query limit reached; high density confidence)."
            })
        else:
            score += 25
            factors.append({
                "source": "gis_vector",
                "name": "Mapbox Vector Tilequery",
                "status": "COMPLETE",
                "points": 25,
                "details": f"{sample_count} localized vector features sampled within 1,500m radius."
            })
    else:
        score += 10
        factors.append({
            "source": "gis_vector",
            "name": "Mapbox Vector Tilequery",
            "status": "FALLBACK",
            "points": 10,
            "details": "No vector features returned; using regional baseline morphology."
        })

    # 4. Air Quality & Atmospheric Telemetry (Max 15 pts)
    aqi_val = weather_aqi.get("air_quality_index", -1)
    if aqi_val > 0:
        score += 15
        factors.append({
            "source": "air_quality",
            "name": "OpenWeather AQI & PM2.5",
            "status": "ACTIVE",
            "points": 15,
            "details": f"Air Quality Index active ({aqi_val} AQI, PM2.5: {weather_aqi.get('pm2_5')} ug/m3)."
        })
    else:
        score += 5
        factors.append({
            "source": "air_quality",
            "name": "OpenWeather AQI & PM2.5",
            "status": "INACTIVE",
            "points": 5,
            "details": "Air quality telemetry unavailable; using standard baseline."
        })

    # 5. Scientific Proxy Constraints (Max 20 pts)
    # Checks whether derived proxies (LST proxy and Vegetation proxy) reside in physically sound intervals
    # and not extreme mathematical artifacts
    b_dens = morph.get("building_density", 0.5)
    g_cov = morph.get("green_cover", 0.2)
    
    if 0.05 <= b_dens <= 0.98 and 0.02 <= g_cov <= 0.85:
        score += 20
        factors.append({
            "source": "proxy_integrity",
            "name": "Scientific Proxy Bounds",
            "status": "VERIFIED",
            "points": 20,
            "details": f"Derived building density ({b_dens}) and canopy cover ({g_cov}) lie within physical bounds."
        })
    else:
        score += 10
        factors.append({
            "source": "proxy_integrity",
            "name": "Scientific Proxy Bounds",
            "status": "MARGINAL",
            "points": 10,
            "details": "Proxy metrics near physical edge thresholds."
        })

    # Grade categorization
    if score >= 85:
        level = "EXCELLENT"
    elif score >= 70:
        level = "GOOD"
    elif score >= 50:
        level = "MODERATE"
    else:
        level = "DEGRADED"

    return {
        "score": score,
        "level": level,
        "evaluated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "factors": factors
    }
