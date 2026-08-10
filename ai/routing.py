"""
Volunteer Routing (Feature #3 from the pitch deck).

Solves a small Traveling-Salesman-style "which order should I visit these
pickups in" problem using a nearest-neighbor heuristic with a 2-opt cleanup
pass. This is a well-known, fast, dependency-free approach that is more
than good enough for the 3-10 stops a single volunteer run will realistically
have, and doesn't require a Google Maps API key -- distances come from
haversine (ai/geo_utils.py), which is fine for city-scale routing on a demo.

If a Google Maps / Directions API key is added later, swap `haversine_km`
in the distance matrix builder for real driving-time lookups without
touching the optimization logic below.
"""

from dataclasses import dataclass
from typing import List

from ai.geo_utils import haversine_km, estimate_travel_minutes


@dataclass
class RouteStop:
    donation_id: str
    title: str
    lat: float
    lng: float
    leg_distance_km: float  # distance from the previous stop
    leg_eta_minutes: float


@dataclass
class OptimizedRoute:
    stops: List[RouteStop]
    total_distance_km: float
    total_eta_minutes: float


def _build_distance_matrix(points):
    n = len(points)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = haversine_km(
                    points[i]["lat"], points[i]["lng"], points[j]["lat"], points[j]["lng"]
                )
    return matrix


def _nearest_neighbor_order(matrix, start_index=0):
    n = len(matrix)
    unvisited = set(range(n))
    unvisited.discard(start_index)
    order = [start_index]
    current = start_index

    while unvisited:
        nxt = min(unvisited, key=lambda j: matrix[current][j])
        order.append(nxt)
        unvisited.remove(nxt)
        current = nxt

    return order


def _route_length(order, matrix):
    return sum(matrix[order[i]][order[i + 1]] for i in range(len(order) - 1))


def _two_opt(order, matrix):
    """Local-search cleanup: untangles obvious crossed legs left behind by
    the greedy nearest-neighbor pass."""
    improved = True
    best = order[:]
    best_len = _route_length(best, matrix)

    while improved:
        improved = False
        for i in range(1, len(best) - 1):
            for j in range(i + 1, len(best)):
                candidate = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                candidate_len = _route_length(candidate, matrix)
                if candidate_len < best_len - 1e-9:
                    best, best_len = candidate, candidate_len
                    improved = True
    return best


def optimize_route(
    start_lat: float,
    start_lng: float,
    stops: List[dict],
) -> OptimizedRoute:
    """
    stops: list of dicts with id/title/lat/lng (the volunteer's pending
    pickup pins). start_lat/start_lng is the volunteer's current location.

    Returns stops in the order to visit them, plus running distance/ETA,
    so the frontend can render turn-by-turn "stop 1 -> stop 2 -> ..." guidance.
    """
    if not stops:
        return OptimizedRoute(stops=[], total_distance_km=0.0, total_eta_minutes=0.0)

    points = [{"lat": start_lat, "lng": start_lng, "id": None, "title": "Start"}] + [
        {"lat": s["lat"], "lng": s["lng"], "id": s["id"], "title": s["title"]}
        for s in stops
    ]

    matrix = _build_distance_matrix(points)
    order = _nearest_neighbor_order(matrix, start_index=0)
    order = _two_opt(order, matrix)

    # Re-rotate so the route still starts at the volunteer's location
    start_pos = order.index(0)
    order = order[start_pos:] + order[:start_pos]

    route_stops: List[RouteStop] = []
    total_distance = 0.0
    total_eta = 0.0

    for k in range(1, len(order)):
        prev_idx, cur_idx = order[k - 1], order[k]
        leg_km = round(matrix[prev_idx][cur_idx], 2)
        leg_eta = estimate_travel_minutes(leg_km)
        total_distance += leg_km
        total_eta += leg_eta

        p = points[cur_idx]
        route_stops.append(
            RouteStop(
                donation_id=p["id"],
                title=p["title"],
                lat=p["lat"],
                lng=p["lng"],
                leg_distance_km=leg_km,
                leg_eta_minutes=leg_eta,
            )
        )

    return OptimizedRoute(
        stops=route_stops,
        total_distance_km=round(total_distance, 2),
        total_eta_minutes=round(total_eta, 1),
    )
