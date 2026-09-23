"""
GIS and Spatial Processing Service for UrbanChill AI.
Generates multi-layer GeoJSON datasets for urban centers:
- Land Surface Temperature (LST) thermal gradient grid
- NDVI vegetation distribution
- Urban morphology: Buildings, Road networks, Parks, Water bodies
- Heat Risk classification zones
- Spatial point-click attribute inspection
- Historical time-series data (2018-2026)
"""

import math
import numpy as np
from typing import Dict, Any, List, Optional

# City Registry with baseline geographical coordinates and climatic profiles
CITY_PROFILES: Dict[str, Dict[str, Any]] = {
    "Pune": {
        "lat": 18.5204,
        "lon": 73.8567,
        "base_lst": 36.8,
        "base_ndvi": 0.28,
        "building_density": 0.62,
        "green_cover": 0.22,
        "population_density": 9400,
        "zones": [
            {"name": "Shivajinagar Central", "lat_offset": 0.012, "lon_offset": -0.008, "lst_delta": 2.4, "ndvi_delta": -0.08},
            {"name": "Hadapsar Industrial Zone", "lat_offset": -0.015, "lon_offset": 0.038, "lst_delta": 4.6, "ndvi_delta": -0.14},
            {"name": "Kothrud Residential Sector", "lat_offset": -0.018, "lon_offset": -0.028, "lst_delta": -0.8, "ndvi_delta": 0.12},
            {"name": "Viman Nagar Corridor", "lat_offset": 0.045, "lon_offset": 0.040, "lst_delta": 1.8, "ndvi_delta": -0.02},
            {"name": "ARAI Hills Green Reserve", "lat_offset": -0.030, "lon_offset": -0.018, "lst_delta": -4.2, "ndvi_delta": 0.32},
        ]
    },
    "Mumbai": {
        "lat": 19.0760,
        "lon": 72.8777,
        "base_lst": 38.2,
        "base_ndvi": 0.19,
        "building_density": 0.78,
        "green_cover": 0.14,
        "population_density": 21000,
        "zones": [
            {"name": "Dharavi High-Density Zone", "lat_offset": -0.020, "lon_offset": -0.010, "lst_delta": 5.1, "ndvi_delta": -0.12},
            {"name": "BKC Commercial Hub", "lat_offset": -0.010, "lon_offset": 0.015, "lst_delta": 3.8, "ndvi_delta": -0.07},
            {"name": "Aarey Colony Forest Reserve", "lat_offset": 0.070, "lon_offset": 0.020, "lst_delta": -5.0, "ndvi_delta": 0.38},
            {"name": "Colaba Coastal Sector", "lat_offset": -0.120, "lon_offset": -0.020, "lst_delta": -1.2, "ndvi_delta": 0.04},
        ]
    },
    "Hyderabad": {
        "lat": 17.3850,
        "lon": 78.4867,
        "base_lst": 37.5,
        "base_ndvi": 0.22,
        "building_density": 0.65,
        "green_cover": 0.18,
        "population_density": 10500,
        "zones": [
            {"name": "HITEC City Tech Park", "lat_offset": 0.060, "lon_offset": -0.080, "lst_delta": 3.2, "ndvi_delta": -0.05},
            {"name": "Secunderabad Commercial Zone", "lat_offset": 0.080, "lon_offset": 0.030, "lst_delta": 3.9, "ndvi_delta": -0.09},
            {"name": "KBR National Park", "lat_offset": 0.035, "lon_offset": -0.045, "lst_delta": -4.8, "ndvi_delta": 0.40},
            {"name": "Hussain Sagar Lake Buffer", "lat_offset": 0.030, "lon_offset": -0.015, "lst_delta": -2.6, "ndvi_delta": 0.15},
        ]
    },
    "Delhi": {
        "lat": 28.7041,
        "lon": 77.1025,
        "base_lst": 42.1,
        "base_ndvi": 0.18,
        "building_density": 0.72,
        "green_cover": 0.15,
        "population_density": 14000,
        "zones": [
            {"name": "Connaught Place Urban Core", "lat_offset": -0.060, "lon_offset": 0.110, "lst_delta": 4.1, "ndvi_delta": -0.08},
            {"name": "Okhla Industrial Sector", "lat_offset": -0.140, "lon_offset": 0.170, "lst_delta": 6.2, "ndvi_delta": -0.14},
            {"name": "Delhi Ridge Forest", "lat_offset": -0.040, "lon_offset": 0.070, "lst_delta": -4.5, "ndvi_delta": 0.35},
        ]
    },
    "Bangalore": {
        "lat": 12.9716,
        "lon": 77.5946,
        "base_lst": 33.4,
        "base_ndvi": 0.34,
        "building_density": 0.58,
        "green_cover": 0.28,
        "population_density": 8500,
        "zones": [
            {"name": "Whitefield Tech Corridor", "lat_offset": 0.010, "lon_offset": 0.140, "lst_delta": 3.8, "ndvi_delta": -0.10},
            {"name": "Cubbon Park Green Core", "lat_offset": 0.005, "lon_offset": -0.005, "lst_delta": -4.6, "ndvi_delta": 0.42},
            {"name": "Peenya Industrial Area", "lat_offset": 0.060, "lon_offset": -0.080, "lst_delta": 5.4, "ndvi_delta": -0.15},
        ]
    },
    "Phoenix": {
        "lat": 33.4484,
        "lon": -112.0740,
        "base_lst": 44.5,
        "base_ndvi": 0.10,
        "building_density": 0.72,
        "green_cover": 0.08,
        "population_density": 1250,
        "zones": [
            {"name": "Downtown Phoenix Core", "lat_offset": 0.010, "lon_offset": 0.010, "lst_delta": 3.8, "ndvi_delta": -0.04},
            {"name": "Sky Harbor Industrial Area", "lat_offset": -0.015, "lon_offset": 0.035, "lst_delta": 4.9, "ndvi_delta": -0.07},
            {"name": "Camelback Mountain Reserve", "lat_offset": 0.045, "lon_offset": 0.055, "lst_delta": -5.2, "ndvi_delta": 0.15},
            {"name": "Encanto Park Green Oasis", "lat_offset": 0.025, "lon_offset": -0.015, "lst_delta": -3.8, "ndvi_delta": 0.28},
        ]
    },
    "Dubai": {
        "lat": 25.2048,
        "lon": 55.2708,
        "base_lst": 45.2,
        "base_ndvi": 0.08,
        "building_density": 0.75,
        "green_cover": 0.06,
        "population_density": 2200,
        "zones": [
            {"name": "Downtown Dubai & Burj District", "lat_offset": 0.010, "lon_offset": 0.010, "lst_delta": 3.5, "ndvi_delta": -0.03},
            {"name": "Al Quoz Industrial Zone", "lat_offset": -0.030, "lon_offset": -0.020, "lst_delta": 5.2, "ndvi_delta": -0.05},
            {"name": "Safa Park Green Core", "lat_offset": -0.015, "lon_offset": -0.010, "lst_delta": -4.2, "ndvi_delta": 0.26},
        ]
    }
}

