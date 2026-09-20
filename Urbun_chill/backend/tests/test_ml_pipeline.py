"""
Unit and integration tests for the UrbanChill ML & MLOps pipeline.
"""

import os
import pytest
from pathlib import Path

from ml.dataset import generate_synthetic_urban_dataset, get_train_test_split, FEATURE_COLUMNS, RISK_CLASSES
from ml.predict import predict_heat_risk, get_model
from mlops.mlops_pipeline import get_model_metadata, calculate_feature_drift

def test_dataset_generation():
    df = generate_synthetic_urban_dataset(n_samples=100, random_state=42)
    assert len(df) == 100
    for col in FEATURE_COLUMNS:
        assert col in df.columns
    assert "risk_label" in df.columns
    for label in df["risk_label"].unique():
        assert label in RISK_CLASSES

def test_train_test_split():
    df = generate_synthetic_urban_dataset(n_samples=100, random_state=42)
    X_train, X_test, y_train, y_test = get_train_test_split(df, test_size=0.2)
    assert len(X_train) == 80
    assert len(X_test) == 20
    assert len(y_train) == 80
    assert len(y_test) == 20

def test_model_loading_and_prediction():
    model = get_model()
    assert model is not None
    
    # Test typical high-heat scenario
    high_heat_sample = {
        "lst": 42.0,
        "ndvi": 0.12,
        "building_density": 0.85,
        "road_density": 18.0,
        "population_density": 25000.0,
        "green_cover": 0.08,
        "dist_water_body": 3000.0
    }
    pred = predict_heat_risk(high_heat_sample)
    assert "risk_level" in pred
    assert pred["risk_level"] in ["High", "Critical"]
    assert pred["confidence"] > 0.4
    assert len(pred["primary_risk_factors"]) > 0

    # Test cool vegetated scenario
    cool_sample = {
        "lst": 26.0,
        "ndvi": 0.65,
        "building_density": 0.20,
        "road_density": 4.0,
        "population_density": 2000.0,
        "green_cover": 0.60,
        "dist_water_body": 200.0
    }
    pred_cool = predict_heat_risk(cool_sample)
    assert pred_cool["risk_level"] in ["Low", "Moderate"]

def test_mlops_metadata_integrity():
    meta = get_model_metadata()
    assert meta.get("model_name") == "UrbanChill_HeatRisk_RandomForest"
    assert "accuracy" in meta.get("metrics", {})
    assert meta["metrics"]["accuracy"] > 0.85
    assert len(meta.get("feature_importances", {})) == 7

def test_drift_detection():
    # Normal samples (close to baseline)
    normal_samples = [
        {"lst": 36.0, "ndvi": 0.25, "building_density": 0.6},
        {"lst": 35.5, "ndvi": 0.26, "building_density": 0.58}
    ]
    drift = calculate_feature_drift(normal_samples)
    assert "drift_detected" in drift
    assert drift["overall_status"] in ["STABLE", "MODERATE_WARNING"]
