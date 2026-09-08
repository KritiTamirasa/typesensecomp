"""Missing-ingredient price lookup against the fabricated `prices` index.

For each ingredient we ask Typesense for in-stock rows, ranked cheapest-first by
`unit_price` (price normalized per 100 g / 100 ml / each), and return the best
match plus a few alternatives. Runs alongside `/find-stores` — this answers
"what does it cost", that one answers "where is it".
"""
from __future__ import annotations

from ..config import get_settings
from ..ingredients import normalize_list
from ..models import (
    PriceLookupRequest,
    PriceLookupResponse,
    PriceMatch,
    PricedIngredient,
)
from ..typesense_client import PRICES_COLLECTION, get_client


def _to_match(doc: dict) -> PriceMatch:
    return PriceMatch(
        ingredient=doc.get("ingredient", ""),
        display_name=doc.get("display_name", ""),
        brand=doc.get("brand", ""),
        store_id=str(doc.get("store_id", "")),
        store_name=doc.get("store_name", ""),
        category=doc.get("category", ""),
        unit=doc.get("unit", ""),
        price=float(doc.get("price", 0.0)),
        unit_price=float(doc.get("unit_price", 0.0)),
    )


def lookup_prices(req: PriceLookupRequest) -> PriceLookupResponse:
    client = get_client()
    wanted = normalize_list(req.ingredients)

    base_filters = ["in_stock:=true"]
    if req.category:
        base_filters.append(f"category:={req.category}")
    if req.store_id:
        base_filters.append(f"store_id:={req.store_id}")

    items: list[PricedIngredient] = []
    unpriced: list[str] = []

    for ing in wanted:
        # Join strictly on the canonical ingredient name via a filter. Both sides
        # are already normalized (synonyms + singularization), so "capsicum"
        # resolves to the "bell pepper" rows here. Typesense still does the
        # cheapest-first ordering by unit_price and the faceting.
        filter_by = " && ".join([f"ingredient:=`{ing}`", *base_filters])
        raw = client.collections[PRICES_COLLECTION].documents.search(
            {
                "q": "*",
                "query_by": "ingredient",
                "filter_by": filter_by,
                "sort_by": "unit_price:asc",
                "per_page": 10,
                "facet_by": "store_id,category",
            }
        )
        pool = [h["document"] for h in raw.get("hits", [])]
        if not pool:
            unpriced.append(ing)
            continue
        matches = [_to_match(d) for d in pool]
        items.append(
            PricedIngredient(
                ingredient=ing,
                best=matches[0],
                alternatives=matches[1:4],
            )
        )

    basket_total = round(sum(i.best.price for i in items), 2)
    return PriceLookupResponse(
        currency=get_settings().currency,
        items=items,
        unpriced=unpriced,
        basket_total=basket_total,
    )
