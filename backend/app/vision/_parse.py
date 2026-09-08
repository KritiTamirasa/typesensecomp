"""Shared helper: pull a JSON array of strings out of a model response."""
from __future__ import annotations

import json
import re


def parse_ingredient_list(text: str) -> list[str]:
    text = text.strip()
    # Strip markdown fences if the model added them anyway.
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", text, flags=re.DOTALL)
        if not match:
            return []
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return []
    if not isinstance(data, list):
        return []
    return [str(x).strip() for x in data if str(x).strip()]
