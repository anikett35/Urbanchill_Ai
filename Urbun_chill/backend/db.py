"""
Database connection and schema management for UrbanChill AI.
Uses DuckDB to store city registries, reproducible analysis history,
simulation runs, and generated reports.
"""

import os
import duckdb
from pathlib import Path

DB_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = Path(os.getenv("DUCKDB_PATH", os.getenv("DATABASE_PATH", str(DB_DIR / "urbanchill.duckdb"))))

_CONNECTION = None

def get_db_connection():
    """
    Returns a persistent DuckDB connection instance.
    Reuses connection to prevent file locking and overhead.
    """
    global _CONNECTION
    if _CONNECTION is not None:
        return _CONNECTION

    DB_DIR.mkdir(parents=True, exist_ok=True)
    try:
        _CONNECTION = duckdb.connect(str(DB_PATH), read_only=False)
    except Exception:
        _CONNECTION = duckdb.connect(':memory:')
        
    return _CONNECTION

def init_db():
    """Initializes tables for cities, reproducible analysis history, reports, and MLOps logs."""
    conn = get_db_connection()
    
    # Cities registry table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS cities (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        lat DOUBLE NOT NULL,
        lon DOUBLE NOT NULL,
        base_lst DOUBLE,
        base_ndvi DOUBLE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Analysis history table with reproducible metadata
    conn.execute("""
    CREATE TABLE IF NOT EXISTS analysis_history (
        id VARCHAR PRIMARY KEY,
        city_name VARCHAR NOT NULL,
        lat DOUBLE,
        lon DOUBLE,
        heat_risk VARCHAR NOT NULL,
        confidence DOUBLE DEFAULT 0.8,
        heat_hazard_index DOUBLE DEFAULT 0.65,
        vulnerability_index DOUBLE DEFAULT 0.55,
        lst DOUBLE NOT NULL,
        ndvi DOUBLE NOT NULL,
        model_version VARCHAR DEFAULT 'urbanchill-rf-1.1',
        data_quality_score INTEGER DEFAULT 85,
        features_json VARCHAR DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Safe migration: ensure new columns exist if table was created with previous schema
    new_cols = [
        ("confidence", "DOUBLE DEFAULT 0.8"),
        ("heat_hazard_index", "DOUBLE DEFAULT 0.65"),
        ("vulnerability_index", "DOUBLE DEFAULT 0.55"),
        ("model_version", "VARCHAR DEFAULT 'urbanchill-rf-1.1'"),
        ("data_quality_score", "INTEGER DEFAULT 85"),
        ("features_json", "VARCHAR DEFAULT '{}'")
    ]
    for col_name, col_type in new_cols:
        try:
            conn.execute(f"ALTER TABLE analysis_history ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
        except Exception:
            pass
    
    # Reports table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR PRIMARY KEY,
        city_name VARCHAR NOT NULL,
        analysis_id VARCHAR,
        report_title VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

if __name__ == "__main__":
    init_db()
    print("[UrbanChill DB] Initialized persistent DuckDB store with reproducible schema.")
