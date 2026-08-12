from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid
import secrets
import string

import sys
import os

from app.database import get_db_session
from app.schemas import (
    FoodDonationCreate,
    FoodDonationResponse,
    FoodDonationOwnerResponse,
    ClaimResponse,
    ClaimWithDonationResponse,
    CompletePickupRequest,
)
from app.dependencies import get_current_user
from app.models import User, FoodDonation, Claim
from app.notifications import send_alert  # 🚨 Added Telegram alert import

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ai.inference import predict_urgency
from ai.gamification import points_for_pickup

router = APIRouter(prefix="/api/v1/donations", tags=["Donations"])


def _generate_pickup_code() -> str:
    """Short, human-typeable code (e.g. 'K7QX2P') encoded into the QR
    the donor displays at pickup."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


@router.post("/", response_model=FoodDonationOwnerResponse)
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
        **donation.model_dump(),
        urgency_score=urgency,
        donor_id=current_user.id,
        pickup_code=_generate_pickup_code(),
    )

    db.add(new_donation)
    await db.commit()
    await db.refresh(new_donation)

    # Avoid a second DB round-trip: we already know the donor (it's the caller)
    new_donation.donor = current_user

    return new_donation


@router.get("/", response_model=List[FoodDonationResponse])
async def get_available_donations(db: AsyncSession = Depends(get_db_session)):
    """
    Fetch all available food donations, sorted by highest AI urgency score first.
    """
    query = (
        select(FoodDonation)
        .options(selectinload(FoodDonation.donor))
        .where(FoodDonation.status == "available")
        .order_by(FoodDonation.urgency_score.desc())  # Highest urgency at the top
    )

    result = await db.execute(query)
    donations = result.scalars().all()

    return donations


@router.get("/my-donations", response_model=List[FoodDonationOwnerResponse])
async def get_my_donations(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch every donation posted by the currently logged-in donor, including
    the secret pickup_code so they can re-display the QR code at any time
    (e.g. after a page refresh).
    """
    query = (
        select(FoodDonation)
        .options(selectinload(FoodDonation.donor))
        .where(FoodDonation.donor_id == current_user.id)
        .order_by(FoodDonation.created_at.desc())
    )

    result = await db.execute(query)
    return result.scalars().all()


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
    query = (
        select(FoodDonation)
        .options(selectinload(FoodDonation.donor))
        .where(FoodDonation.id == donation_id)
    )
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


@router.patch("/{donation_id}/complete", response_model=ClaimResponse)
async def complete_pickup(
    donation_id: str,
    body: CompletePickupRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    QR-code check-in step: the volunteer/NGO that claimed this donation
    scans (or types) the pickup_code shown on the donor's QR code to
    confirm they were physically there. This is what unlocks gamification
    points (Feature #5) and counts toward the public impact dashboard
    (Feature #4) -- a 'claim' alone doesn't count as food saved yet.
    """
    query = select(Claim).where(
        Claim.donation_id == donation_id,
        Claim.claimed_by_user_id == current_user.id,
    )
    result = await db.execute(query)
    claim = result.scalar_one_or_none()

    if not claim:
        raise HTTPException(
            status_code=404, detail="No claim found for this donation by this user."
        )

    if claim.status == "completed":
        raise HTTPException(status_code=400, detail="This pickup is already verified.")

    donation_query = select(FoodDonation).where(FoodDonation.id == donation_id)
    donation_result = await db.execute(donation_query)
    donation = donation_result.scalar_one_or_none()

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if (donation.pickup_code or "").strip().upper() != body.pickup_code.strip().upper():
        raise HTTPException(
            status_code=400,
            detail="Pickup code doesn't match. Scan/enter the code shown by the donor.",
        )

    # 1. Mark the claim + donation as completed
    claim.status = "completed"
    donation.status = "completed"

    # 2. Award gamification points based on quantity rescued + urgency
    earned = points_for_pickup(
        quantity_kg=donation.quantity, urgency_score=donation.urgency_score
    )
    current_user.points = (current_user.points or 0) + earned

    await db.commit()
    await db.refresh(claim)

    return claim


@router.get("/my-claims", response_model=List[ClaimWithDonationResponse])
async def get_my_claims(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all claims made by the currently logged-in NGO or volunteer,
    with just enough donation context (title, status, quantity, pickup
    coords) that the dashboard doesn't need a second round-trip per claim.
    """
    query = (
        select(Claim)
        .options(selectinload(Claim.donation))
        .where(Claim.claimed_by_user_id == current_user.id)
        .order_by(Claim.claimed_at.desc())
    )

    result = await db.execute(query)
    claims = result.scalars().all()

    enriched = []
    for c in claims:
        enriched.append(
            ClaimWithDonationResponse(
                id=c.id,
                donation_id=c.donation_id,
                claimed_by_user_id=c.claimed_by_user_id,
                status=c.status,
                claimed_at=c.claimed_at,
                donation_title=c.donation.title if c.donation else None,
                donation_status=c.donation.status if c.donation else None,
                donation_quantity=c.donation.quantity if c.donation else None,
                donation_unit=c.donation.unit if c.donation else None,
                pickup_lat=c.donation.pickup_lat if c.donation else None,
                pickup_lng=c.donation.pickup_lng if c.donation else None,
            )
        )

    return enriched
