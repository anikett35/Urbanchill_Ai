"""
API endpoint for historical time-slider analysis (2018-2026).
GET /api/timeline
"""

from fastapi import APIRouter, Query
from core.gis_service import get_historical_timeline, get_city_profile

router = APIRouter()

@router.get("/timeline")
async def get_timeline_data(city: str = Query("Pune", description="City name")):
    """
    Returns annual thermal indicators (2018 to 2026) for the time-slider feature.
    Shows the progression of Land Surface Temperature, NDVI, built-up growth, and risk level.
    """
    profile = get_city_profile(city)
    timeline = get_historical_timeline(city)
    return {
        "city": profile["name"],
        "start_year": 2018,
        "end_year": 2026,
        "timeline": timeline
    }
