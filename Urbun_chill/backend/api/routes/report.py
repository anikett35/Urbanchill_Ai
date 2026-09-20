"""
API endpoints for PDF report generation and download.
POST /api/report
GET /api/report/download
"""

import uuid
from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from core.pdf_service import generate_urban_heat_report
from core.gis_service import get_city_profile
from ml.predict import predict_heat_risk
from db import get_db_connection

router = APIRouter()

class ReportRequest(BaseModel):
    city: str = Field("Pune", description="City name for report generation")
    analysis_data: Optional[Dict[str, Any]] = None
    simulation_data: Optional[Dict[str, Any]] = None

@router.post("/report")
async def create_report(req: ReportRequest):
    """
    Generates an executive PDF report using ReportLab.
    Returns direct binary PDF or downloadable metadata.
    """
    profile = get_city_profile(req.city)
    
    # If client didn't supply analysis data, construct from profile and ML
    analysis = req.analysis_data
    if not analysis:
        base_lst = profile["base_lst"]
        base_ndvi = profile["base_ndvi"]
        pred = predict_heat_risk({
            "lst": base_lst,
            "ndvi": base_ndvi,
            "building_density": profile["building_density"],
            "road_density": round(profile["building_density"] * 16.0, 1),
            "population_density": profile["population_density"],
            "green_cover": profile["green_cover"],
            "dist_water_body": 950.0
        })
        
        analysis = {
            "heatRisk": pred["risk_level"],
            "lst": base_lst,
            "ndvi": base_ndvi,
            "uvIndex": 8 if base_lst > 38 else 6,
            "humidity": 44,
            "airQualityIndex": 72,
            "recommendations": [
                f"Plant targeted canopy corridors in {profile['name']} central and industrial zones",
                "Install high-albedo cool roofs on public and commercial properties",
                "Create urban shade pavilions at transit nodes to shield pedestrians",
                "Protect surface water reservoirs from encroachment"
            ],
            "topHeatZones": [
                {"name": z["name"], "temp": round(base_lst + z["lst_delta"], 1), "risk": "High" if z["lst_delta"] > 2 else "Moderate"}
                for z in profile.get("zones", [])
            ]
        }
        
    pdf_bytes = generate_urban_heat_report(
        city_name=profile["name"],
        analysis_data=analysis,
        simulation_data=req.simulation_data
    )
    
    report_id = str(uuid.uuid4())[:8]
    try:
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO reports (id, city_name, report_title, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """, [report_id, profile["name"], f"Urban Heat Resilience Report - {profile['name']}"])
        pass
    except Exception as e:
        print(f"[UrbanChill DB Warning] Failed to log report: {e}")
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="UrbanChill_Heat_Report_{profile["name"]}.pdf"',
            "X-Report-Id": report_id
        }
    )

@router.get("/report/download")
async def download_city_report(city: str = "Pune"):
    """Quick GET endpoint to download a pre-compiled PDF report for any city."""
    req = ReportRequest(city=city)
    return await create_report(req)
