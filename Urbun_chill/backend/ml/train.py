"""
Model training, calibration, and serialization pipeline for UrbanChill AI.
Trains and calibrates a Random Forest classifier with 5-fold Stratified Cross-Validation
and Sigmoid probability calibration (Platt Scaling).
Saves model artifact and writes complete reproducible MLOps metadata.
"""

import os
import sys
import json
import datetime
import numpy as np
import pandas as pd
import joblib
import sklearn
from pathlib import Path

# Ensure backend root is in python path
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ml.dataset import generate_synthetic_urban_dataset, get_train_test_split, FEATURE_COLUMNS, RISK_CLASSES

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
)

MODEL_DIR = Path(__file__).parent / "artifacts"
MODEL_PATH = MODEL_DIR / "heat_risk_model.joblib"
MLOPS_DIR = BACKEND_ROOT / "mlops"
METADATA_PATH = MLOPS_DIR / "model_metadata.json"

def train_model(
    n_samples: int = 2200,
    n_estimators: int = 120,
    max_depth: int = 12,
    random_state: int = 42
) -> dict:
    """
    Trains, cross-validates, and calibrates the Random Forest model pipeline,
    persists the artifact, and logs complete reproducible MLOps metadata.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    MLOPS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Dataset Generation & Splitting
    df = generate_synthetic_urban_dataset(n_samples=n_samples, random_state=random_state)
    X_train, X_test, y_train, y_test = get_train_test_split(df, test_size=0.2, random_state=random_state)
    
    # 2. Base Pipeline Construction
    base_rf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state,
        n_jobs=1
    )
    
    base_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", base_rf)
    ])
    
    # 3. 5-Fold Stratified Cross-Validation on Base Pipeline
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_scores = cross_val_score(base_pipeline, X_train, y_train, cv=cv, scoring="f1_macro")
    cv_macro_f1_mean = float(np.mean(cv_scores))
    cv_macro_f1_std = float(np.std(cv_scores))
    
    # 4. Probability Calibration (5-fold Sigmoid Platt Scaling)
    calibrated_pipeline = CalibratedClassifierCV(
        estimator=base_pipeline,
        method="sigmoid",
        cv=cv
    )
    calibrated_pipeline.fit(X_train, y_train)
    
    # Also fit base pipeline directly to extract raw feature importances
    base_pipeline.fit(X_train, y_train)
    rf_estimator = base_pipeline.named_steps["classifier"]
    raw_importances = rf_estimator.feature_importances_
    feature_importance_dict = {
        col: round(float(imp), 4)
        for col, imp in zip(FEATURE_COLUMNS, raw_importances)
    }
    feature_importance_dict = dict(sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    # 5. Comprehensive Test Set Evaluation
    y_pred = calibrated_pipeline.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    f1_macro = float(f1_score(y_test, y_pred, average="macro"))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted"))
    precision_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    recall_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    cm = confusion_matrix(y_test, y_pred, labels=RISK_CLASSES).tolist()
    report = classification_report(y_test, y_pred, labels=RISK_CLASSES, output_dict=True)
    
    # 6. Save Calibrated Model Artifact
    joblib.dump(calibrated_pipeline, MODEL_PATH)
    
    # 7. Compute Baseline Feature Statistics for Drift Monitoring & Dynamic Explainability
    baseline_stats = {}
    for col in FEATURE_COLUMNS:
        baseline_stats[col] = {
            "mean": round(float(df[col].mean()), 3),
            "std": round(float(df[col].std()), 3),
            "min": round(float(df[col].min()), 3),
            "max": round(float(df[col].max()), 3),
            "p25": round(float(df[col].quantile(0.25)), 3),
            "p50": round(float(df[col].median()), 3),
            "p75": round(float(df[col].quantile(0.75)), 3),
        }
    
    # 8. MLOps Metadata
    metadata = {
        "model_name": "UrbanChill_HeatRisk_RandomForest",
        "model_version": "urbanchill-rf-1.1",
        "framework": "scikit-learn",
        "sklearn_version": sklearn.__version__,
        "python_version": sys.version.split()[0],
        "algorithm": "RandomForestClassifier (Calibrated)",
        "calibration_status": "Calibrated via 5-fold Sigmoid Platt Scaling",
        "dataset_version": "synthetic-benchmark-v2",
        "scientific_notice": "Trained on domain-guided synthetic surrogate benchmark according to IPCC urban heat vulnerability rubrics.",
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
            "class_weight": "balanced",
            "calibration_method": "sigmoid"
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "test_accuracy": round(accuracy, 4),
            "f1_macro": round(f1_macro, 4),
            "test_macro_f1": round(f1_macro, 4),
            "test_weighted_f1": round(f1_weighted, 4),
            "test_precision_macro": round(precision_macro, 4),
            "test_recall_macro": round(recall_macro, 4),
            "cv_5fold_macro_f1_mean": round(cv_macro_f1_mean, 4),
            "cv_5fold_macro_f1_std": round(cv_macro_f1_std, 4),
            "confusion_matrix": cm,
            "detailed_report": report
        },
        "feature_importances": feature_importance_dict,
        "baseline_feature_distributions": baseline_stats,
        "artifact_path": str(MODEL_PATH)
    }
    
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[UrbanChill ML] Model v1.1 trained & calibrated successfully!")
    print(f"               Accuracy: {accuracy:.4f} | Macro-F1: {f1_macro:.4f} | 5-Fold CV F1: {cv_macro_f1_mean:.4f} +/- {cv_macro_f1_std:.4f}")
    print(f"[UrbanChill ML] Saved calibrated artifact to {MODEL_PATH}")
    print(f"[UrbanChill MLOps] Metadata written to {METADATA_PATH}")
    
    return metadata

if __name__ == "__main__":
    train_model()
