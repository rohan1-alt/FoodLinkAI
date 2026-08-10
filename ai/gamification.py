"""
Gamification + Impact scoring (Features #4 and #5 from the pitch deck).

Deliberately simple, explainable arithmetic -- judges/demo viewers should
be able to see "10kg picked up = X points" and immediately get it.
"""

from dataclasses import dataclass
from typing import List

# --- Tunable constants -------------------------------------------------
POINTS_PER_KG_SAVED = 10
URGENT_PICKUP_BONUS = 25       # bonus for claiming a donation with urgency >= URGENT_THRESHOLD
URGENT_THRESHOLD = 0.75
BASE_POINTS_PER_PICKUP = 15

# Roughly how many meals a kg of rescued food represents, and the CO2e
# footprint avoided by not sending it to landfill. These are the standard
# ballpark figures used by food-rescue orgs (e.g. Feeding America ~1.2
# meals/lb ~ 2.5 meals/kg; ~2.5kg CO2e avoided per kg of food waste diverted).
MEALS_PER_KG = 2.5
CO2_KG_PER_KG_FOOD = 2.5

BADGE_TIERS = [
    (0, "Newcomer"),
    (100, "Food Hero"),
    (500, "Rescue Champion"),
    (1500, "Community Legend"),
]


def points_for_pickup(quantity_kg: float, urgency_score: float) -> int:
    """Points awarded to a volunteer/NGO the moment they complete a pickup."""
    points = BASE_POINTS_PER_PICKUP + (quantity_kg * POINTS_PER_KG_SAVED)
    if urgency_score >= URGENT_THRESHOLD:
        points += URGENT_PICKUP_BONUS
    return round(points)


def badge_for_points(total_points: int) -> str:
    badge = BADGE_TIERS[0][1]
    for threshold, name in BADGE_TIERS:
        if total_points >= threshold:
            badge = name
    return badge


def next_badge_progress(total_points: int):
    """Returns (next_badge_name, points_needed) or (None, 0) if maxed out."""
    for threshold, name in BADGE_TIERS:
        if total_points < threshold:
            return name, threshold - total_points
    return None, 0


@dataclass
class ImpactStats:
    total_donations_completed: int
    total_kg_saved: float
    meals_saved: int
    co2_kg_avoided: float
    active_donors: int
    active_recipients: int


def compute_impact_stats(
    completed_quantities_kg: List[float],
    active_donor_count: int,
    active_recipient_count: int,
) -> ImpactStats:
    total_kg = round(sum(completed_quantities_kg), 2)
    return ImpactStats(
        total_donations_completed=len(completed_quantities_kg),
        total_kg_saved=total_kg,
        meals_saved=round(total_kg * MEALS_PER_KG),
        co2_kg_avoided=round(total_kg * CO2_KG_PER_KG_FOOD, 1),
        active_donors=active_donor_count,
        active_recipients=active_recipient_count,
    )
