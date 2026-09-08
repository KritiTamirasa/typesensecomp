"""Central configuration, loaded from environment variables.

Everything is configured through env vars so the same code runs on any laptop.
Copy `.env.example` to `.env` (repo root) and adjust as needed.
"""
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

# Load the repo-root .env if present (backend/ is one level down).
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))


class Settings:
    # --- Typesense ---
    typesense_host: str = os.getenv("TYPESENSE_HOST", "localhost")
    typesense_port: int = int(os.getenv("TYPESENSE_PORT", "8108"))
    typesense_protocol: str = os.getenv("TYPESENSE_PROTOCOL", "http")
    typesense_api_key: str = os.getenv("TYPESENSE_API_KEY", "xyz")

    # --- Vision provider ---
    # one of: auto | mock | anthropic | openai | gemini
    vision_provider: str = os.getenv("VISION_PROVIDER", "auto")

    anthropic_api_key: str | None = os.getenv("ANTHROPIC_API_KEY")
    anthropic_model: str = os.getenv("ANTHROPIC_VISION_MODEL", "claude-opus-5")

    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")

    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv("GEMINI_VISION_MODEL", "gemini-flash-latest")

    # --- Geo fallback (used when the browser denies geolocation) ---
    fallback_lat: float = float(os.getenv("FALLBACK_LAT", "12.9716"))   # Bangalore
    fallback_lng: float = float(os.getenv("FALLBACK_LNG", "77.5946"))

    # --- CORS ---
    cors_origins: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")


@lru_cache
def get_settings() -> Settings:
    return Settings()
