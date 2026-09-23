import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root is in python path
BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from ml.predict import get_model
from api.routes import (
    region,
    analyze,
    prediction,
    layers,
    timeline,
    simulation,
    compare,
    report,
    history,
    mlops,
    agent
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize persistent DuckDB tables
    print("[UrbanChill] Initializing persistent database...")
    init_db()
    # Preload and verify ML Random Forest model
    print("[UrbanChill] Verifying Machine Learning model artifact...")
    get_model()
    print("[UrbanChill Backend] Startup checks completed successfully.")
    yield

app = FastAPI(
    title="UrbanChill AI Backend",
    version="1.0.0",
    description="Geo-Intelligent Digital Twin Platform API for Urban Heat Resilience",
    lifespan=lifespan
)

# Setup CORS for local React/Next.js development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[UrbanChill Server Error] Path: {request.url.path} | Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "SERVER_PROCESSING_ERROR",
                "message": "An error occurred while processing the geospatial telemetry request. Please verify city name or retry.",
                "details": str(exc),
                "retryable": True
            }
        }
    )

# Register API Routers
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(prediction.router, prefix="/api", tags=["Machine Learning"])
app.include_router(layers.router, prefix="/api", tags=["GIS Layers"])
app.include_router(timeline.router, prefix="/api", tags=["Historical Timeline"])
app.include_router(simulation.router, prefix="/api", tags=["What-If Simulation"])
app.include_router(compare.router, prefix="/api", tags=["City Comparison"])
app.include_router(report.router, prefix="/api", tags=["Report Generation"])
app.include_router(history.router, prefix="/api", tags=["Analysis History"])
app.include_router(mlops.router, prefix="/api", tags=["MLOps & Monitoring"])
app.include_router(agent.router, prefix="/api", tags=["Voice Agent"])
app.include_router(region.router, prefix="/api", tags=["Legacy Region"])

@app.get("/")
async def root():
    return {
        "name": "UrbanChill AI API",
        "version": "1.0.0",
        "status": "online",
        "architecture": "Geo-Intelligent Digital Twin (5-Layer Modular Architecture)",
        "endpoints": [
            "/api/analyze",
            "/api/prediction",
            "/api/layers/{city}/{layer_type}",
            "/api/timeline",
            "/api/simulate",
            "/api/compare",
            "/api/report",
            "/api/report/download",
            "/api/history",
            "/api/mlops/status",
            "/docs"
        ]
    }
