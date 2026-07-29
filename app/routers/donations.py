from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db_session
from app.models import FoodDonation
from app.schemas import FoodDonationCreate, FoodDonationResponse
import sys
import os

# Ensure the AI module can be imported from the root directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ai.inference import predict_urgency

router = APIRouter(prefix="/api/v1/donations", tags=["Donations"])

@router.post("/", response_model=FoodDonationResponse)
async def create_donation(donation: FoodDonationCreate, db: AsyncSession = Depends(get_db_session)):
    
    # 1. Calculate hours to expiry for the AI model
    time_diff = donation.expiry_at - donation.prepared_at
    hours_to_expiry = time_diff.total_seconds() / 3600

    if hours_to_expiry <= 0:
        raise HTTPException(status_code=400, detail="Expiry time must be after preparation time.")

    # 2. Feed strictly aligned data to the AI Model
    try:
        urgency = predict_urgency(
            hours_to_expiry=hours_to_expiry,
            is_perishable=donation.is_perishable,
            quantity_kg=donation.quantity
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Model Error: {str(e)}")

    # 3. Save to the Database
    # Note: 'donor_id' is mocked here. In Phase 4, we will extract this from a logged-in user token!
    new_donation = FoodDonation(
        **donation.model_dump(),
        urgency_score=urgency,
        donor_id="mock-donor-uuid-1234" 
    )
    
    db.add(new_donation)
    await db.commit()
    await db.refresh(new_donation)
    
    return new_donation