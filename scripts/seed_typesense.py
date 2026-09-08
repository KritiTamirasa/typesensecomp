"""Seed Typesense with recipe and store data.

Usage:
    python scripts/seed_typesense.py          # drop + recreate + import everything

Reads connection settings from the same env vars the backend uses
(TYPESENSE_HOST / TYPESENSE_PORT / TYPESENSE_PROTOCOL / TYPESENSE_API_KEY).
"""
from __future__ import annotations

import json
import os
import sys

# Make the backend package importable so we share ingredient normalization.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.config import get_settings  # noqa: E402
from app.ingredients import (  # noqa: E402
    SYNONYM_SET_NAME,
    normalize_list,
    typesense_synonym_items,
)
from app.typesense_client import (  # noqa: E402
    RECIPES_COLLECTION,
    RECIPES_SCHEMA,
    STORES_COLLECTION,
    STORES_SCHEMA,
    get_client,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _load(name: str) -> list[dict]:
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


def _recreate(client, schema: dict) -> None:
    name = schema["name"]
    try:
        client.collections[name].delete()
        print(f"  dropped existing '{name}'")
    except Exception:
        pass
    client.collections.create(schema)
    print(f"  created '{name}'")


def seed_recipes(client) -> None:
    recipes = _load("recipes.json")
    for r in recipes:
        r["ingredients"] = normalize_list(r.get("ingredients", []))
        r["tags"] = [t.strip().lower() for t in r.get("tags", [])]
        r["cooking_time"] = int(r["cooking_time"])
    res = client.collections[RECIPES_COLLECTION].documents.import_(recipes, {"action": "upsert"})
    _report(res, "recipes")


def seed_stores(client) -> None:
    stores = _load("stores.json")
    for s in stores:
        s["inventory"] = normalize_list(s.get("inventory", []))
    res = client.collections[STORES_COLLECTION].documents.import_(stores, {"action": "upsert"})
    _report(res, "stores")


def seed_synonyms() -> None:
    """Use the v28+ synonym-set API via raw HTTP (python client lacks it)."""
    import requests

    s = get_settings()
    base = f"{s.typesense_protocol}://{s.typesense_host}:{s.typesense_port}"
    headers = {"X-TYPESENSE-API-KEY": s.typesense_api_key}
    items = typesense_synonym_items()

    r = requests.put(
        f"{base}/synonym_sets/{SYNONYM_SET_NAME}",
        json={"items": items},
        headers=headers,
        timeout=5,
    )
    r.raise_for_status()

    # Attach the set to both collections so search picks it up automatically.
    for coll in (RECIPES_COLLECTION, STORES_COLLECTION):
        requests.patch(
            f"{base}/collections/{coll}",
            json={"synonym_sets": [SYNONYM_SET_NAME]},
            headers=headers,
            timeout=5,
        ).raise_for_status()

    print(f"  upserted synonym set '{SYNONYM_SET_NAME}' with {len(items)} groups")


def _report(result, label: str) -> None:
    if isinstance(result, str):
        lines = [json.loads(line) for line in result.splitlines() if line.strip()]
    else:
        lines = result
    ok = sum(1 for line in lines if line.get("success"))
    failed = [line for line in lines if not line.get("success")]
    print(f"  imported {ok}/{len(lines)} {label}")
    for f in failed[:5]:
        print(f"    FAIL: {f}")


def main() -> None:
    client = get_client()
    print("Recreating collections...")
    _recreate(client, RECIPES_SCHEMA)
    _recreate(client, STORES_SCHEMA)
    print("Seeding recipes...")
    seed_recipes(client)
    print("Seeding stores...")
    seed_stores(client)
    print("Seeding synonyms...")
    seed_synonyms()
    print("\nDone. Typesense is seeded and ready.")


if __name__ == "__main__":
    main()
