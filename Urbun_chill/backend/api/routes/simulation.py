"""
API endpoint for "What-If" cooling simulation.
POST /api/simulate
Models the cooling impact of tree canopy, cool reflective roofs, urban parks, and water bodies.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from core.gis_service import get_city_profile
from ml.predict import predict_heat_risk

router = APIRouter()

class SimulationRequest(BaseModel):
    city: str = Field("Pune", description="City name")
    tree_cover_increase: float = Field(20.0, ge=0.0, le=60.0, description="Additional tree canopy percentage")
    cool_roofs_ratio: float = Field(35.0, ge=0.0, le=100.0, description="Percentage of roofs converted to high-albedo cool roofs")
    urban_parks_added: int = Field(3, ge=0, le=20, description="Number of new decentralized urban parks")
    water_bodies_expansion: float = Field(5.0, ge=0.0, le=30.0, description="Percentage expansion in water retention basins")

@router.post("/simulate")
async def simulate_cooling(req: SimulationRequest):
    """
    Simulates the environmental cooling impact of proposed urban mitigation interventions.
    Calculates projected temperature reduction, vegetation index gain, and updated ML risk classification.
    """
    profile = get_city_profile(req.city)
    base_lst = profile["base_lst"]
    base_ndvi = profile["base_ndvi"]
    base_green = profile["green_cover"]
    building_density = profile["building_density"]
    
    # 1. Calculate baseline ML prediction
    base_pred = predict_heat_risk({
        "lst": base_lst,
        "ndvi": base_ndvi,
        "building_density": building_density,
        "road_density": round(building_density * 16.0, 1),
        "population_density": profile["population_density"],
        "green_cover": base_green,
        "dist_water_body": 950.0
    })
    
    # 2. Physics & Empirical cooling calculations:
    # - Tree plantation: ~0.065°C reduction per 1% canopy gain
    # - Cool roofs: ~0.035°C reduction per 1% roof albedo conversion
    # - Urban parks: ~0.20°C reduction per decentralized park
    # - Water bodies: ~0.04°C reduction per 1% water retention expansion
    temp_drop_trees = req.tree_cover_increase * 0.065
    temp_drop_roofs = req.cool_roofs_ratio * 0.035
    temp_drop_parks = req.urban_parks_added * 0.20
    temp_drop_water = req.water_bodies_expansion * 0.04
    
    total_temp_drop = round(temp_drop_trees + temp_drop_roofs + temp_drop_parks + temp_drop_water, 2)
    simulated_lst = round(max(20.0, base_lst - total_temp_drop), 1)
    
    # Vegetation improvements
    ndvi_gain = round(req.tree_cover_increase * 0.005 + req.urban_parks_added * 0.015, 3)
    simulated_ndvi = round(min(0.85, base_ndvi + ndvi_gain), 2)
    green_cover_gain = round(req.tree_cover_increase / 100.0 * 0.7, 3)
    simulated_green = round(min(0.80, base_green + green_cover_gain), 2)
    
    # 3. Recalculate ML heat risk post-intervention
    sim_pred = predict_heat_risk({
        "lst": simulated_lst,
        "ndvi": simulated_ndvi,
        "building_density": round(max(0.1, building_density - (req.urban_parks_added * 0.01)), 2),
        "road_density": round(building_density * 16.0, 1),
        "population_density": profile["population_density"],
        "green_cover": simulated_green,
        "dist_water_body": max(200.0, 950.0 - req.water_bodies_expansion * 20.0)
    })
    
    return {
        "city": profile["name"],
        "interventions_applied": {
            "tree_cover_increase": req.tree_cover_increase,
            "cool_roofs_ratio": req.cool_roofs_ratio,
            "urban_parks_added": req.urban_parks_added,
            "water_bodies_expansion": req.water_bodies_expansion
        },
        "cooling_breakdown": {
            "from_tree_canopy_deg_c": round(temp_drop_trees, 2),
            "from_cool_roofs_deg_c": round(temp_drop_roofs, 2),
            "from_parks_deg_c": round(temp_drop_parks, 2),
            "from_water_deg_c": round(temp_drop_water, 2),
            "total_lst_reduction_deg_c": total_temp_drop
        },
        "before_vs_after": {
            "lst": {
                "before": base_lst,
                "after": simulated_lst,
                "delta": -total_temp_drop
            },
            "ndvi": {
                "before": base_ndvi,
                "after": simulated_ndvi,
                "delta": round(simulated_ndvi - base_ndvi, 2)
            },
            "green_cover_percent": {
                "before": round(base_green * 100, 1),
                "after": round(simulated_green * 100, 1),
                "delta": round((simulated_green - base_green) * 100, 1)
            },
            "heat_risk": {
                "before": base_pred["risk_level"],
                "after": sim_pred["risk_level"],
                "improved": base_pred["risk_level"] != sim_pred["risk_level"]
            }
        },
        "summary": f"Interventions projected to reduce average Land Surface Temperature by -{total_temp_drop}°C, transitioning heat vulnerability from {base_pred['risk_level']} to {sim_pred['risk_level']}."
    }
