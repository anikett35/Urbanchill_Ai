from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="UrbanChill AI Backend", version="1.0.0")

# Setup CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import region

app.include_router(region.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to UrbanChill AI Backend"}

