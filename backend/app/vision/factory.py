"""Select a vision provider based on config, with a safe mock fallback."""
from __future__ import annotations

import logging

from ..config import get_settings
from .base import VisionProvider
from .mock import MockVisionProvider

log = logging.getLogger("vision")

_PROVIDERS = {}


def _build(provider: str) -> VisionProvider:
    if provider == "mock":
        return MockVisionProvider()
    if provider == "anthropic":
        from .anthropic_vision import AnthropicVisionProvider

        return AnthropicVisionProvider()
    if provider == "openai":
        from .openai_vision import OpenAIVisionProvider

        return OpenAIVisionProvider()
    if provider == "gemini":
        from .gemini_vision import GeminiVisionProvider

        return GeminiVisionProvider()
    raise ValueError(f"unknown vision provider: {provider}")


def _auto_pick() -> str:
    s = get_settings()
    if s.anthropic_api_key:
        return "anthropic"
    if s.openai_api_key:
        return "openai"
    if s.gemini_api_key:
        return "gemini"
    return "mock"


def get_vision_provider() -> VisionProvider:
    """Cached provider instance. Falls back to mock on any construction error."""
    s = get_settings()
    requested = s.vision_provider.lower().strip()
    if requested == "auto":
        requested = _auto_pick()

    if requested in _PROVIDERS:
        return _PROVIDERS[requested]

    try:
        provider = _build(requested)
    except Exception as exc:  # missing key, missing dep, etc.
        log.warning("vision provider %r unavailable (%s); falling back to mock", requested, exc)
        provider = MockVisionProvider()

    _PROVIDERS[requested] = provider
    return provider
