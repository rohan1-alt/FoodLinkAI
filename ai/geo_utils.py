"""
Shared geo helpers for the AI layer.

Everything here is pure math (no external API calls / no API key needed),
which keeps it hackathon-friendly: works fully offline, deterministic,
and free.
"""

import math


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Great-circle distance between two lat/lng points, in kilometers.
    """
    R = 6371.0  # Earth radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def estimate_travel_minutes(distance_km: float, avg_speed_kmh: float = 25.0) -> float:
    """
    Rough ETA for a volunteer traveling by bike/scooter/car in city traffic.
    avg_speed_kmh defaults to 25 km/h, a reasonable mixed-mode urban average.
    """
    if avg_speed_kmh <= 0:
        return 0.0
    return round((distance_km / avg_speed_kmh) * 60, 1)
