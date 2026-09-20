"""
Dataset generation and preprocessing module for UrbanChill AI.
Features correspond to multispectral satellite indicators & spatial metrics:
1. LST: Land Surface Temperature in Celsius (Band 10 Landsat-8)
2. NDVI: Normalized Difference Vegetation Index (-0.2 to 0.9)
3. building_density: Ratio of built-up footprint (0.0 to 1.0)
4. road_density: Road length density in km/km² (0.0 to 25.0)
5. population_density: Estimated persons per km² (500 to 35,000)
6. green_cover: Proportion of canopy and grass cover (0.0 to 0.8)
7. dist_water_body: Euclidean distance to nearest surface water body in meters (10 to 5000)

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

def generate_synthetic_urban_dataset(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic urban heat vulnerability dataset based on satellite
    and municipal GIS profiles for model training and evaluation.
    """
    rng = np.random.RandomState(random_state)
    
    # 1. Base land surface temperature (°C): typical summer urban distribution
    lst = rng.normal(loc=36.5, scale=5.5, size=n_samples)
    lst = np.clip(lst, 22.0, 52.0)
    
    # 2. NDVI: inversely correlated with high LST and dense built environment
    ndvi_noise = rng.normal(loc=0.0, scale=0.08, size=n_samples)
    ndvi = 0.85 - (lst - 22.0) * 0.022 + ndvi_noise
    ndvi = np.clip(ndvi, -0.15, 0.85)
    
    # 3. Building density: positively correlated with LST
    bd_noise = rng.normal(loc=0.0, scale=0.1, size=n_samples)
    building_density = (lst - 24.0) * 0.03 + bd_noise
    building_density = np.clip(building_density, 0.05, 0.95)
    
    # 4. Road density (km / km²)
    road_density = building_density * 18.0 + rng.normal(loc=2.0, scale=2.0, size=n_samples)
    road_density = np.clip(road_density, 1.0, 24.0)
    
    # 5. Population density (persons / km²)
    pop_density = building_density * 28000 + rng.normal(loc=1500, scale=2000, size=n_samples)
    pop_density = np.clip(pop_density, 500, 38000)
    
    # 6. Green cover percentage
    green_cover = np.clip(ndvi * 0.95 + rng.normal(loc=0.0, scale=0.04, size=n_samples), 0.02, 0.80)
    
    # 7. Distance to water body (meters)
    dist_water_body = rng.exponential(scale=1200, size=n_samples)
    dist_water_body = np.clip(dist_water_body, 15.0, 6000.0)
    
    # Composite heat risk score calculation (domain heuristic)
    # Higher LST, building density, pop density, road density increase risk;
    # Higher NDVI, green cover decrease risk.
    norm_lst = (lst - 22.0) / 30.0
    norm_ndvi = (0.85 - ndvi) / 1.0
    norm_bd = building_density
    norm_road = road_density / 24.0
    norm_pop = pop_density / 38000.0
    norm_green = 1.0 - (green_cover / 0.8)
    norm_water = np.clip(dist_water_body / 3000.0, 0.0, 1.0)
    
    risk_score = (
        0.30 * norm_lst +
        0.20 * norm_ndvi +
        0.18 * norm_bd +
        0.10 * norm_road +
        0.10 * norm_pop +
        0.07 * norm_green +
        0.05 * norm_water
    )
    
    # Classify into 4 quantiles / thresholds
    risk_labels = []
    for score in risk_score:
        if score < 0.33:
            risk_labels.append("Low")
        elif score < 0.52:
            risk_labels.append("Moderate")
        elif score < 0.72:
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
    """Splits dataset into feature matrices and target arrays."""
    from sklearn.model_selection import train_test_split
    
    X = df[FEATURE_COLUMNS].values
    y = df["risk_label"].values
    
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
