"""
API endpoints for spatial GIS layers and click-to-inspect attributes.
GET /api/layers/{city}/{layer_type}
POST /api/layers/inspect
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from core.gis_service import get_city_profile, generate_spatial_grid, inspect_point

router = APIRouter()

class PointInspectionRequest(BaseModel):
    city: str
    lat: float = Field(..., description="Latitude coordinate")
    lon: float = Field(..., description="Longitude coordinate")

@router.get("/layers/{city}/{layer_type}")
async def get_city_layer(city: str, layer_type: str, grid_size: Optional[int] = Query(5, ge=3, le=9)):
    """
    Returns spatial GeoJSON layer for a city.
    Supported layer types:
    - 'heatmap': Thermal grid with LST and color mapping
    - 'ndvi': Vegetation index grid
    - 'risk': ML predicted heat-risk zones
    - 'all': Complete multi-attribute spatial feature collection
    """
    profile = get_city_profile(city)
    grid = generate_spatial_grid(
        center_lat=profile["lat"],
        center_lon=profile["lon"],
        base_lst=profile["base_lst"],
        base_ndvi=profile["base_ndvi"],
        grid_size=grid_size
    )
    
    return {
        "city": profile["name"],
        "layer_type": layer_type,
        "geojson": grid
    }

@router.post("/layers/inspect")
async def inspect_coordinate(req: PointInspectionRequest):
    """
    Interactive map click inspector.
    Calculates localized environmental variables and ML heat risk at exact coordinates.
    """
    result = inspect_point(lat=req.lat, lon=req.lon, city_name=req.city)
    return {
        "status": "success",
        "inspection": result
    }
