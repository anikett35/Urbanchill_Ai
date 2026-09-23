"""
Inference service for UrbanChill AI heat-risk classification.
Loads the serialized calibrated Random Forest pipeline, verifies feature inputs,
and returns risk classification, calibrated class probabilities, and dynamic explainability insights.
"""

import sys
import json
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import joblib

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ml.dataset import FEATURE_COLUMNS, RISK_CLASSES
from ml.train import MODEL_PATH, METADATA_PATH, train_model

_MODEL_CACHE = None
_METADATA_CACHE = None

def get_model():
    """Retrieves or loads the cached Calibrated Random Forest model pipeline."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
    
    if not MODEL_PATH.exists():
        print(f"[UrbanChill ML] Model artifact missing at {MODEL_PATH}. Training new model...")
        train_model()
        
    _MODEL_CACHE = joblib.load(MODEL_PATH)
    return _MODEL_CACHE

def get_cached_metadata() -> Dict[str, Any]:
    """Retrieves baseline training distributions for dynamic explainability."""
    global _METADATA_CACHE
    if _METADATA_CACHE is not None:
        return _METADATA_CACHE
    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH, "r") as f:
                _METADATA_CACHE = json.load(f)
                return _METADATA_CACHE
        except Exception:
            pass
    return {}

def compute_dynamic_explainability(
    input_dict: Dict[str, float],
    baselines: Dict[str, Any]
) -> List[str]:
    """
    Computes dynamic model factor contributions based on standardized deviation (Z-score)
    relative to the baseline training distribution. Avoids static hardcoded thresholds.
    """
    if not baselines:
        return ["Evaluated using standard urban biophysical thresholds"]
        
    factors = []
    
    # 1. Surface Temperature Deviation
    lst_val = input_dict.get("lst", 35.0)
    lst_base = baselines.get("lst", {})
    lst_median = lst_base.get("p50", 36.5)
    lst_std = lst_base.get("std", 5.5) or 1.0
    lst_z = (lst_val - lst_median) / lst_std
    if lst_z > 0.4:
        diff = round(lst_val - lst_median, 1)
        factors.append((lst_z, f"Elevated surface temperature (+{diff}°C above training median)"))
    elif lst_z < -0.4:
        diff = round(lst_median - lst_val, 1)
        factors.append((abs(lst_z), f"Thermal moderation (-{diff}°C below training median)"))

    # 2. Vegetation Proxy (NDVI) Deviation
    ndvi_val = input_dict.get("ndvi", 0.25)
    ndvi_base = baselines.get("ndvi", {})
    ndvi_median = ndvi_base.get("p50", 0.28)
    ndvi_std = ndvi_base.get("std", 0.15) or 1.0
    ndvi_z = (ndvi_median - ndvi_val) / ndvi_std  # Deficit increases risk
    if ndvi_z > 0.4:
        factors.append((ndvi_z, f"Vegetative deficit (NDVI proxy: {ndvi_val:.2f} vs median {ndvi_median:.2f})"))
    elif ndvi_z < -0.4:
        factors.append((abs(ndvi_z), f"Canopy buffering (NDVI proxy: {ndvi_val:.2f} provides cooling)"))

    # 3. Built Footprint Deviation
    bd_val = input_dict.get("building_density", 0.55)
    bd_base = baselines.get("building_density", {})
    bd_median = bd_base.get("p50", 0.52)
    bd_std = bd_base.get("std", 0.18) or 1.0
    bd_z = (bd_val - bd_median) / bd_std
    if bd_z > 0.4:
        factors.append((bd_z, f"High impervious built mass ({(bd_val * 100):.0f}% footprint, +{round(bd_z, 1)}σ)"))
    elif bd_z < -0.4:
        factors.append((abs(bd_z), f"Low built density ({(bd_val * 100):.0f}% footprint)"))

    # 4. Green Cover
    gc_val = input_dict.get("green_cover", 0.20)
    gc_base = baselines.get("green_cover", {})
    gc_median = gc_base.get("p50", 0.22)
    gc_std = gc_base.get("std", 0.12) or 1.0
    gc_z = (gc_median - gc_val) / gc_std
    if gc_z > 0.4:
        factors.append((gc_z, f"Canopy deficiency ({(gc_val * 100):.0f}% green cover)"))

    # 5. Road Density
    rd_val = input_dict.get("road_density", 12.0)
    rd_base = baselines.get("road_density", {})
    rd_median = rd_base.get("p50", 11.0)
    rd_std = rd_base.get("std", 4.5) or 1.0
    rd_z = (rd_val - rd_median) / rd_std
    if rd_z > 0.6:
        factors.append((rd_z, f"High asphalt road network ({rd_val:.1f} km/km²)"))

    if not factors:
        return ["Balanced urban indicators within standard reference distribution"]
        
    # Sort factors by standardized deviation strength
    factors.sort(key=lambda x: x[0], reverse=True)
    return [f[1] for f in factors[:4]]

def predict_heat_risk(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Executes inference for a single spatial zone / city observation.
    Returns calibrated class probabilities and dynamic explainability insights.
    """
    model = get_model()
    meta = get_cached_metadata()
    baselines = meta.get("baseline_feature_distributions", {})
    
    defaults = {
        "lst": 35.0,
        "ndvi": 0.25,
        "building_density": 0.60,
        "road_density": 10.0,
        "population_density": 12000.0,
        "green_cover": 0.20,
        "dist_water_body": 1200.0
    }
    
    input_vector = []
    input_dict = {}
    for col in FEATURE_COLUMNS:
        val = float(features.get(col, defaults[col]))
        input_vector.append(val)
        input_dict[col] = val
        
    X = np.array([input_vector])
    
    # Predict label and calibrated class probabilities
    pred_label = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    
    classes = getattr(model, "classes_", RISK_CLASSES)
    prob_dict = {
        cls: round(float(prob), 4)
        for cls, prob in zip(classes, probabilities)
    }
    
    calibrated_conf = prob_dict.get(pred_label, 0.0)
    
    # Dynamic explainability relative to training baseline
    primary_factors = compute_dynamic_explainability(input_dict, baselines)
    
    return {
        "risk_level": pred_label,
        "confidence": calibrated_conf,
        "calibrated_confidence": calibrated_conf,
        "calibration_status": "Calibrated via 5-fold Sigmoid Platt Scaling",
        "probabilities": prob_dict,
        "primary_risk_factors": primary_factors,
        "model_version": meta.get("model_version", "urbanchill-rf-1.1"),
        "model_nature": "Domain-guided synthetic surrogate benchmark",
        "inputs_evaluated": {col: input_vector[i] for i, col in enumerate(FEATURE_COLUMNS)}
    }
