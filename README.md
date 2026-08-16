# UrbanChill AI: A Geo-Intelligent Digital Twin Platform for Urban Heat Resilience

**UrbanChill AI** is a comprehensive Geo-Intelligent Digital Twin Platform capable of monitoring, analyzing, and predicting urban heat conditions. It combines satellite imagery, GIS technologies, spatial databases, and machine learning into a single interactive application to shift urban heat management from reactive observation toward proactive planning.

## 🌟 Key Features
- **Interactive 3D Earth Visualization:** Built with CesiumJS, allowing global city search and a realistic 3D globe exploration.
- **Satellite Image Processing:** Integrates with Google Earth Engine to retrieve Landsat-8 and Sentinel-2 datasets.
- **Environmental Indicators:** Calculates Land Surface Temperature (LST) and Normalized Difference Vegetation Index (NDVI).
- **Heat-Risk Prediction:** Uses a Random Forest machine learning model to predict the severity of urban heat using spatial features.
- **"What-If" Simulations:** Evaluates the impact of proposed cooling interventions (like tree plantations or cool roofs) on the temperature and heat risk.
- **Spatial Analytics Dashboard:** Provides charts and insights comparing cities, heat distribution, and green cover.
- **Automated Report Generation:** Generates comprehensive PDF reports with maps, statistics, and mitigation recommendations.

## 🏗️ System Architecture

UrbanChill AI follows a modular, cloud-based 5-layer architecture:

1. **Presentation Layer (Frontend)**: Handles user interactions, 3D visualization, and dashboard rendering. *(React, TypeScript, CesiumJS, Tailwind CSS, Shadcn UI)*
2. **Application Layer (Backend)**: Manages APIs, validation, and communication with ML/GIS modules. *(FastAPI, Python)*
3. **GIS Processing Layer**: Retrieves satellite images, processes rasters, extracts LST/NDVI, and performs spatial analysis. *(Google Earth Engine, GeoPandas, Rasterio, GDAL)*
4. **Machine Learning Layer**: Predicts heat-risk levels based on spatial features. *(Scikit-Learn, Random Forest)*
5. **Data Layer**: Stores users, analysis history, spatial datasets, and metadata. *(PostgreSQL, PostGIS)*

## 💻 Technology Stack

### Frontend (`/frontend`)
- **Framework:** React + TypeScript (Vite/Next.js)
- **UI & Styling:** Tailwind CSS, Shadcn UI
- **3D Engine:** CesiumJS
- **Charts & State:** Recharts, React Query

### Backend (`/backend`)
- **Framework:** FastAPI (Python)
- **Spatial Processing:** GeoPandas, Rasterio, Shapely, Rioxarray, GDAL
- **Satellite Data:** Google Earth Engine API
- **Machine Learning:** Scikit-learn (Random Forest)
- **Database:** PostgreSQL + PostGIS

## 3. Repository & Directory Structure

### 3.1 Folder Hierarchy & File Layout

```text
UrbanChill/
├── backend/                  # FastAPI Application
│   ├── api/                  # API Routers and Endpoints
│   ├── core/                 # Core configurations and logic
│   ├── db.py                 # Database connection logic
│   ├── env/                  # Environment configurations
│   ├── main.py               # Application entry point
│   ├── requirements.txt      # Python dependencies
│   └── tests/                # Unit and integration tests
├── frontend/                 # React Application
│   ├── public/               # Static assets
│   ├── src/                  # Components, Hooks, API integration, UI
│   ├── package.json          # Node dependencies
│   └── next.config.ts        # Next.js configuration
└── README.md                 # Project Documentation
```

### 3.2 Key File Responsibilities

- **`backend/main.py`**: The main entry point for the FastAPI application.
- **`backend/db.py`**: Handles connecting to the PostgreSQL/PostGIS database.
- **`frontend/src/`**: Houses all the React components, hooks, and UI logic for the 3D dashboard.
- **`frontend/next.config.ts`**: The configuration for the Next.js frontend application.

### 3.3 Codebase Navigation Guide

- **Working on APIs or ML Models?** Head to the `backend/` directory, specifically `backend/api/` and `backend/core/`.
- **Modifying the UI or 3D Dashboard?** Look inside the `frontend/src/` directory.
- **Looking for Project Requirements?** Check `backend/requirements.txt` for Python dependencies and `frontend/package.json` for Node dependencies.

## 🔄 User & Data Workflow
1. **User Interaction**: User searches or clicks a city on the interactive 3D Earth.
2. **Request Routing**: CesiumJS performs a smooth camera fly and sends coordinates to the FastAPI backend.
3. **Data Retrieval**: Backend queries Google Earth Engine for satellite images (Sentinel/Landsat).
4. **Processing**: System calculates LST, NDVI, and extracts spatial features.
5. **ML Prediction**: Scikit-Learn Random Forest model predicts the heat-risk zones.
6. **Result Delivery**: Results are saved to PostGIS and visualized on the React dashboard.

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ for the frontend.
- **Python** 3.10+ for the backend.
- **PostgreSQL + PostGIS** for database storage.

### 1. Setup the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
# Set your environment variables in .env (Database URL, Google Earth Engine credentials)
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 2. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.
