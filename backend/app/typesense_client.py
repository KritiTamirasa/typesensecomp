"""Typesense client factory + collection schemas.

The FastAPI backend is the *only* place that holds the Typesense API key.
The frontend must never talk to Typesense directly.
"""
from __future__ import annotations

import typesense

from .config import get_settings

RECIPES_COLLECTION = "recipes"
STORES_COLLECTION = "stores"
PRICES_COLLECTION = "prices"

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

# Grocery price index (#2). Fabricated data, seeded from
# scripts/data/grocery_prices.csv. `ingredient` is the canonical (normalized)
# name used to join back to a recipe's missing ingredients.
PRICES_SCHEMA = {
    "name": PRICES_COLLECTION,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "ingredient", "type": "string", "facet": True},
        {"name": "display_name", "type": "string"},
        {"name": "brand", "type": "string"},
        {"name": "store_id", "type": "string", "facet": True},
        {"name": "store_name", "type": "string"},
        {"name": "category", "type": "string", "facet": True},
        {"name": "unit", "type": "string"},
        {"name": "price", "type": "float"},
        {"name": "unit_price", "type": "float", "facet": True},
        {"name": "in_stock", "type": "bool", "facet": True},
    ],
    "default_sorting_field": "unit_price",
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
