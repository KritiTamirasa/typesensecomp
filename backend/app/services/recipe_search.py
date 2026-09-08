"""Recipe search + ingredient-overlap ranking on top of Typesense."""
from __future__ import annotations

import re

from ..ingredients import normalize_list
from ..models import (
    FacetCount,
    RecipeCard,
    SearchRecipesRequest,
    SearchRecipesResponse,
)
from ..typesense_client import RECIPES_COLLECTION, get_client
from .ranking import compute_overlap, rank_key

_TIME_PATTERNS = [
    re.compile(r"under\s+(\d+)"),
    re.compile(r"less\s+than\s+(\d+)"),
    re.compile(r"within\s+(\d+)"),
    re.compile(r"(\d+)\s*min"),
]


def _infer_max_time(text: str | None) -> int | None:
    if not text:
        return None
    lowered = text.lower()
    for pat in _TIME_PATTERNS:
        m = pat.search(lowered)
        if m:
            return int(m.group(1))
    return None


def _build_filter(req: SearchRecipesRequest, inferred_time: int | None) -> str:
    clauses: list[str] = []
    if req.cuisine:
        clauses.append(f"cuisine:={req.cuisine}")
    max_time = req.max_cooking_time or inferred_time
    if max_time:
        clauses.append(f"cooking_time:<={max_time}")
    if req.tags:
        joined = ",".join(t.strip() for t in req.tags if t.strip())
        if joined:
            clauses.append(f"tags:=[{joined}]")
    return " && ".join(clauses)


def _facets(raw: dict) -> dict[str, list[FacetCount]]:
    out: dict[str, list[FacetCount]] = {}
    for fc in raw.get("facet_counts", []) or []:
        field = fc.get("field_name")
        counts = [
            FacetCount(value=str(c["value"]), count=int(c["count"]))
            for c in fc.get("counts", [])
        ]
        if field:
            out[field] = counts
    return out


def search_recipes(req: SearchRecipesRequest) -> SearchRecipesResponse:
    client = get_client()
    owned = normalize_list(req.ingredients)
    owned_set = set(owned)

    inferred_time = _infer_max_time(req.query)
    filter_by = _build_filter(req, inferred_time)

    # Text queries go through Typesense full-text search (typo tolerance +
    # synonyms). Ingredient-overlap ranking is always layered on in Python,
    # so when there's no text query we pull the whole (small) catalogue and
    # rank purely by what the user already has.
    if req.query and req.query.strip():
        q = req.query.strip()
        query_by = "name,description,ingredients,tags,cuisine"
    else:
        q = "*"
        query_by = "name"

    search_params = {
        "q": q,
        "query_by": query_by,
        "per_page": 100,
        "num_typos": 2,
        "facet_by": "cuisine,tags,cooking_time",
        "max_facet_values": 20,
        "prioritize_exact_match": True,
        "drop_tokens_threshold": 5,
    }
    if filter_by:
        search_params["filter_by"] = filter_by

    raw = client.collections[RECIPES_COLLECTION].documents.search(search_params)

    cards: list[tuple[tuple, RecipeCard]] = []
    for hit in raw.get("hits", []):
        doc = hit["document"]
        recipe_ings = normalize_list(doc.get("ingredients", []))
        overlap = compute_overlap(recipe_ings, owned_set)
        text_match = float(hit.get("text_match", 0))

        card = RecipeCard(
            id=str(doc["id"]),
            name=doc.get("name", ""),
            description=doc.get("description", ""),
            cuisine=doc.get("cuisine", ""),
            ingredients=doc.get("ingredients", []),
            instructions=doc.get("instructions", ""),
            cooking_time=int(doc.get("cooking_time", 0)),
            tags=doc.get("tags", []),
            owned_ingredients=overlap["matched"],
            missing_ingredients=overlap["missing"],
            match_score=overlap["match_score"],
            available_percentage=overlap["match_percentage"],
            matched_count=overlap["matched_count"],
            missing_count=overlap["missing_count"],
            total_ingredients=overlap["total"],
        )
        key = rank_key(
            overlap["matched_count"], overlap["missing_count"], overlap["match_percentage"], text_match
        )
        cards.append((key, card))

    if owned_set:
        cards.sort(key=lambda t: t[0], reverse=True)
    # else: keep Typesense relevance order

    trimmed = [c[1] for c in cards][: max(1, req.per_page)]
    return SearchRecipesResponse(
        count=len(trimmed),
        normalized_ingredients=owned,
        recipes=trimmed,
        facets=_facets(raw),
    )


def get_recipe(recipe_id: str) -> dict | None:
    client = get_client()
    try:
        return client.collections[RECIPES_COLLECTION].documents[recipe_id].retrieve()
    except Exception:
        return None
