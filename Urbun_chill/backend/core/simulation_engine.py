"""
UrbanChill AI - Authoritative Biophysical Simulation Engine
Provides bounded non-linear diminishing-returns cooling calculations
shared identically across REST API endpoints, PDF reports, and GIS layers.
"""

import math
from typing import Dict

def compute_diminishing_cooling(trees: float, roofs: float, parks: int, water: float) -> Dict[str, float]:
    """
    Computes bounded cooling impact using asymptotic saturation curves:
    dT = dT_max * (1 - exp(-k * intervention))
    Prevents physically impossible infinite cooling from high intervention values.
    
    Parameters:
    - trees: percentage increase in tree canopy (0 to 60%)
    - roofs: percentage conversion to cool reflective roofs (0 to 100%)
    - parks: number of decentralized urban pocket parks added (0 to 20)
    - water: percentage expansion in water retention basins (0 to 30%)
    
    Returns:
    Dictionary containing component-wise and total LST reductions in Celsius.
    """
    c_trees = round(2.6 * (1.0 - math.exp(-0.035 * max(0.0, float(trees)))), 2)
    c_roofs = round(2.0 * (1.0 - math.exp(-0.024 * max(0.0, float(roofs)))), 2)
    c_parks = round(1.5 * (1.0 - math.exp(-0.16 * max(0, int(parks)))), 2)
    c_water = round(1.2 * (1.0 - math.exp(-0.055 * max(0.0, float(water)))), 2)
    
    total = round(c_trees + c_roofs + c_parks + c_water, 2)
    return {
        "from_tree_canopy_deg_c": c_trees,
        "from_cool_roofs_deg_c": c_roofs,
        "from_parks_deg_c": c_parks,
        "from_water_deg_c": c_water,
        "total_lst_reduction_deg_c": total
    }
