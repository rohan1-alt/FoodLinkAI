from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import donations
from contextlib import asynccontextmanager
from app.routers import donations, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="FoodLink AI",
    description="Real-time AI-powered food rescue platform",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------
# CORS CONFIGURATION (Phase 4)
# ---------------------------------
# For a hackathon, we use ["*"] to allow any frontend to connect. 
# In production, you would replace "*" with their actual Vercel/Netlify URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)

# Register your endpoints
app.include_router(donations.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "FoodLink AI Backend is operational with CORS enabled!"}