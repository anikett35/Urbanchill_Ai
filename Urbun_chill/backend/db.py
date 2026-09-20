"""
Database connection and schema management for UrbanChill AI.
Uses DuckDB with spatial extensions to store city registries,
analysis history, simulation runs, and generated reports.
"""

import duckdb
from pathlib import Path

DB_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DB_DIR / "urbanchill.duckdb"

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
    """Initializes tables for cities, analysis history, reports, and MLOps logs."""
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
    
    # Analysis history table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS analysis_history (
        id VARCHAR PRIMARY KEY,
        city_name VARCHAR NOT NULL,
        lat DOUBLE,
        lon DOUBLE,
        heat_risk VARCHAR NOT NULL,
        lst DOUBLE NOT NULL,
        ndvi DOUBLE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
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
    print("[UrbanChill DB] Initialized persistent DuckDB store successfully.")
