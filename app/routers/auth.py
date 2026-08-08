from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db_session
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse
from app.security import get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
import uuid

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db_session)):
    query = select(User).where(User.email == user_data.email)
    result = await db.execute(query)
    
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        id=str(uuid.uuid4()),
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password), # NOW IT IS HASHED!
        role=user_data.role,
        phone_number=user_data.phone_number
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(credentials: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db_session)):
    # Notice we are checking credentials.username here, because that is what the form sends!
    query = select(User).where(User.email == credentials.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # Check if user exists AND password matches the hash
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # Generate the JWT Token!
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Fetches the currently logged-in user's profile using their JWT token.
    """
    return current_user