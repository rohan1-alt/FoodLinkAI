from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

import sys
import os

from app.database import get_db_session
from app.schemas import FoodDonationCreate, FoodDonationResponse, ClaimResponse
from app.dependencies import get_current_user
from app.models import User, FoodDonation, Claim
from app.notifications import send_alert  # 🚨 Added Telegram alert import

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ai.inference import predict_urgency

router = APIRouter(prefix="/api/v1/donations", tags=["Donations"])


@router.post("/", response_model=FoodDonationResponse)
async def create_donation(
    donation: FoodDonationCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new food donation securely linked to the logged-in donor's account,
    automatically calculating an AI-driven urgency score.
    """
    # 1. Calculate hours to expiry for the AI model
    time_diff = donation.expiry_at - donation.prepared_at
    hours_to_expiry = time_diff.total_seconds() / 3600

    if hours_to_expiry <= 0:
        raise HTTPException(
            status_code=400, detail="Expiry time must be after preparation time."
        )

    # 2. Feed strictly aligned data to the AI Model
    try:
        urgency = predict_urgency(
            hours_to_expiry=hours_to_expiry,
            is_perishable=donation.is_perishable,
            quantity_kg=donation.quantity,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Model Error: {str(e)}")

    # 3. Save to the Database using the REAL logged-in user ID
    new_donation = FoodDonation(
        **donation.model_dump(), urgency_score=urgency, donor_id=current_user.id
    )

    db.add(new_donation)
    await db.commit()
    await db.refresh(new_donation)

    return new_donation


@router.get("/", response_model=List[FoodDonationResponse])
async def get_available_donations(db: AsyncSession = Depends(get_db_session)):
    """
    Fetch all available food donations, sorted by highest AI urgency score first.
    """
    query = (
        select(FoodDonation)
        .where(FoodDonation.status == "available")
        .order_by(FoodDonation.urgency_score.desc())  # Highest urgency at the top
    )

    result = await db.execute(query)
    donations = result.scalars().all()

    return donations


@router.patch("/{donation_id}/claim", response_model=FoodDonationResponse)
async def claim_donation(
    donation_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Allow an authenticated NGO or volunteer to claim an available food donation
    and record the transaction permanently in the claims table.
    """
    # 1. Find the specific donation by its ID
    query = select(FoodDonation).where(FoodDonation.id == donation_id)
    result = await db.execute(query)
    donation = result.scalar_one_or_none()

    # 2. Safety and validation checks
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status != "available":
        raise HTTPException(
            status_code=400,
            detail=f"Too late! This donation is already {donation.status}",
        )

    # Ensure ONLY ngos/volunteers can claim food (Donors cannot claim their own food)
    if current_user.role == "donor":
        raise HTTPException(
            status_code=403, detail="Donors cannot claim food donations."
        )

    # 3. Update the donation status to 'claimed'
    donation.status = "claimed"

    # 4. Write the formal record to the new Claims table using claimed_by_user_id
    new_claim = Claim(
        id=str(uuid.uuid4()),
        donation_id=donation.id,
        claimed_by_user_id=current_user.id,
    )
    db.add(new_claim)

    # 5. Commit changes to the Neon database
    await db.commit()
    await db.refresh(donation)

    # 🚨 6. Trigger Telegram Alert! 🚨
    alert_text = (
        f"📦 *FoodLinkAI Alert:*\n"
        f"Donation #{donation.id} has been claimed!\n"
        f"Status: Ready for pickup and transit."
    )
    send_alert(message=alert_text)

    return donation


@router.get("/my-claims", response_model=List[ClaimResponse])
async def get_my_claims(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all claims made by the currently logged-in NGO or volunteer.
    """
    # Query the claims table specifically for this user's ID
    query = select(Claim).where(Claim.claimed_by_user_id == current_user.id)

    result = await db.execute(query)
    claims = result.scalars().all()

    return claims