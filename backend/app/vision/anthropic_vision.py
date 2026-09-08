"""Claude vision provider (Anthropic Messages API)."""
from __future__ import annotations

import base64

from ..config import get_settings
from .base import PROMPT, VisionProvider
from ._parse import parse_ingredient_list


class AnthropicVisionProvider(VisionProvider):
    name = "anthropic"

    def __init__(self) -> None:
        import anthropic  # lazy import so the dep is only needed when used

        s = get_settings()
        if not s.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set")
        self._client = anthropic.Anthropic(api_key=s.anthropic_api_key)
        self._model = s.anthropic_model

    def detect_ingredients(self, image_bytes: bytes, mime_type: str) -> list[str]:
        b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        resp = self._client.messages.create(
            model=self._model,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": b64,
                            },
                        },
                        {"type": "text", "text": PROMPT},
                    ],
                }
            ],
        )
        text = "".join(b.text for b in resp.content if getattr(b, "type", None) == "text")
        return parse_ingredient_list(text)
