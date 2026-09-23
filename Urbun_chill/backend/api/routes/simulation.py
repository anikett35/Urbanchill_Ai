"""
API endpoint for "What-If" cooling simulation.
POST /api/simulate
Multi-Scenario Biophysical Engine:
- Evaluates 4 scenarios side-by-side (Baseline, Canopy First, Cool Roofs, Comprehensive, Custom)
- Uses bounded non-linear asymptotic saturation curves to model diminishing returns
- Calculates before-and-after physical heat hazard, vegetation gain, and calibrated ML heat risk
"""

import math
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from core.realtime_gis import compute_realtime_metrics, geocode_location
from core.simulation_engine import compute_diminishing_cooling
from ml.predict import predict_heat_risk

router = APIRouter()

class SimulationRequest(BaseModel):
    city: str = Field("Pune", description="City name")
    lat: Optional[float] = None
    lon: Optional[float] = None
    tree_cover_increase: float = Field(20.0, ge=0.0, le=60.0, description="Additional tree canopy percentage")
    cool_roofs_ratio: float = Field(35.0, ge=0.0, le=100.0, description="Percentage of roofs converted to high-albedo cool roofs")
    urban_parks_added: int = Field(3, ge=0, le=20, description="Number of new decentralized urban parks")
    water_bodies_expansion: float = Field(5.0, ge=0.0, le=30.0, description="Percentage expansion in water retention basins")

