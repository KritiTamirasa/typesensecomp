"""FastAPI app — the only component that holds Typesense credentials."""
from __future__ import annotations

import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .ingredients import normalize_list
from .models import (
    AnalyzeFridgeResponse,
    FindStoresRequest,
    FindStoresResponse,
    PriceLookupRequest,
    PriceLookupResponse,
    SearchRecipesRequest,
    SearchRecipesResponse,
)
from .services.price_search import lookup_prices
from .services.recipe_search import get_recipe, search_recipes
from .services.store_search import find_stores
from .typesense_client import (
    PRICES_COLLECTION,
    RECIPES_COLLECTION,
    STORES_COLLECTION,
    get_client,
)
from .vision import get_vision_provider

logging.basicConfig(level=logging.INFO)
settings = get_settings()

app = FastAPI(title="Fridge → Recipes → Groceries", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.get("/health")
def health() -> dict:
    ts_ok = False
    collections: list[str] = []
    try:
        client = get_client()
        collections = [c["name"] for c in client.collections.retrieve()]
        ts_ok = True
    except Exception as exc:  # noqa: BLE001
        logging.warning("typesense health check failed: %s", exc)

    return {
        "status": "ok",
        "typesense_connected": ts_ok,
        "collections": collections,
        "recipes_indexed": RECIPES_COLLECTION in collections,
        "stores_indexed": STORES_COLLECTION in collections,
        "prices_indexed": PRICES_COLLECTION in collections,
        "vision_provider": get_vision_provider().name,
    }


@app.post("/analyze-fridge", response_model=AnalyzeFridgeResponse)
async def analyze_fridge(image: UploadFile = File(...)) -> AnalyzeFridgeResponse:
    mime = image.content_type or "image/jpeg"
    if mime not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(415, f"unsupported image type: {mime}")

    data = await image.read()
    if not data:
        raise HTTPException(400, "empty upload")

    provider = get_vision_provider()
    try:
        raw = provider.detect_ingredients(data, mime)
    except Exception as exc:  # noqa: BLE001
        logging.exception("vision provider failed")
        raise HTTPException(502, f"vision provider error: {exc}") from exc

    return AnalyzeFridgeResponse(
        provider=provider.name,
        ingredients=normalize_list(raw),
        raw_ingredients=raw,
    )


@app.post("/search-recipes", response_model=SearchRecipesResponse)
def search_recipes_endpoint(req: SearchRecipesRequest) -> SearchRecipesResponse:
    if not [i for i in req.ingredients if i and i.strip()]:
        raise HTTPException(400, "ingredients list is required and must not be empty")
    try:
        return search_recipes(req)
    except Exception as exc:  # noqa: BLE001
        logging.exception("recipe search failed")
        raise HTTPException(502, f"recipe search error: {exc}") from exc


@app.get("/recipes/{recipe_id}")
def get_recipe_endpoint(recipe_id: str) -> dict:
    doc = get_recipe(recipe_id)
    if not doc:
        raise HTTPException(404, "recipe not found")
    return doc


@app.post("/price-lookup", response_model=PriceLookupResponse)
def price_lookup_endpoint(req: PriceLookupRequest) -> PriceLookupResponse:
    if not req.ingredients:
        raise HTTPException(400, "ingredients list is required")
    try:
        return lookup_prices(req)
    except Exception as exc:  # noqa: BLE001
        logging.exception("price lookup failed")
        raise HTTPException(502, f"price lookup error: {exc}") from exc


@app.post("/find-stores", response_model=FindStoresResponse)
def find_stores_endpoint(req: FindStoresRequest) -> FindStoresResponse:
    if not req.ingredients:
        raise HTTPException(400, "ingredients list is required")
    try:
        return find_stores(req)
    except Exception as exc:  # noqa: BLE001
        logging.exception("store search failed")
        raise HTTPException(502, f"store search error: {exc}") from exc
