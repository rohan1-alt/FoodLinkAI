from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import donations
from contextlib import asynccontextmanager
from app.routers import donations, auth, ai


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
    lifespan=lifespan,
)

# ---------------------------------
# CORS CONFIGURATION (Phase 4)
# ---------------------------------
# NOTE: allow_origins=["*"] is NOT allowed together with
# allow_credentials=True per the CORS spec — browsers will block it.
# So we list actual allowed origins explicitly instead.
ALLOWED_ORIGINS = [
    "https://food-link-ai-ten.vercel.app",
    "https://food-link-ai-git-main-ro-ro5.vercel.app",
    "https://food-link-pa71ygc8r-ro-ro5.vercel.app",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register your endpoints
app.include_router(donations.router)
app.include_router(auth.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"message": "FoodLink AI Backend is operational with CORS enabled!"}