@router.post("/simulate")
async def simulate_cooling(req: SimulationRequest):
    """
    Executes multi-scenario urban heat resilience simulation on live city baseline data.
    Returns 4 scenarios side-by-side with non-linear diminishing return bounds.
    """
    city_name = req.city.strip()
    c_lat = req.lat
    c_lon = req.lon
    
    if c_lat is None or c_lon is None:
        geo = geocode_location(city_name)
        if geo:
            c_lat, c_lon, place = geo
            if place:
                city_name = place
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to resolve the requested city: '{city_name}'. Please verify the city name or provide explicit coordinates."
            )

    metrics = compute_realtime_metrics(lat=c_lat, lon=c_lon, city_name=city_name)
    base_lst = metrics["lst"]
    base_ndvi = metrics["ndvi"]
    base_green = metrics["greenCover"]
    b_dens = metrics["buildingDensity"]
    r_dens = metrics["roadDensity"]
    p_dens = metrics["populationDensity"]
    base_hazard = metrics.get("heatHazardIndex", 0.65)
    
    # 1. Baseline Prediction
    base_pred = predict_heat_risk({
        "lst": base_lst,
        "ndvi": base_ndvi,
        "building_density": b_dens,
        "road_density": r_dens,
        "population_density": p_dens,
        "green_cover": base_green,
        "dist_water_body": 950.0
    })
    
    # 2. Define Scenario Suite
    scenario_configs = [
        {
            "id": "scenario_a",
            "name": "Scenario A — Canopy Priority",
            "description": "Aggressive urban street tree planting (+25% canopy)",
            "params": {"trees": 25.0, "roofs": 0.0, "parks": 0, "water": 0.0}
        },
        {
            "id": "scenario_b",
            "name": "Scenario B — High-Albedo Cool Roofs",
            "description": "Mandatory high-reflectivity commercial rooftop coatings (+50% roofs)",
            "params": {"trees": 0.0, "roofs": 50.0, "parks": 0, "water": 0.0}
        },
        {
            "id": "scenario_c",
            "name": "Scenario C — Comprehensive Urban Resilience",
            "description": "Balanced multi-layer intervention (+25% trees, +40% roofs, 4 parks, +8% water)",
            "params": {"trees": 25.0, "roofs": 40.0, "parks": 4, "water": 8.0}
        },
        {
            "id": "scenario_custom",
            "name": "Scenario D — Custom Planner Plan",
            "description": "Planner-selected parameters from interactive control sliders",
            "params": {
                "trees": req.tree_cover_increase,
                "roofs": req.cool_roofs_ratio,
                "parks": req.urban_parks_added,
                "water": req.water_bodies_expansion
            }
        }
    ]
    
    scenarios_evaluated = []
    
    for sc in scenario_configs:
        p = sc["params"]
        cooling = compute_diminishing_cooling(p["trees"], p["roofs"], p["parks"], p["water"])
        tot_drop = cooling["total_lst_reduction_deg_c"]
        sim_lst = round(max(15.0, base_lst - tot_drop), 1)
        
        # Vegetative gain with diminishing saturation
        ndvi_gain = round((1.0 - math.exp(-0.015 * p["trees"])) * 0.18 + p["parks"] * 0.012, 3)
        sim_ndvi = round(min(0.85, base_ndvi + ndvi_gain), 2)
        green_gain = round((1.0 - math.exp(-0.018 * p["trees"])) * 0.22, 3)
        sim_green = round(min(0.80, base_green + green_gain), 2)
        
        # Sim ML prediction
        sim_pred = predict_heat_risk({
            "lst": sim_lst,
            "ndvi": sim_ndvi,
            "building_density": round(max(0.10, b_dens - (p["parks"] * 0.008)), 2),
            "road_density": r_dens,
            "population_density": p_dens,
            "green_cover": sim_green,
            "dist_water_body": max(200.0, 950.0 - p["water"] * 25.0)
        })
        
        # Projected physical heat hazard
        norm_t = min(1.0, max(0.0, (sim_lst - 20.0) / 32.0))
        norm_v_def = min(1.0, max(0.0, 1.0 - (sim_ndvi / 0.70)))
        sim_hazard = round(min(1.0, max(0.05, (0.42 * norm_t) + (0.24 * norm_v_def) + (0.22 * b_dens) + 0.12 * 0.4)), 2)
        
        scenarios_evaluated.append({
            "id": sc["id"],
            "name": sc["name"],
            "description": sc["description"],
            "parameters": {
                "tree_cover_increase_percent": p["trees"],
                "cool_roofs_ratio_percent": p["roofs"],
                "urban_parks_added": p["parks"],
                "water_bodies_expansion_percent": p["water"]
            },
            "cooling_breakdown": cooling,
            "projected_lst_c": sim_lst,
            "total_reduction_c": tot_drop,
            "projected_ndvi": sim_ndvi,
            "projected_green_cover_percent": round(sim_green * 100, 1),
            "heat_risk_before": base_pred["risk_level"],
            "heat_risk_after": sim_pred["risk_level"],
            "heat_hazard_before": base_hazard,
            "heat_hazard_after": sim_hazard,
            "improved": sim_pred["risk_level"] != base_pred["risk_level"] or tot_drop >= 1.2
        })
        
    custom_sc = scenarios_evaluated[-1]
    tot_custom_drop = custom_sc["total_reduction_c"]
    
    summary = (
        f"Simulated intervention in {city_name} projects an estimated {tot_custom_drop}°C "
        f"surface temperature reduction (Risk profile: {base_pred['risk_level']} → {custom_sc['heat_risk_after']}, "
        f"Physical Heat Hazard: {base_hazard} → {custom_sc['heat_hazard_after']})."
    )
    
    return {
        "city": city_name,
        "scenarios": scenarios_evaluated,
        "custom_scenario": custom_sc,
        "cooling_breakdown": custom_sc["cooling_breakdown"],
        "before_vs_after": {
            "lst": {
                "before": base_lst,
                "after": custom_sc["projected_lst_c"],
                "delta": -tot_custom_drop
            },
            "ndvi": {
                "before": base_ndvi,
                "after": custom_sc["projected_ndvi"],
                "delta": round(custom_sc["projected_ndvi"] - base_ndvi, 2)
            },
            "green_cover_percent": {
                "before": round(base_green * 100, 1),
                "after": custom_sc["projected_green_cover_percent"],
                "delta": round(custom_sc["projected_green_cover_percent"] - base_green * 100, 1)
            },
            "heat_risk": {
                "before": base_pred["risk_level"],
                "after": custom_sc["heat_risk_after"],
                "improved": custom_sc["improved"]
            }
        },
        "summary": summary,
        "scientific_disclaimer": {
            "model_notice": "Modelled estimate — not a guaranteed real-world temperature change.",
            "methodology": "Biophysical asymptotic saturation curves calibrated against empirical urban cooling studies.",
            "limitations": "Estimates assume uniform spatial distribution of interventions and typical summer atmospheric conditions."
        }
    }
