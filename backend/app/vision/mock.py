"""Deterministic mock vision provider.

Used when no vision API key is configured so the full app can still be demoed.
Returns a realistic fridge ingredient list.
"""
from __future__ import annotations

from .base import VisionProvider

MOCK_INGREDIENTS = [
    "tomato",
    "spinach",
    "eggs",
    "milk",
    "cheddar cheese",
    "butter",
    "garlic",
    "onion",
    "bell pepper",
    "carrot",
    "chicken breast",
    "greek yogurt",
    "lemon",
]


class MockVisionProvider(VisionProvider):
    name = "mock"

    def detect_ingredients(self, image_bytes: bytes, mime_type: str) -> list[str]:
        return list(MOCK_INGREDIENTS)
