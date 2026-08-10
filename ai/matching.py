"""
Smart Matching (Feature #1 from the pitch deck).

Given a food donation, rank the candidate NGOs/volunteers who should be
notified first, using a weighted score of:
  - proximity (closer = better, dominant factor for perishables)
  - urgency of the donation (perishable + expiring soon -> widen/boost search)
  - a lightweight "reliability" signal (claim history), so active NGOs
    who actually show up get prioritized over dormant accounts.

This is intentionally a transparent, explainable scoring function rather
than a black box -- for a hackathon demo you want to be able to point at
*why* NGO X was ranked above NGO Y.
"""

from dataclasses import dataclass
from typing import List, Optional

from ai.geo_utils import haversine_km, estimate_travel_minutes

# Beyond this radius a recipient is very unlikely to bother picking up,
# so we heavily discount (but don't hard-exclude) them.
MAX_USEFUL_RADIUS_KM = 15.0


@dataclass
class MatchCandidate:
    user_id: str
    full_name: str
    role: str
    distance_km: float
    eta_minutes: float
    reliability_score: float
    match_score: float


def _proximity_score(distance_km: float) -> float:
    """1.0 at 0km, decays smoothly to ~0 by MAX_USEFUL_RADIUS_KM."""
    if distance_km <= 0:
        return 1.0
    score = 1.0 - (distance_km / MAX_USEFUL_RADIUS_KM)
    return max(0.0, min(1.0, score))


def _reliability_score(completed_claims: int, cancelled_claims: int = 0) -> float:
    """
    Simple Bayesian-ish smoothing so a brand-new NGO (0 history) starts
    at a neutral 0.5 instead of being penalized to 0.
    """
    total = completed_claims + cancelled_claims
    if total == 0:
        return 0.5
    return round(completed_claims / total, 2)


def rank_candidates(
    donation_lat: float,
    donation_lng: float,
    urgency_score: float,
    candidates: List[dict],
) -> List[MatchCandidate]:
    """
    candidates: list of dicts, each with:
        id, full_name, role, latitude, longitude,
        completed_claims (int, optional), cancelled_claims (int, optional)

    Returns candidates sorted best-match first.

    Weighting rationale:
      - Urgent (near-expiry) donations weight proximity even more heavily,
        since travel time is what determines whether the food is saved.
      - Reliability matters more for *less* urgent donations, where it's
        worth waiting a bit for a dependable NGO instead of the closest one.
    """
    urgency_score = max(0.0, min(1.0, urgency_score))
    proximity_weight = 0.55 + (0.25 * urgency_score)  # 0.55 -> 0.80
    reliability_weight = 0.30 - (0.15 * urgency_score)  # 0.30 -> 0.15
    base_weight = 1.0 - proximity_weight - reliability_weight  # small constant floor

    ranked: List[MatchCandidate] = []

    for c in candidates:
        if c.get("latitude") is None or c.get("longitude") is None:
            continue  # can't score a recipient with no known location

        distance_km = round(
            haversine_km(donation_lat, donation_lng, c["latitude"], c["longitude"]), 2
        )
        eta = estimate_travel_minutes(distance_km)

        prox = _proximity_score(distance_km)
        rel = _reliability_score(
            c.get("completed_claims", 0), c.get("cancelled_claims", 0)
        )

        score = round(
            (proximity_weight * prox) + (reliability_weight * rel) + base_weight,
            4,
        )

        ranked.append(
            MatchCandidate(
                user_id=c["id"],
                full_name=c["full_name"],
                role=c["role"],
                distance_km=distance_km,
                eta_minutes=eta,
                reliability_score=rel,
                match_score=score,
            )
        )

    ranked.sort(key=lambda m: m.match_score, reverse=True)
    return ranked
