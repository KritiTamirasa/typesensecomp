"""Nearby grocery-store lookup via Typesense geo-search + inventory filtering.

Every lookup here goes through Typesense: the `stores` collection for the
geo/inventory search, and the `prices` collection for the per-store cost of the
ingredients a store actually carries.
"""
from __future__ import annotations

from ..config import get_settings
from ..ingredients import normalize_list
from ..models import FindStoresRequest, FindStoresResponse, StorePricedItem, StoreResult
from ..typesense_client import PRICES_COLLECTION, STORES_COLLECTION, get_client


def _prices_for_store(client, store_id: str, ingredients: list[str]) -> list[StorePricedItem]:
    """Cheapest in-stock row per ingredient at one store, via Typesense."""
    if not ingredients:
        return []
    joined = ",".join(f"`{i}`" for i in ingredients)
    raw = client.collections[PRICES_COLLECTION].documents.search(
        {
            "q": "*",
            "query_by": "ingredient",
            "filter_by": (
                f"store_id:={store_id} && in_stock:=true && ingredient:=[{joined}]"
            ),
            "sort_by": "unit_price:asc",
            "per_page": 250,
        }
    )
    cheapest: dict[str, StorePricedItem] = {}
    for hit in raw.get("hits", []):
        d = hit["document"]
        ing = d.get("ingredient", "")
        if ing in cheapest:
            continue  # already have the cheapest (sorted asc)
        cheapest[ing] = StorePricedItem(
            ingredient=ing,
            display_name=d.get("display_name", ""),
            brand=d.get("brand", ""),
            price=float(d.get("price", 0.0)),
            unit=d.get("unit", ""),
        )
    return [cheapest[i] for i in ingredients if i in cheapest]


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
        priced = _prices_for_store(client, str(doc["id"]), carries)
        est = round(sum(p.price for p in priced), 2) if priced else None
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
                priced_items=priced,
                est_price=est,
            )
        )

    return FindStoresResponse(
        count=len(results),
        normalized_ingredients=wanted,
        origin={"lat": lat, "lng": lng},
        radius_km=req.radius_km,
        currency=s.currency,
        stores=results,
    )
