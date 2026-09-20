"""
Model training and evaluation pipeline for UrbanChill AI.
Trains a Scikit-Learn RandomForestClassifier to classify urban heat-risk.
Saves model artifact and writes MLOps metadata.
"""

import os
import json
import datetime
import numpy as np
import pandas as pd
import joblib
import sys
from pathlib import Path

# Ensure backend root is in python path
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ml.dataset import generate_synthetic_urban_dataset, get_train_test_split, FEATURE_COLUMNS, RISK_CLASSES

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    f1_score,
    confusion_matrix,
)

MODEL_DIR = Path(__file__).parent / "artifacts"
MODEL_PATH = MODEL_DIR / "heat_risk_model.joblib"
MLOPS_DIR = Path(__file__).parent.parent / "mlops"
METADATA_PATH = MLOPS_DIR / "model_metadata.json"

def train_model(
    n_samples: int = 2000,
    n_estimators: int = 120,
    max_depth: int = 12,
    random_state: int = 42
) -> dict:
    """
    Trains the Random Forest model pipeline, evaluates performance,
    persists the model artifact, and logs MLOps metadata.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    MLOPS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Dataset Generation & Splitting
    df = generate_synthetic_urban_dataset(n_samples=n_samples, random_state=random_state)
    X_train, X_test, y_train, y_test = get_train_test_split(df, test_size=0.2, random_state=random_state)
    
    # 2. Pipeline Construction
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=1
        ))
    ])
    
    # 3. Model Fitting
    pipeline.fit(X_train, y_train)
    
    # 4. Evaluation
    y_pred = pipeline.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    f1_macro = float(f1_score(y_test, y_pred, average="macro"))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted"))
    cm = confusion_matrix(y_test, y_pred, labels=RISK_CLASSES).tolist()
    
    report = classification_report(y_test, y_pred, labels=RISK_CLASSES, output_dict=True)
    
    # 5. Extract Feature Importances
    rf = pipeline.named_steps["classifier"]
    importances = rf.feature_importances_
    feature_importance_dict = {
        col: round(float(imp), 4)
        for col, imp in zip(FEATURE_COLUMNS, importances)
    }
    # Sort descending
    feature_importance_dict = dict(sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    # 6. Save Model Artifact
    joblib.dump(pipeline, MODEL_PATH)
    
    # 7. Compute Baseline Feature Statistics for MLOps Data Drift Monitoring
    baseline_stats = {}
    for col in FEATURE_COLUMNS:
        baseline_stats[col] = {
            "mean": float(df[col].mean()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "p25": float(df[col].quantile(0.25)),
            "p50": float(df[col].median()),
            "p75": float(df[col].quantile(0.75)),
        }
    
    # 8. MLOps Metadata
    metadata = {
        "model_name": "UrbanChill_HeatRisk_RandomForest",
        "model_version": "1.0.0",
        "framework": "scikit-learn",
        "algorithm": "RandomForestClassifier",
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "n_samples": n_samples,
        "n_features": len(FEATURE_COLUMNS),
        "feature_names": FEATURE_COLUMNS,
        "target_classes": RISK_CLASSES,
        "hyperparameters": {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "class_weight": "balanced"
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "confusion_matrix": cm,
            "detailed_report": report
        },
        "feature_importances": feature_importance_dict,
        "baseline_feature_distributions": baseline_stats,
        "artifact_path": str(MODEL_PATH)
    }
    
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[UrbanChill ML] Model trained successfully! Accuracy: {accuracy:.4f}, F1-Macro: {f1_macro:.4f}")
    print(f"[UrbanChill ML] Saved artifact to {MODEL_PATH}")
    print(f"[UrbanChill MLOps] Metadata written to {METADATA_PATH}")
    
    return metadata

if __name__ == "__main__":
    train_model()
