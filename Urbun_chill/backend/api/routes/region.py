from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class RegionRequest(BaseModel):
    bbox: List[float]  # [minx, miny, maxx, maxy]

@router.post("/region")
async def process_region(request: RegionRequest):
    """
    Placeholder endpoint for STAC ingestion.
    Accepts a bounding box and returns a mocked Cloud-Optimized GeoTIFF reference.
    """
    bbox = request.bbox
    # In a real scenario, this would query a STAC API (like Microsoft Planetary Computer or GEE)
    # and return a reference to a generated COG.
    
    mocked_cog_url = f"https://mock-stac-api.example.com/cogs/thermal_{bbox[0]}_{bbox[1]}.tif"
    
    return {
        "status": "success",
        "message": "Region processing started",
        "bbox_processed": bbox,
        "cog_url": mocked_cog_url
    }
