"""Vision provider interface.

Every provider takes raw image bytes and returns a list of raw ingredient
strings. Normalization/synonyms happen later in `ingredients.py`, so providers
only need to return plain English nouns.
"""
from __future__ import annotations

import abc

PROMPT = (
    "You are an ingredient detector for a recipe app. Look at this photo of the "
    "inside of a fridge or pantry. List every distinct food ingredient you can "
    "identify. Respond with ONLY a compact JSON array of lowercase singular "
    'ingredient names, e.g. ["tomato", "spinach", "eggs", "milk"]. '
    "No prose, no explanations, no markdown fences."
)


class VisionProvider(abc.ABC):
    name: str = "base"

    @abc.abstractmethod
    def detect_ingredients(self, image_bytes: bytes, mime_type: str) -> list[str]:
        ...
