# UrbanChill AI

UrbanChill AI is a geo-intelligent decision support system that helps urban planners detect and mitigate the Urban Heat Island (UHI) effect. It shifts city heat management from "Post-Heat Reaction" to "Pre-Heat Prevention."

## 5-Layer Architecture

1. **Data Ingestion Layer**: Fetches satellite data (Landsat-8, Sentinel-2) via STAC and outputs Cloud-Optimized GeoTIFFs (COGs).
2. **Spatial Sync Layer**: Uses DuckDB Spatial and rioxarray to reproject into EPSG:3857 and intersect raster thermal values with vector building footprints and CDC SVI census tracts.
3. **AI Processing Layer**: Uses SegFormer to classify land cover, Random Forest to predict localized heat intensity, and calibrates Land Surface Temperature (LST).
4. **Recommendation Layer**: Identifies Heat-Vulnerability Clusters, calculates ROI for interventions, and provides an LLM agent for policy recommendations.
5. **Visualization Layer**: 3D dashboard with Mapbox GL JS v3 and Deck.gl for "What-If" simulations.

## Project Structure
- `/backend`: FastAPI service handling geospatial operations and DuckDB data.
- `/frontend`: React + Vite app for the Planner-First 3D dashboard.
