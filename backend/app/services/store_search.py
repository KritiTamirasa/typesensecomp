"""Nearby grocery-store lookup via Typesense geo-search + inventory filtering."""
from __future__ import annotations

from ..config import get_settings
from ..ingredients import normalize_list
from ..models import FindStoresRequest, FindStoresResponse, StoreResult
from ..typesense_client import STORES_COLLECTION, get_client


def find_stores(req: FindStoresRequest) -> FindStoresResponse:
    s = get_settings()
    client = get_client()

    wanted = normalize_list(req.ingredients)
    wanted_set = set(wanted)

    lat = req.lat if req.lat is not None else s.fallback_lat
    lng = req.lng if req.lng is not None else s.fallback_lng

    filter_clauses = [f"location:({lat}, {lng}, {req.radius_km} km)"]
    if wanted:
        joined = ",".join(f"`{w}`" for w in wanted)
        filter_clauses.append(f"inventory:=[{joined}]")

    search_params = {
        "q": "*",
        "query_by": "name",
        "filter_by": " && ".join(filter_clauses),
        "sort_by": f"location({lat}, {lng}):asc",
        "per_page": 50,
        "facet_by": "inventory",
        "max_facet_values": 30,
    }

    raw = client.collections[STORES_COLLECTION].documents.search(search_params)

    results: list[StoreResult] = []
    for hit in raw.get("hits", []):
        doc = hit["document"]
        inv = normalize_list(doc.get("inventory", []))
        carries = [w for w in wanted if w in set(inv)]
        missing_here = [w for w in wanted if w not in set(inv)]

        if req.require_all and missing_here:
            continue

        dist_m = (hit.get("geo_distance_meters") or {}).get("location")
        loc = doc.get("location", [None, None])
        results.append(
            StoreResult(
                id=str(doc["id"]),
                name=doc.get("name", ""),
                address=doc.get("address", ""),
                lat=float(loc[0]) if loc[0] is not None else 0.0,
                lng=float(loc[1]) if loc[1] is not None else 0.0,
                distance_km=round(dist_m / 1000, 2) if dist_m is not None else None,
                carries=carries,
                missing_here=missing_here,
            )
        )

    return FindStoresResponse(
        count=len(results),
        normalized_ingredients=wanted,
        origin={"lat": lat, "lng": lng},
        stores=results,
    )
