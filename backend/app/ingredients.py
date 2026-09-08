"""Ingredient normalization + synonym canonicalization.

Shared by the API and the seed script so that recipe ingredients, detected
ingredients, and store inventories all use the same canonical spellings.
"""
from __future__ import annotations

import re

# Leading quantity, e.g. "2 ", "1/2 ", "1-2 ", "1½ ".
_LEADING_QTY_RE = re.compile(r"^[\d.\/½¼¾⅓⅔\s-]*\d[\d.\/½¼¾⅓⅔\s-]*\s+")

_UNIT_WORDS = {
    "cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons",
    "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds", "g", "gram", "grams",
    "kg", "ml", "l", "liter", "liters", "litre", "litres", "clove", "cloves", "can",
    "cans", "pinch", "large", "small", "medium", "whole", "piece", "pieces",
}

# Canonical name -> list of alternative spellings.
# The canonical name is what we store/compare on; alternatives map to it.
SYNONYM_GROUPS: dict[str, list[str]] = {
    "bell pepper": ["capsicum", "sweet pepper"],
    "cilantro": ["coriander", "coriander leaves", "chinese parsley"],
    "scallion": ["green onion", "spring onion"],
    "chickpea": ["garbanzo bean", "garbanzo", "chana"],
    "eggplant": ["aubergine", "brinjal"],
    "zucchini": ["courgette"],
    "shrimp": ["prawn"],
    "arugula": ["rocket"],
    "beetroot": ["beet"],
    "maize": ["corn", "sweetcorn"],
    "garbanzo flour": ["besan", "gram flour"],
    "yogurt": ["curd", "dahi"],
    "clarified butter": ["ghee"],
}

# Flattened alt -> canonical lookup.
_ALT_TO_CANONICAL: dict[str, str] = {}
for _canon, _alts in SYNONYM_GROUPS.items():
    _ALT_TO_CANONICAL[_canon] = _canon
    for _alt in _alts:
        _ALT_TO_CANONICAL[_alt] = _canon


def _singularize(word: str) -> str:
    """Very small, deliberately dumb pluralizer good enough for a hackathon."""
    if len(word) <= 3:
        return word
    if word.endswith("ies"):
        return word[:-3] + "y"
    if word.endswith(("ses", "xes", "zes", "ches", "shes", "oes")):
        return word[:-2]
    if word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def normalize_ingredient(raw: str) -> str:
    """Lowercase, trim, strip quantity/unit/descriptor noise, singularize, apply synonyms."""
    text = raw.strip().lower()
    # Drop a leading quantity ("2 ", "1/2 ", "1-2 ") and, if present right
    # after it, a unit word ("tbsp", "large", "cloves", ...).
    text = _LEADING_QTY_RE.sub("", text)
    tokens = text.split()
    if tokens and tokens[0] in _UNIT_WORDS:
        text = " ".join(tokens[1:])
    # Drop common noise words / parenthetical notes.
    for noise in ("fresh ", "dried ", "ground ", "chopped ", "sliced ", "raw ", "organic "):
        if text.startswith(noise):
            text = text[len(noise):]
    text = text.split("(")[0].strip()
    text = text.replace("-", " ")

    if text in _ALT_TO_CANONICAL:
        return _ALT_TO_CANONICAL[text]

    singular = " ".join(_singularize(w) for w in text.split())
    if singular in _ALT_TO_CANONICAL:
        return _ALT_TO_CANONICAL[singular]
    return singular


def normalize_list(items: list[str]) -> list[str]:
    """Normalize + dedupe while preserving order."""
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        norm = normalize_ingredient(item)
        if norm and norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out


SYNONYM_SET_NAME = "fridge-synonyms"


def typesense_synonym_items() -> list[dict]:
    """Multi-way synonym items for the Typesense synonym set (v28+ API)."""
    return [
        {"id": canon.replace(" ", "-"), "synonyms": [canon, *alts]}
        for canon, alts in SYNONYM_GROUPS.items()
    ]
