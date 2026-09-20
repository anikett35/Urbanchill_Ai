"""
API endpoint for direct ML Random Forest heat risk scoring.
POST /api/prediction
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from ml.predict import predict_heat_risk
from mlops.mlops_pipeline import log_inference

router = APIRouter()

class PredictionRequest(BaseModel):
    lst: float = Field(..., ge=15.0, le=60.0, description="Land Surface Temperature (°C)")
    ndvi: float = Field(..., ge=-1.0, le=1.0, description="Normalized Difference Vegetation Index")
    building_density: Optional[float] = Field(0.6, ge=0.0, le=1.0, description="Building footprint ratio (0-1)")
    road_density: Optional[float] = Field(12.0, ge=0.0, le=30.0, description="Road density (km/km²)")
    population_density: Optional[float] = Field(12000.0, ge=100.0, le=50000.0, description="Persons / km²")
    green_cover: Optional[float] = Field(0.20, ge=0.0, le=1.0, description="Green canopy cover (0-1)")
    dist_water_body: Optional[float] = Field(1000.0, ge=10.0, le=10000.0, description="Distance to water (meters)")

@router.post("/prediction")
async def predict_risk(req: PredictionRequest):
    """
    Executes raw feature risk scoring using the trained Random Forest model.
    Returns classified vulnerability level, class probabilities, and explainability factors.
    """
    features = req.model_dump()
    result = predict_heat_risk(features)
    log_inference(features, result)
    return {
        "status": "success",
        "prediction": result
    }
