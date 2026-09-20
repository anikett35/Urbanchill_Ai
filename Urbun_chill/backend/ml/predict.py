"""
Inference service for UrbanChill AI heat-risk classification.
Loads the serialized Random Forest pipeline, verifies feature inputs,
and returns risk classification, class probabilities, and explainability insights.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import joblib

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ml.dataset import FEATURE_COLUMNS, RISK_CLASSES
from ml.train import MODEL_PATH, train_model

_MODEL_CACHE = None

def get_model():
    """Retrieves or loads the cached Random Forest model pipeline."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
    
    if not MODEL_PATH.exists():
        print(f"[UrbanChill ML] Model artifact missing at {MODEL_PATH}. Training new model...")
        train_model()
        
    _MODEL_CACHE = joblib.load(MODEL_PATH)
    return _MODEL_CACHE

def predict_heat_risk(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Executes inference for a single spatial zone / city observation.
    
    Input features expected:
    - lst: Land Surface Temp (°C)
    - ndvi: Normalized Difference Veg Index (-0.2 to 0.9)
    - building_density: 0.0 to 1.0
    - road_density: km/km²
    - population_density: persons/km²
    - green_cover: 0.0 to 1.0
    - dist_water_body: meters
    """
    model = get_model()
    
    # Fill in defaults if any feature is omitted
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
    for col in FEATURE_COLUMNS:
        val = float(features.get(col, defaults[col]))
        input_vector.append(val)
        
    X = np.array([input_vector])
    
    # Predict label and class probabilities
    pred_label = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    
    classes = model.classes_
    prob_dict = {
        cls: round(float(prob), 4)
        for cls, prob in zip(classes, probabilities)
    }
    
    confidence = prob_dict.get(pred_label, 0.0)
    
    # Explainability: identify which features are driving heat vulnerability
    # High LST, low NDVI, high building density are primary risk drivers
    risk_factors = []
    lst_val = features.get("lst", defaults["lst"])
    ndvi_val = features.get("ndvi", defaults["ndvi"])
    bd_val = features.get("building_density", defaults["building_density"])
    gc_val = features.get("green_cover", defaults["green_cover"])
    
    if lst_val >= 38.0:
        risk_factors.append(f"Elevated Land Surface Temperature ({lst_val:.1f}°C)")
    if ndvi_val < 0.20:
        risk_factors.append(f"Depleted vegetative index (NDVI: {ndvi_val:.2f})")
    if bd_val > 0.65:
        risk_factors.append(f"High impervious surface & built density ({(bd_val * 100):.0f}%)")
    if gc_val < 0.15:
        risk_factors.append(f"Insufficient urban canopy (Green Cover: {(gc_val * 100):.0f}%)")
        
    if not risk_factors:
        risk_factors.append("Balanced urban environmental indicators")
        
    return {
        "risk_level": pred_label,
        "confidence": confidence,
        "probabilities": prob_dict,
        "primary_risk_factors": risk_factors,
        "inputs_evaluated": {col: input_vector[i] for i, col in enumerate(FEATURE_COLUMNS)}
    }
