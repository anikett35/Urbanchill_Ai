"""
API endpoints for MLOps governance, data drift detection, and continuous training.
GET /api/mlops/status
POST /api/mlops/drift-check
POST /api/mlops/retrain
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from mlops.mlops_pipeline import get_mlops_health_summary, calculate_feature_drift
from ml.train import train_model

router = APIRouter()

class DriftCheckRequest(BaseModel):
    samples: List[Dict[str, float]]

@router.get("/mlops/status")
async def get_status():
    """
    Returns complete MLOps health report including:
    - Active model registry metadata
    - Cross-validated Accuracy and F1 scores
    - Feature importance hierarchy
    - Continuous data drift monitoring status
    - Total inference logs count
    """
    summary = get_mlops_health_summary()
    return {
        "status": "success",
        "mlops": summary
    }

@router.post("/mlops/drift-check")
async def check_drift(req: DriftCheckRequest):
    """
    Evaluates a batch of recent inferences against the baseline training distribution
    to detect any feature drift (e.g. rising summer temperatures or sudden vegetation drops).
    """
    result = calculate_feature_drift(req.samples)
    return {
        "status": "success",
        "drift_report": result
    }

@router.post("/mlops/retrain")
async def trigger_retraining(n_samples: int = 2000):
    """
    Triggers an automated retraining run of the Random Forest model,
    re-evaluating metrics and updating the serialized artifact.
    """
    new_metadata = train_model(n_samples=n_samples)
    return {
        "status": "success",
        "message": "Retraining completed successfully",
        "new_version": new_metadata.get("model_version"),
        "accuracy": new_metadata.get("metrics", {}).get("accuracy"),
        "f1_macro": new_metadata.get("metrics", {}).get("f1_macro")
    }
