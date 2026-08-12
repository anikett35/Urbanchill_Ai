import duckdb

def get_db_connection():
    # Use an in-memory database for now, can be changed to a file later
    conn = duckdb.connect(':memory:')
    # Load and install spatial extension
    conn.execute("INSTALL spatial;")
    conn.execute("LOAD spatial;")
    return conn
