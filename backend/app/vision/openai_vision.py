"""OpenAI vision provider (Chat Completions API with image input)."""
from __future__ import annotations

import base64

from ..config import get_settings
from .base import PROMPT, VisionProvider
from ._parse import parse_ingredient_list


class OpenAIVisionProvider(VisionProvider):
    name = "openai"

    def __init__(self) -> None:
        from openai import OpenAI  # lazy import

        s = get_settings()
        if not s.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        self._client = OpenAI(api_key=s.openai_api_key)
        self._model = s.openai_model

    def detect_ingredients(self, image_bytes: bytes, mime_type: str) -> list[str]:
        b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        resp = self._client.chat.completions.create(
            model=self._model,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                        },
                    ],
                }
            ],
        )
        return parse_ingredient_list(resp.choices[0].message.content or "")
