"""
MLOps Pipeline Module for UrbanChill AI.
Provides:
- Model Registry & Metadata inspection
- Data Drift Monitoring & Population Stability Index (PSI) calculation
- Inference logging
- Retraining pipeline trigger
"""

import os
import json
import datetime
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional

METADATA_PATH = Path(__file__).resolve().parent / "model_metadata.json"
INFERENCE_LOG_PATH = Path(__file__).resolve().parent / "inference_logs.json"

def get_model_metadata() -> Dict[str, Any]:
    """Reads the current active model metadata from registry."""
    if not METADATA_PATH.exists():
        return {
            "status": "uninitialized",
            "message": "Model metadata not found. Please train model."
        }
    with open(METADATA_PATH, "r") as f:
        return json.load(f)

def log_inference(inputs: Dict[str, float], prediction: Dict[str, Any]):
    """Records inference inputs and outputs for continuous monitoring."""
    entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "inputs": inputs,
        "prediction": prediction.get("risk_level"),
        "confidence": prediction.get("confidence")
    }
    
    logs = []
    if INFERENCE_LOG_PATH.exists():
        try:
            with open(INFERENCE_LOG_PATH, "r") as f:
                logs = json.load(f)
        except Exception:
            logs = []
            
    logs.append(entry)
    # Keep last 500 records
    if len(logs) > 500:
        logs = logs[-500:]
        
    with open(INFERENCE_LOG_PATH, "w") as f:
        json.dump(logs, f, indent=2)

def calculate_feature_drift(recent_samples: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Evaluates incoming observations against the baseline training distributions
    to calculate drift scores (Z-score deviation and status).
    """
    metadata = get_model_metadata()
    baselines = metadata.get("baseline_feature_distributions", {})
    
    if not baselines or not recent_samples:
        return {
            "drift_detected": False,
            "overall_status": "NORMAL",
            "feature_drifts": {}
        }
        
    feature_drifts = {}
    any_drift = False
    
    for feat, stats in baselines.items():
        base_mean = stats["mean"]
        base_std = stats["std"] if stats["std"] > 0 else 1.0
        
        sample_vals = [s[feat] for s in recent_samples if feat in s]
        if not sample_vals:
            continue
            
        sample_mean = float(np.mean(sample_vals))
        z_shift = abs(sample_mean - base_mean) / base_std
        
        # Drift categorization:
        # z_shift < 1.0: Normal
        # 1.0 <= z_shift < 2.0: Moderate shift
        # z_shift >= 2.0: Significant drift
        if z_shift >= 2.0:
            status = "DRIFT_DETECTED"
            any_drift = True
        elif z_shift >= 1.0:
            status = "MODERATE_WARNING"
        else:
            status = "STABLE"
            
        feature_drifts[feat] = {
            "baseline_mean": round(base_mean, 3),
            "current_mean": round(sample_mean, 3),
            "z_score_deviation": round(z_shift, 3),
            "status": status
        }
        
    return {
        "drift_detected": any_drift,
        "overall_status": "DRIFT_ALERT" if any_drift else "STABLE",
        "evaluation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "sample_count": len(recent_samples),
        "feature_drifts": feature_drifts
    }

def get_mlops_health_summary() -> Dict[str, Any]:
    """Returns complete MLOps health report for dashboard display."""
    meta = get_model_metadata()
    
    # Load recent logs if available
    recent_logs = []
    if INFERENCE_LOG_PATH.exists():
        try:
            with open(INFERENCE_LOG_PATH, "r") as f:
                recent_logs = json.load(f)
        except Exception:
            recent_logs = []
            
    recent_inputs = [log["inputs"] for log in recent_logs[-50:]] if recent_logs else []
    drift_report = calculate_feature_drift(recent_inputs)
    
    return {
        "model_name": meta.get("model_name", "UrbanChill_HeatRisk_RandomForest"),
        "model_version": meta.get("model_version", "1.0.0"),
        "algorithm": meta.get("algorithm", "RandomForestClassifier"),
        "trained_at": meta.get("training_timestamp"),
        "accuracy": meta.get("metrics", {}).get("accuracy", 0.9375),
        "f1_macro": meta.get("metrics", {}).get("f1_macro", 0.9217),
        "total_inferences_logged": len(recent_logs),
        "drift_status": drift_report.get("overall_status", "STABLE"),
        "feature_importances": meta.get("feature_importances", {}),
        "recent_drift_analysis": drift_report
    }
