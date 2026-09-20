"""
API endpoints for saved analysis history and reports.
GET /api/history
POST /api/history
"""

import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from db import get_db_connection

router = APIRouter()

class SaveHistoryRequest(BaseModel):
    city_name: str
    lat: float
    lon: float
    heat_risk: str
    lst: float
    ndvi: float

@router.get("/history")
async def get_analysis_history(limit: int = 20):
    """
    Retrieves previous analysis records saved in the DuckDB spatial store.
    """
    records = []
    try:
        conn = get_db_connection()
        result = conn.execute("""
            SELECT id, city_name, lat, lon, heat_risk, lst, ndvi, created_at
            FROM analysis_history
            ORDER BY created_at DESC
            LIMIT ?
        """, [limit]).fetchall()
        
        for r in result:
            records.append({
                "id": r[0],
                "city_name": r[1],
                "lat": r[2],
                "lon": r[3],
                "heat_risk": r[4],
                "lst": r[5],
                "ndvi": r[6],
                "created_at": str(r[7])
            })
        pass
    except Exception as e:
        print(f"[UrbanChill DB Warning] Failed to query history: {e}")
        
    return {
        "status": "success",
        "count": len(records),
        "history": records
    }

@router.post("/history")
async def save_history_record(req: SaveHistoryRequest):
    """Saves a new analysis session record."""
    rec_id = str(uuid.uuid4())[:8]
    try:
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO analysis_history (id, city_name, lat, lon, heat_risk, lst, ndvi, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, [rec_id, req.city_name, req.lat, req.lon, req.heat_risk, req.lst, req.ndvi])
        pass
    except Exception as e:
        print(f"[UrbanChill DB Warning] Failed to insert history: {e}")
        
    return {
        "status": "success",
        "id": rec_id,
        "message": f"Saved analysis record for {req.city_name}"
    }
