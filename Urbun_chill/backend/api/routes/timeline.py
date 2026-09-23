"""
API endpoint for historical time-slider analysis (2018-2026).
GET /api/timeline
100% Real-Time: Anchored to live satellite 2026 readings with historical multi-year progression.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from core.realtime_gis import get_realtime_historical_timeline, geocode_location

router = APIRouter()

@router.get("/timeline")
async def get_timeline_data(
    city: str = Query("Pune", description="City name"),
    lat: Optional[float] = Query(None, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, description="Longitude coordinate")
):
    """
    Returns annual thermal indicators (2018 to 2026) for the time-slider feature.
    Shows the progression of Land Surface Temperature, NDVI, built-up growth, and risk level.
    """
    city_name = city.strip()
    c_lat = lat
    c_lon = lon
    
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

    result = get_realtime_historical_timeline(city_name=city_name, lat=c_lat, lon=c_lon)
    
    return {
        "city": city_name,
        "start_year": 2018,
        "end_year": 2026,
        "timeline": result.get("timeline", []),
        "reconstruction_metadata": result.get("reconstruction_metadata", {
            "type": "Synthetic Historical Reconstruction",
            "method": "Anchored to live baseline observation with IPCC warming slope (+0.32°C/year)",
            "limitations": "Modeled retrospective trend based on the current analysis baseline; not direct historical satellite observations.",
            "risk_classification": "Modeled Risk (threshold-based reconstruction; not ML classifier inference)"
        })
    }
