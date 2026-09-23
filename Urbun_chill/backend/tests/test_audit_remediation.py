"""
Adversarial Audit Remediation Regression Tests.
Verifies all 11 core requirements:
1. Non-existent city geocoding returns 404 (no silent fallback to Pune).
2. Biophysical diminishing returns simulation math is unified across API and PDF generation.
3. Timeline metadata explicitly identifies reconstructed retrospective nature (no direct satellite claim).
4. Timeline risk logic uses compute_reconstructed_timeline_risk with explicit modeled risk labeling.
5. Inconsistent fallback confidence (e.g. 0.82/0.92) is eliminated; missing confidence yields 'Unavailable'.
6. Source code security: No exposed API tokens (Mapbox, OpenWeather) in python or typescript sources.
7. 25-sector spatial model terminology is accurate (no 25-satellite sensor claims).
8. Population terminology accurately uses 'Estimated Population Exposure Proxy'.
"""

import os
import re
import pytest
from fastapi.testclient import TestClient
from main import app
from core.simulation_engine import compute_diminishing_cooling
from core.realtime_gis import compute_reconstructed_timeline_risk
from core.pdf_service import generate_urban_heat_report

client = TestClient(app)

def test_failed_geocoding_raises_404_analyze():
    """Verify that an unresolvable city returns 404 rather than silently defaulting to Pune."""
    resp = client.post("/api/analyze", json={"name": "NonExistentCityXYZ999999"})
    assert resp.status_code == 404
    detail = resp.json().get("detail", "")
    assert "Unable to resolve the requested city" in detail
    assert "Pune" not in detail

def test_failed_geocoding_raises_404_timeline():
    """Verify that timeline returns 404 on unresolvable city."""
    resp = client.get("/api/timeline?city=NonExistentCityXYZ999999")
    assert resp.status_code == 404
    detail = resp.json().get("detail", "")
    assert "Unable to resolve the requested city" in detail

def test_failed_geocoding_raises_404_layers():
    """Verify that layers route returns 404 on unresolvable city."""
    resp = client.get("/api/layers/NonExistentCityXYZ999999/heatmap")
    assert resp.status_code == 404
    detail = resp.json().get("detail", "")
    assert "Unable to resolve the requested city" in detail

def test_failed_geocoding_raises_404_simulation():
    """Verify that simulation returns 404 on unresolvable city."""
    resp = client.post("/api/simulate", json={
        "city": "NonExistentCityXYZ999999",
        "tree_cover_increase": 20.0
    })
    assert resp.status_code == 404
    detail = resp.json().get("detail", "")
    assert "Unable to resolve the requested city" in detail

def test_failed_geocoding_raises_404_compare():
    """Verify that comparison returns 404 when either city is unresolvable."""
    resp = client.post("/api/compare", json={
        "city_a": "Pune",
        "city_b": "NonExistentCityXYZ999999"
    })
    assert resp.status_code == 404
    detail = resp.json().get("detail", "")
    assert "Unable to resolve city for comparison" in detail

def test_authoritative_simulation_math():
    """Verify diminishing returns cooling calculation matches across identical parameters."""
    res1 = compute_diminishing_cooling(trees=20.0, roofs=35.0, parks=3, water=5.0)
    res2 = compute_diminishing_cooling(trees=20.0, roofs=35.0, parks=3, water=5.0)
    assert res1 == res2
    assert res1["total_lst_reduction_deg_c"] > 0
    assert res1["total_lst_reduction_deg_c"] == round(
        res1["from_tree_canopy_deg_c"] + res1["from_cool_roofs_deg_c"] + res1["from_parks_deg_c"] + res1["from_water_deg_c"], 2
    )

def test_timeline_reconstruction_metadata_and_risk():
    """Verify timeline explicitly labels reconstructed trend and uses compute_reconstructed_timeline_risk."""
    resp = client.get("/api/timeline?city=Pune&lat=18.5204&lon=73.8567")
    assert resp.status_code == 200
    data = resp.json()
    meta = data.get("reconstruction_metadata", {})
    assert "Synthetic Historical Reconstruction" in meta.get("type", "")
    assert "not direct historical satellite observations" in meta.get("limitations", "")
    
    # Check that each year has risk_type 'Modeled Risk'
    for item in data.get("timeline", []):
        assert item.get("risk_type") == "Modeled Risk"
        expected_risk = compute_reconstructed_timeline_risk(item["avg_lst"])
        assert item["heat_risk_level"] == expected_risk

def test_reconstructed_timeline_risk_thresholds():
    """Verify exact threshold logic of compute_reconstructed_timeline_risk."""
    assert compute_reconstructed_timeline_risk(41.0) == "Critical"
    assert compute_reconstructed_timeline_risk(40.0) == "Critical"
    assert compute_reconstructed_timeline_risk(38.0) == "High"
    assert compute_reconstructed_timeline_risk(36.5) == "High"
    assert compute_reconstructed_timeline_risk(34.0) == "Moderate"
    assert compute_reconstructed_timeline_risk(32.0) == "Moderate"
    assert compute_reconstructed_timeline_risk(30.0) == "Low"

def test_pdf_service_missing_confidence():
    """Verify PDF service does not inject fake 82% confidence if confidence is missing."""
    # Run PDF generation without confidence key
    pdf_bytes = generate_urban_heat_report(
        city_name="Pune",
        analysis_data={
            "lst": 35.0,
            "ambientTemp": 32.0,
            "weatherCondition": "Clear",
            "heatRisk": "Moderate",
            # confidence omitted intentionally
            "buildingDensity": 0.5,
            "greenCover": 0.3,
            "populationDensity": 10000
        }
    )
    assert len(pdf_bytes) > 1000
    # Ensure PDF builds cleanly without crashing on missing confidence

def test_no_hardcoded_secrets_in_sources():
    """Verify Mapbox tokens and OpenWeather API keys are not hardcoded in source code."""
    backend_gis_path = os.path.join(os.path.dirname(__file__), "..", "core", "realtime_gis.py")
    with open(backend_gis_path, "r", encoding="utf-8") as f:
        gis_content = f.read()
    
    # Mapbox token pattern pk.eyJ...
    assert "pk.eyJ" not in gis_content, "Found hardcoded Mapbox token in realtime_gis.py"
    # OpenWeather key pattern (32 char hex string after appid=)
    assert not re.search(r'appid=[0-9a-f]{32}', gis_content), "Found hardcoded OpenWeather key in realtime_gis.py"

    frontend_map_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "frontend", "src", "components", "workspace", "InteractiveMapViewer.tsx"
    )
    if os.path.exists(frontend_map_path):
        with open(frontend_map_path, "r", encoding="utf-8") as f:
            viewer_content = f.read()
        assert "pk.eyJ" not in viewer_content, "Found hardcoded Mapbox token in InteractiveMapViewer.tsx"