def get_city_profile(city_name: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """Retrieves existing city profile or dynamically generates one for custom coordinates."""
    # Normalized lookup
    for key, profile in CITY_PROFILES.items():
        if key.lower() in city_name.lower() or city_name.lower() in key.lower():
            return {"name": key, **profile}
            
    # Default dynamic city profile
    c_lat = lat if lat is not None else 18.5204
    c_lon = lon if lon is not None else 73.8567
    
    return {
        "name": city_name,
        "lat": c_lat,
        "lon": c_lon,
        "base_lst": 35.0,
        "base_ndvi": 0.25,
        "building_density": 0.60,
        "green_cover": 0.20,
        "population_density": 9500,
        "zones": [
            {"name": f"{city_name} Downtown Core", "lat_offset": 0.01, "lon_offset": 0.01, "lst_delta": 3.2, "ndvi_delta": -0.08},
            {"name": f"{city_name} Industrial District", "lat_offset": -0.02, "lon_offset": 0.03, "lst_delta": 4.5, "ndvi_delta": -0.12},
            {"name": f"{city_name} Botanical Reserve", "lat_offset": 0.02, "lon_offset": -0.02, "lst_delta": -3.5, "ndvi_delta": 0.30},
        ]
    }

def generate_spatial_grid(center_lat: float, center_lon: float, base_lst: float, base_ndvi: float, grid_size: int = 5) -> Dict[str, Any]:
    """
    Generates a 5x5 GeoJSON FeatureCollection grid of thermal sectors around the city.
    Each cell contains exact spatial bounds, LST, NDVI, building density, and risk label.
    """
    features = []
    step = 0.015  # ~1.5 km per cell
    half = grid_size // 2
    
    from ml.predict import predict_heat_risk
    
    for row in range(-half, half + 1):
        for col in range(-half, half + 1):
            cell_lat = center_lat + (row * step)
            cell_lon = center_lon + (col * step)
            
            # Distance from center creates natural urban density decay
            dist_from_center = math.sqrt(row**2 + col**2) / (half * 1.414)
            
            # Add spatial micro-climate variations
            lst_val = round(base_lst + (1.0 - dist_from_center) * 3.5 + np.sin(row * 2.1) * 1.8, 1)
            ndvi_val = round(max(0.04, min(0.85, base_ndvi - (1.0 - dist_from_center) * 0.15 + np.cos(col * 1.7) * 0.08)), 2)
            b_density = round(max(0.1, min(0.95, 0.80 - dist_from_center * 0.45)), 2)
            g_cover = round(max(0.05, min(0.75, ndvi_val * 0.85)), 2)
            pop_density = int(max(1200, min(32000, 24000 * (1.0 - dist_from_center))))
            
            pred = predict_heat_risk({
                "lst": lst_val,
                "ndvi": ndvi_val,
                "building_density": b_density,
                "road_density": round(b_density * 18.0, 1),
                "population_density": pop_density,
                "green_cover": g_cover,
                "dist_water_body": 800.0 + dist_from_center * 1500.0
            })
            
            # GeoJSON Polygon for cell bounds
            poly_coords = [
                [
                    [cell_lon - step/2, cell_lat - step/2],
                    [cell_lon + step/2, cell_lat - step/2],
                    [cell_lon + step/2, cell_lat + step/2],
                    [cell_lon - step/2, cell_lat + step/2],
                    [cell_lon - step/2, cell_lat - step/2]
                ]
            ]
            
            features.append({
                "type": "Feature",
                "properties": {
                    "id": f"sector_{row}_{col}",
                    "row": row,
                    "col": col,
                    "lat": round(cell_lat, 4),
                    "lon": round(cell_lon, 4),
                    "lst": lst_val,
                    "ndvi": ndvi_val,
                    "building_density": b_density,
                    "green_cover": g_cover,
                    "population_density": pop_density,
                    "heat_risk": pred["risk_level"],
                    "confidence": pred["confidence"]
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": poly_coords
                }
            })
            
    return {
        "type": "FeatureCollection",
        "metadata": {
            "center": [center_lon, center_lat],
            "total_sectors": len(features)
        },
        "features": features
    }

def inspect_point(lat: float, lon: float, city_name: str) -> Dict[str, Any]:
    """
    Finds localized environmental attributes at any user-clicked coordinate.
    """
    profile = get_city_profile(city_name, lat, lon)
    
    # Calculate distance from city center
    dx = (lon - profile["lon"]) * 111.32 * math.cos(math.radians(lat))
    dy = (lat - profile["lat"]) * 110.57
    dist_km = math.sqrt(dx**2 + dy**2)
    
    # Micro-climate adjustment
    lst = round(profile["base_lst"] + math.sin(lat * 100) * 2.2 - min(4.0, dist_km * 0.4), 1)
    ndvi = round(max(0.05, min(0.80, profile["base_ndvi"] + min(0.25, dist_km * 0.03) + math.cos(lon * 100) * 0.05)), 2)
    building_density = round(max(0.12, min(0.92, profile["building_density"] - min(0.4, dist_km * 0.04))), 2)
    green_cover = round(max(0.04, min(0.70, ndvi * 0.85)), 2)
    pop_density = int(max(1000, profile["population_density"] - dist_km * 800))
    
    from ml.predict import predict_heat_risk
    pred = predict_heat_risk({
        "lst": lst,
        "ndvi": ndvi,
        "building_density": building_density,
        "road_density": round(building_density * 16.0, 1),
        "population_density": pop_density,
        "green_cover": green_cover,
        "dist_water_body": 950.0
    })
    
    return {
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "city": profile["name"],
        "distance_from_center_km": round(dist_km, 2),
        "lst": lst,
        "ndvi": ndvi,
        "building_density": building_density,
        "green_cover_percent": round(green_cover * 100, 1),
        "population_density": pop_density,
        "heat_risk": pred["risk_level"],
        "confidence": pred["confidence"],
        "primary_factors": pred["primary_risk_factors"]
    }

def get_historical_timeline(city_name: str) -> List[Dict[str, Any]]:
    """
    Returns annual environmental indicators for the time slider (2018 to 2026).
    Shows historical trend of rising LST and urban development vs green cover loss.
    """
    profile = get_city_profile(city_name)
    base_lst = profile["base_lst"]
    base_ndvi = profile["base_ndvi"]
    
    timeline = []
    years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    
    for i, yr in enumerate(years):
        # Gradual trend of rising temperatures (+0.32°C/year average urban heat island gain)
        # and slight vegetation reduction
        trend = (i - 4) * 0.32
        lst_yr = round(base_lst + trend + (0.5 if yr == 2024 else -0.3 if yr == 2020 else 0.0), 1)
        ndvi_yr = round(max(0.12, base_ndvi - (i - 4) * 0.015), 2)
        built_yr = round(min(88.0, 52.0 + i * 2.1), 1)
        green_yr = round(max(12.0, 30.0 - i * 1.4), 1)
        
        timeline.append({
            "year": yr,
            "avg_lst": lst_yr,
            "max_lst": round(lst_yr + 5.2, 1),
            "avg_ndvi": ndvi_yr,
            "built_up_percent": built_yr,
            "green_cover_percent": green_yr,
            "heat_risk_level": "Critical" if lst_yr >= 40.0 else "High" if lst_yr >= 36.5 else "Moderate"
        })
        
    return timeline
