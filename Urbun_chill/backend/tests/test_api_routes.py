"""
Integration tests for FastAPI REST endpoints in UrbanChill AI.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "/api/analyze" in data["endpoints"]

def test_analyze_endpoint():
    resp = client.post("/api/analyze", json={"name": "Pune"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Pune"
    assert "heatRisk" in data
    assert "lst" in data
    assert "ndvi" in data
    assert len(data["topHeatZones"]) > 0
    assert len(data["recommendations"]) > 0
    assert len(data["weeklyForecast"]) == 7

def test_prediction_endpoint():
    payload = {
        "lst": 41.5,
        "ndvi": 0.15,
        "building_density": 0.8,
        "road_density": 16.0,
        "population_density": 22000.0,
        "green_cover": 0.10,
        "dist_water_body": 2500.0
    }
    resp = client.post("/api/prediction", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "prediction" in data
    assert data["prediction"]["risk_level"] in ["High", "Critical"]

def test_layers_endpoint():
    resp = client.get("/api/layers/Pune/heatmap?grid_size=3")
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Pune"
    assert data["geojson"]["type"] == "FeatureCollection"
    assert len(data["geojson"]["features"]) == 9  # 3x3 grid

def test_timeline_endpoint():
    resp = client.get("/api/timeline?city=Pune")
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Pune"
    assert len(data["timeline"]) == 9
    assert data["timeline"][0]["year"] == 2018
    assert data["timeline"][-1]["year"] == 2026

def test_simulate_endpoint():
    payload = {
        "city": "Pune",
        "tree_cover_increase": 25.0,
        "cool_roofs_ratio": 50.0,
        "urban_parks_added": 4,
        "water_bodies_expansion": 8.0
    }
    resp = client.post("/api/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Pune"
    assert data["cooling_breakdown"]["total_lst_reduction_deg_c"] > 2.0
    assert data["before_vs_after"]["lst"]["after"] < data["before_vs_after"]["lst"]["before"]

def test_compare_endpoint():
    payload = {
        "city_a": "Pune",
        "city_b": "Mumbai"
    }
    resp = client.post("/api/compare", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["city_a"]["name"] == "Pune"
    assert data["city_b"]["name"] == "Mumbai"
    assert "comparative_summary" in data

def test_report_endpoint():
    resp = client.get("/api/report/download?city=Pune")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert len(resp.content) > 1000  # Valid binary PDF content

def test_mlops_status_endpoint():
    resp = client.get("/api/mlops/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["mlops"]["model_name"] == "UrbanChill_HeatRisk_RandomForest"
    assert data["mlops"]["accuracy"] > 0.85
