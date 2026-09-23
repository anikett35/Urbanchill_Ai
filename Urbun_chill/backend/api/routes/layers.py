"""
API endpoints for spatial GIS layers and click-to-inspect attributes.
GET /api/layers/{city}/{layer_type}
POST /api/layers/inspect
100% Real-time dynamic grid generation with live ML heat-risk classification per sector.
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from core.realtime_gis import generate_realtime_spatial_grid, inspect_realtime_point, geocode_location

router = APIRouter()

class PointInspectionRequest(BaseModel):
    city: str
    lat: float = Field(..., description="Latitude coordinate")
    lon: float = Field(..., description="Longitude coordinate")

@router.get("/layers/{city}/{layer_type}")
async def get_city_layer(
    city: str,
    layer_type: str,
    grid_size: Optional[int] = Query(5, ge=3, le=9),
    lat: Optional[float] = Query(None, description="Center latitude coordinate"),
    lon: Optional[float] = Query(None, description="Center longitude coordinate"),
    min_lat: Optional[float] = Query(None, description="South bounding latitude"),
    max_lat: Optional[float] = Query(None, description="North bounding latitude"),
    min_lon: Optional[float] = Query(None, description="West bounding longitude"),
    max_lon: Optional[float] = Query(None, description="East bounding longitude")
):
    """
    Returns spatial GeoJSON layer for any city, district, taluka, or area coordinates.
    Generates real-time thermal grid with localized LST, NDVI, building density,
    and individual ML heat-risk predictions covering the entire spatial bounding box.
    """
    center_lat = lat
    center_lon = lon
    city_name = city.strip()
    
    bbox = None
    if min_lat is not None and max_lat is not None and min_lon is not None and max_lon is not None:
        bbox = [min_lat, max_lat, min_lon, max_lon]
        if center_lat is None:
            center_lat = (min_lat + max_lat) / 2.0
        if center_lon is None:
            center_lon = (min_lon + max_lon) / 2.0
    
    if center_lat is None or center_lon is None:
        geo = geocode_location(city_name)
        if geo:
            center_lat, center_lon, place_name = geo
            if place_name:
                city_name = place_name
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to resolve the requested city: '{city_name}'. Please verify the city name or provide explicit coordinates."
            )

    grid = generate_realtime_spatial_grid(
        center_lat=center_lat,
        center_lon=center_lon,
        city_name=city_name,
        grid_size=grid_size,
        bbox=bbox
    )
    
    return {
        "city": city_name,
        "layer_type": layer_type,
        "geojson": grid
    }

@router.post("/layers/inspect")
async def inspect_coordinate(req: PointInspectionRequest):
    """
    Interactive map click inspector.
    Calculates localized live environmental variables and ML heat risk at exact coordinates.
    """
    result = inspect_realtime_point(lat=req.lat, lon=req.lon, city_name=req.city)
    return {
        "status": "success",
        "inspection": result
    }
