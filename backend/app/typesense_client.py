"""Typesense client factory + collection schemas.

The FastAPI backend is the *only* place that holds the Typesense API key.
The frontend must never talk to Typesense directly.
"""
from __future__ import annotations

import typesense

from .config import get_settings

RECIPES_COLLECTION = "recipes"
STORES_COLLECTION = "stores"

RECIPES_SCHEMA = {
    "name": RECIPES_COLLECTION,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "ingredients", "type": "string[]", "facet": True},
        {"name": "cuisine", "type": "string", "facet": True},
        {"name": "instructions", "type": "string"},
        {"name": "cooking_time", "type": "int32", "facet": True},
        {"name": "tags", "type": "string[]", "facet": True},
    ],
    "default_sorting_field": "cooking_time",
}

STORES_SCHEMA = {
    "name": STORES_COLLECTION,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "location", "type": "geopoint"},
        {"name": "address", "type": "string"},
        {"name": "inventory", "type": "string[]", "facet": True},
    ],
}


def get_client() -> typesense.Client:
    s = get_settings()
    return typesense.Client(
        {
            "api_key": s.typesense_api_key,
            "nodes": [
                {
                    "host": s.typesense_host,
                    "port": s.typesense_port,
                    "protocol": s.typesense_protocol,
                }
            ],
            "connection_timeout_seconds": 5,
        }
    )
