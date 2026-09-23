"""
Dataset generation and preprocessing module for UrbanChill AI.

SCIENTIFIC NOTICE & METHODOLOGY:
This dataset is a domain-guided synthetic surrogate benchmark, calibrated according to
IPCC Urban Heat Vulnerability rubrics and urban biophysical thermodynamics.
It simulates multi-factor urban exposure for prototype spatial risk modeling.
Target labels are NOT derived from empirical hospital admissions or ground meteorological stations;
performance metrics represent synthetic benchmark surrogate capability, not field-validated ground truth.

Features correspond to satellite indicators & spatial metrics:
1. lst: Land Surface Temperature proxy in Celsius
2. ndvi: Estimated Vegetation Index Proxy (-0.2 to 0.9)
3. building_density: Ratio of built-up footprint (0.0 to 1.0)
4. road_density: Road length density in km/km² (0.0 to 25.0)
5. population_density: Estimated population exposure proxy (persons per km², 500 to 38,000)
6. green_cover: Proportion of canopy and grass cover (0.0 to 0.8)
7. dist_water_body: Euclidean distance to nearest surface water body in meters (10 to 6000)

Labels:
- Low: Resilient urban sector, minimal thermal stress
- Moderate: Mild thermal discomfort, moderate built density
- High: Severe heat island, low vegetation, high built mass
- Critical: Acute urban heat risk zone requiring immediate intervention
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any

FEATURE_COLUMNS = [
    "lst",
    "ndvi",
    "building_density",
    "road_density",
    "population_density",
    "green_cover",
    "dist_water_body"
]

RISK_CLASSES = ["Low", "Moderate", "High", "Critical"]

def generate_synthetic_urban_dataset(n_samples: int = 2000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic domain-guided urban heat vulnerability benchmark dataset
    incorporating nonlinear thermal compounding, vegetative buffering, and realistic environmental noise.
    """
    rng = np.random.RandomState(random_state)
    
    # 1. Base land surface temperature (°C): typical summer urban distribution
    lst = rng.normal(loc=36.5, scale=5.8, size=n_samples)
    lst = np.clip(lst, 20.0, 53.0)
    
    # 2. NDVI: inversely correlated with high LST and dense built environment
    ndvi_noise = rng.normal(loc=0.0, scale=0.09, size=n_samples)
    ndvi = 0.82 - (lst - 20.0) * 0.021 + ndvi_noise
    ndvi = np.clip(ndvi, -0.15, 0.85)
    
    # 3. Building density: positively correlated with LST
    bd_noise = rng.normal(loc=0.0, scale=0.11, size=n_samples)
    building_density = (lst - 22.0) * 0.028 + bd_noise
    building_density = np.clip(building_density, 0.05, 0.95)
    
    # 4. Road density (km / km²)
    road_density = building_density * 17.5 + rng.normal(loc=2.0, scale=2.5, size=n_samples)
    road_density = np.clip(road_density, 1.0, 25.0)
    
    # 5. Population exposure density (persons / km²)
    pop_density = building_density * 26000 + rng.normal(loc=2000, scale=2800, size=n_samples)
    pop_density = np.clip(pop_density, 500, 38000)
    
    # 6. Green cover percentage
    green_cover = np.clip(ndvi * 0.92 + rng.normal(loc=0.0, scale=0.05, size=n_samples), 0.02, 0.80)
    
    # 7. Distance to water body (meters)
    dist_water_body = rng.exponential(scale=1300, size=n_samples)
    dist_water_body = np.clip(dist_water_body, 15.0, 6000.0)
    
    # ── Non-Linear Biophysical Composite Risk Formulation ───────────────────────
    # Normalizations
    norm_lst = (lst - 20.0) / 33.0
    norm_ndvi = (0.85 - ndvi) / 1.0
    norm_bd = building_density
    norm_road = road_density / 25.0
    norm_pop = pop_density / 38000.0
    norm_green = 1.0 - (green_cover / 0.8)
    norm_water = np.clip(dist_water_body / 3500.0, 0.0, 1.0)
    
    # Non-linear thermal compounding: High LST + Dense Built Mass creates amplified heat trapping
    compounding_uhi = norm_lst * norm_bd * 0.18
    # Vegetative buffer dampens extreme risk
    vegetative_damping = np.exp(-2.5 * green_cover) * 0.12
    # Realistic environmental stochastic noise (prevents trivial 1-to-1 deterministic memorization)
    stochastic_noise = rng.normal(loc=0.0, scale=0.045, size=n_samples)
    
    risk_score = (
        0.28 * norm_lst +
        0.18 * norm_ndvi +
        0.16 * norm_bd +
        0.08 * norm_road +
        0.08 * norm_pop +
        0.06 * norm_green +
        0.04 * norm_water +
        compounding_uhi +
        vegetative_damping +
        stochastic_noise
    )
    
    # Classify into 4 quantiles / thresholds with realistic margin transitions
    risk_labels = []
    for score in risk_score:
        if score < 0.38:
            risk_labels.append("Low")
        elif score < 0.58:
            risk_labels.append("Moderate")
        elif score < 0.78:
            risk_labels.append("High")
        else:
            risk_labels.append("Critical")
            
    df = pd.DataFrame({
        "lst": np.round(lst, 2),
        "ndvi": np.round(ndvi, 3),
        "building_density": np.round(building_density, 3),
        "road_density": np.round(road_density, 2),
        "population_density": np.round(pop_density, 1),
        "green_cover": np.round(green_cover, 3),
        "dist_water_body": np.round(dist_water_body, 1),
        "risk_label": risk_labels
    })
    
    return df

def get_train_test_split(
    df: pd.DataFrame, 
    test_size: float = 0.2, 
    random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Splits dataset into feature matrices and target arrays with stratification."""
    from sklearn.model_selection import train_test_split
    
    X = df[FEATURE_COLUMNS].values
    y = df["risk_label"].values
    
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
