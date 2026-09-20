"""
API endpoint for comparative city analysis.
POST /api/compare
Compares environmental and thermal indicators between two chosen cities.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any

from core.gis_service import get_city_profile
from ml.predict import predict_heat_risk

router = APIRouter()

class CompareRequest(BaseModel):
    city_a: str = Field("Pune", description="First city to compare")
    city_b: str = Field("Hyderabad", description="Second city to compare")

@router.post("/compare")
async def compare_cities(req: CompareRequest):
    """
    Compares two urban regions side-by-side across Land Surface Temperature,
    NDVI, green cover, building density, and ML heat risk vulnerability.
    """
    profile_a = get_city_profile(req.city_a)
    profile_b = get_city_profile(req.city_b)
    
    # Run ML prediction for City A
    pred_a = predict_heat_risk({
        "lst": profile_a["base_lst"],
        "ndvi": profile_a["base_ndvi"],
        "building_density": profile_a["building_density"],
        "road_density": round(profile_a["building_density"] * 16.0, 1),
        "population_density": profile_a["population_density"],
        "green_cover": profile_a["green_cover"],
        "dist_water_body": 950.0
    })
    
    # Run ML prediction for City B
    pred_b = predict_heat_risk({
        "lst": profile_b["base_lst"],
        "ndvi": profile_b["base_ndvi"],
        "building_density": profile_b["building_density"],
        "road_density": round(profile_b["building_density"] * 16.0, 1),
        "population_density": profile_b["population_density"],
        "green_cover": profile_b["green_cover"],
        "dist_water_body": 950.0
    })
    
    city_a_stats = {
        "name": profile_a["name"],
        "lat": profile_a["lat"],
        "lon": profile_a["lon"],
        "avg_lst": profile_a["base_lst"],
        "max_lst": round(profile_a["base_lst"] + 4.8, 1),
        "ndvi": profile_a["base_ndvi"],
        "green_cover_percent": round(profile_a["green_cover"] * 100, 1),
        "building_density_percent": round(profile_a["building_density"] * 100, 1),
        "population_density": profile_a["population_density"],
        "heat_risk": pred_a["risk_level"],
        "confidence": pred_a["confidence"]
    }
    
    city_b_stats = {
        "name": profile_b["name"],
        "lat": profile_b["lat"],
        "lon": profile_b["lon"],
        "avg_lst": profile_b["base_lst"],
        "max_lst": round(profile_b["base_lst"] + 4.8, 1),
        "ndvi": profile_b["base_ndvi"],
        "green_cover_percent": round(profile_b["green_cover"] * 100, 1),
        "building_density_percent": round(profile_b["building_density"] * 100, 1),
        "population_density": profile_b["population_density"],
        "heat_risk": pred_b["risk_level"],
        "confidence": pred_b["confidence"]
    }
    
    # Delta calculations (City A - City B)
    deltas = {
        "lst_diff": round(city_a_stats["avg_lst"] - city_b_stats["avg_lst"], 1),
        "ndvi_diff": round(city_a_stats["ndvi"] - city_b_stats["ndvi"], 2),
        "green_cover_diff": round(city_a_stats["green_cover_percent"] - city_b_stats["green_cover_percent"], 1),
        "building_density_diff": round(city_a_stats["building_density_percent"] - city_b_stats["building_density_percent"], 1),
    }
    
    warmer_city = city_a_stats["name"] if deltas["lst_diff"] > 0 else city_b_stats["name"]
    greener_city = city_a_stats["name"] if deltas["ndvi_diff"] > 0 else city_b_stats["name"]
    
    summary = (
        f"{warmer_city} exhibits higher thermal exposure (+{abs(deltas['lst_diff'])}°C LST difference), "
        f"while {greener_city} maintains greater vegetative buffering (+{abs(deltas['ndvi_diff'])} NDVI)."
    )
    
    return {
        "city_a": city_a_stats,
        "city_b": city_b_stats,
        "deltas": deltas,
        "comparative_summary": summary
    }
