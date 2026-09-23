"""
Automated End-to-End Verification Test Script for UrbanChill AI.
Tests 100% Real-Time GIS Engine, Live Open-Meteo & OpenWeather Telemetry,
Mapbox Vector Morphology, ML Heat-Risk Pipeline, and Bilingual Voice Agent.
"""

import sys
import json
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_BASE = "http://localhost:8000/api"

def make_request(url: str, method: str = "GET", payload: dict = None):
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json", "User-Agent": "UrbanChillTest/1.0"}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_all():
    print("=" * 70)
    print("URBANCHILL AI - FULL REAL-TIME & VOICE AGENT VERIFICATION")
    print("=" * 70)
    
    # 1. Root Health Check
    status, root_data = make_request("http://localhost:8000/")
    assert status == 200, "Root check failed"
    print(f"[PASS] 1. Root API Status: {root_data.get('status')} (Architecture: {root_data.get('architecture')})")
    
    # 2. Analyze City - Pune
    pune_payload = {"name": "Pune", "lat": 18.5204, "lon": 73.8567}
    status, pune_data = make_request(f"{API_BASE}/analyze", method="POST", payload=pune_payload)
    assert status == 200, "Pune analysis failed"
    assert "lst" in pune_data and "heatRisk" in pune_data, "Missing LST or heatRisk in Pune response"
    print(f"[PASS] 2. Real-Time Telemetry for Pune:")
    print(f"       - LST: {pune_data['lst']}°C | Ambient: {pune_data['ambientTemp']}°C")
    print(f"       - Heat Risk: {pune_data['heatRisk']} (Confidence: {pune_data['confidence']})")
    print(f"       - Live Weather: {pune_data['weatherCondition']} | Humidity: {pune_data['humidity']}%")
    print(f"       - 7-Day Forecast Days: {len(pune_data['weeklyForecast'])}")
    
    # 3. Analyze City - Phoenix (Global Coordinate Verification)
    phx_payload = {"name": "Phoenix", "lat": 33.4484, "lon": -112.0740}
    status, phx_data = make_request(f"{API_BASE}/analyze", method="POST", payload=phx_payload)
    assert status == 200, "Phoenix analysis failed"
    assert phx_data['lst'] != pune_data['lst'], "LST should differ dynamically for Phoenix vs Pune!"
    print(f"[PASS] 3. Real-Time Telemetry for Phoenix, USA:")
    print(f"       - LST: {phx_data['lst']}°C | Ambient: {phx_data['ambientTemp']}°C")
    print(f"       - Heat Risk: {phx_data['heatRisk']}")
    print(f"       - Live Weather: {phx_data['weatherCondition']}")
    print(f"       - Dynamic Difference Verified: Pune={pune_data['lst']}°C vs Phoenix={phx_data['lst']}°C")

    # 4. Multi-Layer GeoJSON Grid
    status, layer_data = make_request(f"{API_BASE}/layers/Pune/all?lat=18.5204&lon=73.8567&grid_size=5")
    assert status == 200, "Layer fetch failed"
    features = layer_data.get("geojson", {}).get("features", [])
    assert len(features) == 25, f"Expected 25 sectors, got {len(features)}"
    sample_feat = features[0]
    assert sample_feat["geometry"]["type"] == "Polygon", "Expected GeoJSON Polygon"
    assert "heat_risk" in sample_feat["properties"], "Expected heat_risk in sector properties"
    print(f"[PASS] 4. Real-Time GeoJSON Grid:")
    print(f"       - Total Sectors: {len(features)} Polygons generated around Pune")
    print(f"       - Sample Sector: {sample_feat['properties']['name']}")
    print(f"       - Sector Telemetry: LST={sample_feat['properties']['lst']}°C, NDVI={sample_feat['properties']['ndvi']}, Risk={sample_feat['properties']['heat_risk']}")

    # 5. Coordinate Point Inspection
    inspect_payload = {"city": "Pune", "lat": 18.525, "lon": 73.858}
    status, insp_data = make_request(f"{API_BASE}/layers/inspect", method="POST", payload=inspect_payload)
    assert status == 200 and insp_data.get("status") == "success", "Inspection failed"
    insp = insp_data["inspection"]
    print(f"[PASS] 5. Click-to-Inspect Point Telemetry:")
    print(f"       - Target: ({insp['latitude']}, {insp['longitude']})")
    print(f"       - Point LST: {insp['lst']}°C | Building Density: {insp['building_density']} | Heat Risk: {insp['heat_risk']}")

    # 6. Bilingual Voice Agent - English Test
    agent_en_payload = {
        "message": "Analyze the current heat risk in Pune and give cooling recommendations",
        "language": "en",
        "city_context": pune_data
    }
    status, agent_en = make_request(f"{API_BASE}/agent/chat", method="POST", payload=agent_en_payload)
    assert status == 200, "Voice agent English failed"
    assert len(agent_en.get("speech", "")) > 10, "Speech text should be generated"
    assert len(agent_en.get("suggestions", [])) > 0, "Suggestions should be provided"
    print(f"[PASS] 6. Voice Agent (English):")
    print(f"       - Speech Output: \"{agent_en['speech'][:80]}...\"")
    print(f"       - Suggestions: {agent_en['suggestions']}")

    # 7. Bilingual Voice Agent - Hindi Test
    agent_hi_payload = {
        "message": "पुणे का तापमान और हीट रिस्क बताओ",
        "language": "hi",
        "city_context": pune_data
    }
    status, agent_hi = make_request(f"{API_BASE}/agent/chat", method="POST", payload=agent_hi_payload)
    assert status == 200, "Voice agent Hindi failed"
    assert agent_hi.get("language") == "hi", "Language should be Hindi"
    print(f"[PASS] 7. Voice Agent (Hindi / हिन्दी):")
    print(f"       - Speech Output: \"{agent_hi['speech'][:80]}...\"")
    print(f"       - Suggestions: {agent_hi['suggestions']}")

    # 8. Historical Timeline
    status, time_data = make_request(f"{API_BASE}/timeline?city=Pune&lat=18.5204&lon=73.8567")
    assert status == 200, "Timeline failed"
    timeline = time_data.get("timeline", [])
    assert len(timeline) == 9, "Expected 9 years (2018-2026)"
    print(f"[PASS] 8. Historical Timeline (2018-2026):")
    print(f"       - Years: {[y['year'] for y in timeline]}")
    print(f"       - 2018 LST: {timeline[0]['avg_lst']}°C -> 2026 LST: {timeline[-1]['avg_lst']}°C")

    # 9. What-If Cooling Simulation
    sim_payload = {
        "city": "Pune",
        "tree_cover_increase": 25.0,
        "cool_roofs_ratio": 40.0,
        "urban_parks_added": 4,
        "water_bodies_expansion": 8.0
    }
    status, sim_data = make_request(f"{API_BASE}/simulate", method="POST", payload=sim_payload)
    assert status == 200, "Simulation failed"
    reduction = sim_data["cooling_breakdown"]["total_lst_reduction_deg_c"]
    assert reduction > 0, "Cooling reduction must be positive"
    print(f"[PASS] 9. What-If Cooling Simulation:")
    print(f"       - Total Projected LST Drop: -{reduction}°C")
    print(f"       - Summary: {sim_data['summary']}")

    # 10. City Comparison
    comp_payload = {"city_a": "Pune", "city_b": "Phoenix", "lat_a": 18.5204, "lon_a": 73.8567, "lat_b": 33.4484, "lon_b": -112.0740}
    status, comp_data = make_request(f"{API_BASE}/compare", method="POST", payload=comp_payload)
    assert status == 200, "Comparison failed"
    print(f"[PASS] 10. Side-by-Side City Comparison:")
    print(f"        - {comp_data['comparative_summary']}")
    print("=" * 70)
    print("ALL 10 VERIFICATION TESTS COMPLETED SUCCESSFULLY WITH 100% PASS RATE!")
    print("=" * 70)

if __name__ == "__main__":
    test_all()
