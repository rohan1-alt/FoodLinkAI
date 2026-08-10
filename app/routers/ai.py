import sys
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db_session
from app.dependencies import get_current_user
from app.models import User, FoodDonation, Claim
from app.schemas import (
    MatchCandidateResponse,
    RouteResponse,
    ImpactResponse,
    LeaderboardEntryResponse,
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ai.matching import rank_candidates
from ai.routing import optimize_route
from ai.gamification import compute_impact_stats, badge_for_points

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.get("/donations/{donation_id}/matches", response_model=List[MatchCandidateResponse])
async def get_smart_matches(
    donation_id: str,
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Smart Matching (Feature #1): given a donation, rank the NGOs/volunteers
    who should be notified first, based on distance, the donation's urgency,
    and each recipient's pickup track record.
    """
    donation_result = await db.execute(
        select(FoodDonation).where(FoodDonation.id == donation_id)
    )
    donation = donation_result.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Candidate recipients: NGOs and volunteers with a known location
    recipients_result = await db.execute(
        select(User).where(User.role.in_(["ngo", "volunteer"]))
    )
    recipients = recipients_result.scalars().all()

    # Pull each recipient's completed/cancelled claim counts for the
    # reliability signal in one grouped query rather than N+1 queries.
    counts_result = await db.execute(
        select(Claim.claimed_by_user_id, Claim.status, func.count(Claim.id))
        .group_by(Claim.claimed_by_user_id, Claim.status)
    )
    history = {}
    for user_id, status, count in counts_result.all():
        history.setdefault(user_id, {"completed": 0, "cancelled": 0})
        if status == "completed":
            history[user_id]["completed"] = count
        elif status == "cancelled":
            history[user_id]["cancelled"] = count

    candidates = [
        {
            "id": r.id,
            "full_name": r.full_name,
            "role": r.role,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "completed_claims": history.get(r.id, {}).get("completed", 0),
            "cancelled_claims": history.get(r.id, {}).get("cancelled", 0),
        }
        for r in recipients
    ]

    ranked = rank_candidates(
        donation_lat=donation.pickup_lat,
        donation_lng=donation.pickup_lng,
        urgency_score=donation.urgency_score,
        candidates=candidates,
    )

    return [
        MatchCandidateResponse(
            user_id=m.user_id,
            full_name=m.full_name,
            role=m.role,
            distance_km=m.distance_km,
            eta_minutes=m.eta_minutes,
            reliability_score=m.reliability_score,
            match_score=m.match_score,
        )
        for m in ranked[:limit]
    ]


@router.get("/routes/optimize", response_model=RouteResponse)
async def get_optimized_route(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Volunteer Routing (Feature #3): orders the current user's active
    (claimed-but-not-yet-completed) pickups into an efficient route,
    starting from their last known location.
    """
    if current_user.latitude is None or current_user.longitude is None:
        raise HTTPException(
            status_code=400,
            detail="Set your current location before requesting a route.",
        )

    claims_result = await db.execute(
        select(FoodDonation)
        .join(Claim, Claim.donation_id == FoodDonation.id)
        .where(
            Claim.claimed_by_user_id == current_user.id,
            Claim.status == "pending",
        )
    )
    pending_donations = claims_result.scalars().all()

    stops = [
        {
            "id": d.id,
            "title": d.title,
            "lat": d.pickup_lat,
            "lng": d.pickup_lng,
        }
        for d in pending_donations
    ]

    route = optimize_route(
        start_lat=current_user.latitude,
        start_lng=current_user.longitude,
        stops=stops,
    )

    return RouteResponse(
        stops=[
            {
                "donation_id": s.donation_id,
                "title": s.title,
                "lat": s.lat,
                "lng": s.lng,
                "leg_distance_km": s.leg_distance_km,
                "leg_eta_minutes": s.leg_eta_minutes,
            }
            for s in route.stops
        ],
        total_distance_km=route.total_distance_km,
        total_eta_minutes=route.total_eta_minutes,
    )


@router.get("/impact", response_model=ImpactResponse)
async def get_impact_dashboard(db: AsyncSession = Depends(get_db_session)):
    """
    Impact Dashboard (Feature #4): public, no-auth stats -- meals saved,
    kg rescued, CO2 avoided. Only counts pickups that were actually
    verified (status == 'completed'), not just claimed.
    """
    completed_result = await db.execute(
        select(FoodDonation.quantity).where(FoodDonation.status == "completed")
    )
    completed_quantities = [q for (q,) in completed_result.all()]

    donor_count_result = await db.execute(
        select(func.count(func.distinct(User.id))).where(User.role == "donor")
    )
    recipient_count_result = await db.execute(
        select(func.count(func.distinct(User.id))).where(
            User.role.in_(["ngo", "volunteer"])
        )
    )

    stats = compute_impact_stats(
        completed_quantities_kg=completed_quantities,
        active_donor_count=donor_count_result.scalar() or 0,
        active_recipient_count=recipient_count_result.scalar() or 0,
    )

    return ImpactResponse(
        total_donations_completed=stats.total_donations_completed,
        total_kg_saved=stats.total_kg_saved,
        meals_saved=stats.meals_saved,
        co2_kg_avoided=stats.co2_kg_avoided,
        active_donors=stats.active_donors,
        active_recipients=stats.active_recipients,
    )


@router.get("/leaderboard", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Gamification (Feature #5): top volunteers/NGOs by points, with their
    current badge tier and total verified pickups.
    """
    users_result = await db.execute(
        select(User)
        .where(User.role.in_(["ngo", "volunteer"]))
        .order_by(User.points.desc())
        .limit(limit)
    )
    top_users = users_result.scalars().all()

    counts_result = await db.execute(
        select(Claim.claimed_by_user_id, func.count(Claim.id)).where(
            Claim.status == "completed"
        ).group_by(Claim.claimed_by_user_id)
    )
    completed_counts = {user_id: count for user_id, count in counts_result.all()}

    return [
        LeaderboardEntryResponse(
            user_id=u.id,
            full_name=u.full_name,
            role=u.role,
            points=u.points or 0,
            badge=badge_for_points(u.points or 0),
            completed_pickups=completed_counts.get(u.id, 0),
        )
        for u in top_users
    ]
