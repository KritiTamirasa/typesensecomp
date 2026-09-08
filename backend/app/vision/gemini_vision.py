"""Gemini vision provider (google-generativeai)."""
from __future__ import annotations

from ..config import get_settings
from .base import PROMPT, VisionProvider
from ._parse import parse_ingredient_list


class GeminiVisionProvider(VisionProvider):
    name = "gemini"

    def __init__(self) -> None:
        import google.generativeai as genai  # lazy import

        s = get_settings()
        if not s.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        genai.configure(api_key=s.gemini_api_key)
        self._model = genai.GenerativeModel(s.gemini_model)

    def detect_ingredients(self, image_bytes: bytes, mime_type: str) -> list[str]:
        resp = self._model.generate_content(
            [PROMPT, {"mime_type": mime_type, "data": image_bytes}]
        )
        return parse_ingredient_list(resp.text or "")
