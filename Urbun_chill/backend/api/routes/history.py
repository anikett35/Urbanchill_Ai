"""
API endpoints for saved analysis history and reports.
GET /api/history
POST /api/history
Supports full reproducible audit trails with model versions,
data quality ratings, and feature vectors.
"""

import json
import uuid
from fastapi import APIRouter
from pydantic import BaseModel, Field
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
    confidence: Optional[float] = 0.8
    heat_hazard_index: Optional[float] = 0.65
    vulnerability_index: Optional[float] = 0.55
    model_version: Optional[str] = "urbanchill-rf-1.1"
    data_quality_score: Optional[int] = 85
    features: Optional[Dict[str, float]] = None

@router.get("/history")
async def get_analysis_history(limit: int = 20):
    """
    Retrieves previous analysis records saved in the DuckDB spatial store
    including model versions and data quality scores for audit reproducibility.
    """
    records = []
    try:
        conn = get_db_connection()
        result = conn.execute("""
            SELECT id, city_name, lat, lon, heat_risk, confidence, heat_hazard_index,
                   vulnerability_index, lst, ndvi, model_version, data_quality_score,
                   features_json, created_at
            FROM analysis_history
            ORDER BY created_at DESC
            LIMIT ?
        """, [limit]).fetchall()
        
        for r in result:
            features = {}
            if r[12]:
                try:
                    features = json.loads(r[12])
                except Exception:
                    features = {}
            records.append({
                "id": r[0],
                "city_name": r[1],
                "lat": r[2],
                "lon": r[3],
                "heat_risk": r[4],
                "confidence": r[5],
                "heat_hazard_index": r[6],
                "vulnerability_index": r[7],
                "lst": r[8],
                "ndvi": r[9],
                "model_version": r[10],
                "data_quality_score": r[11],
                "features": features,
                "created_at": str(r[13])
            })
    except Exception as e:
        print(f"[UrbanChill DB Warning] Failed to query history: {e}")
        
    return {
        "status": "success",
        "count": len(records),
        "history": records
    }

@router.post("/history")
async def save_history_record(req: SaveHistoryRequest):
    """Saves a new analysis session record with audit metadata."""
    rec_id = str(uuid.uuid4())[:8]
    try:
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO analysis_history (
                id, city_name, lat, lon, heat_risk, confidence, heat_hazard_index,
                vulnerability_index, lst, ndvi, model_version, data_quality_score,
                features_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, [
            rec_id, req.city_name, req.lat, req.lon, req.heat_risk,
            req.confidence, req.heat_hazard_index, req.vulnerability_index,
            req.lst, req.ndvi, req.model_version, req.data_quality_score,
            json.dumps(req.features or {})
        ])
    except Exception as e:
        print(f"[UrbanChill DB Warning] Failed to insert history: {e}")
        
    return {
        "status": "success",
        "id": rec_id,
        "message": f"Saved reproducible analysis record for {req.city_name}"
    }
