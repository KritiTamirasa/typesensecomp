"""Pure ingredient-overlap + ranking helpers.

Kept separate from recipe_search.py (which owns the Typesense call) so this
logic is trivially unit-testable without a running Typesense instance.
"""
from __future__ import annotations


def compute_overlap(recipe_ingredients: list[str], owned: set[str]) -> dict:
    """Given a recipe's (already-normalized) ingredients and the user's
    owned ingredient set, return matched/missing lists and counts."""
    matched = [i for i in recipe_ingredients if i in owned]
    missing = [i for i in recipe_ingredients if i not in owned]
    total = len(recipe_ingredients)
    match_score = len(matched) / total if total else 0.0
    return {
        "matched": matched,
        "missing": missing,
        "matched_count": len(matched),
        "missing_count": len(missing),
        "total": total,
        "match_score": round(match_score, 3),
        "match_percentage": round(match_score * 100),
    }


def rank_key(
    matched_count: int,
    missing_count: int,
    match_percentage: float,
    text_match: float = 0.0,
) -> tuple:
    """Sort key for ranking recipe candidates, highest-priority-first when
    used with reverse=True:

    1. fewer missing ingredients wins
    2. higher match percentage wins
    3. higher matched count wins
    4. higher Typesense text relevance wins (final tiebreak)
    """
    return (-missing_count, match_percentage, matched_count, text_match)
