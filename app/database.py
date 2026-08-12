# app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Automatically load variables from your .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy's async engine requires the specific 'postgresql+asyncpg://' prefix.
# This safely converts standard Neon URLs to the correct format so it doesn't crash.
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 1. Create the Async Engine
# pool_pre_ping=True acts as a heartbeat check to prevent the "connection is closed" error!
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True, 
    echo=False # Set to True if you want to see all SQL commands printed in your terminal
)

# 2. Create the Session Factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 3. Create the Base class for your models to inherit from (User, FoodDonation, etc.)
Base = declarative_base()

# 4. Create the FastAPI Dependency
async def get_db_session():
    """
    Yields an active database session for a single API request, 
    then safely closes it when the request finishes.
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()