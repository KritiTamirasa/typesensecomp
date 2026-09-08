"""Pydantic request/response models."""
from __future__ import annotations

from pydantic import BaseModel, Field


class AnalyzeFridgeResponse(BaseModel):
    provider: str
    ingredients: list[str]
    raw_ingredients: list[str]


class SearchRecipesRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)
    query: str | None = None
    cuisine: str | None = None
    max_cooking_time: int | None = None
    tags: list[str] = Field(default_factory=list)
    per_page: int = 20
    # When False, the user is not willing to buy groceries, so recipes with many
    # missing ingredients are pushed down harder. Default True keeps prior behaviour.
    willing_to_buy: bool = True


class RecipeCard(BaseModel):
    id: str
    name: str
    description: str
    cuisine: str
    ingredients: list[str]
    instructions: str
    cooking_time: int
    tags: list[str]
    owned_ingredients: list[str]
    missing_ingredients: list[str]
    match_score: float
    available_percentage: int
    matched_count: int
    missing_count: int
    total_ingredients: int


class FacetCount(BaseModel):
    value: str
    count: int


class SearchRecipesResponse(BaseModel):
    count: int
    normalized_ingredients: list[str]
    recipes: list[RecipeCard]
    facets: dict[str, list[FacetCount]]


class PriceLookupRequest(BaseModel):
    ingredients: list[str]
    category: str | None = None
    store_id: str | None = None


class PriceMatch(BaseModel):
    ingredient: str
    display_name: str
    brand: str
    store_id: str
    store_name: str
    category: str
    unit: str
    price: float
    unit_price: float


class PricedIngredient(BaseModel):
    ingredient: str
    best: PriceMatch
    alternatives: list[PriceMatch]


class PriceLookupResponse(BaseModel):
    currency: str
    items: list[PricedIngredient]
    unpriced: list[str]
    basket_total: float


class FindStoresRequest(BaseModel):
    ingredients: list[str]
    lat: float | None = None
    lng: float | None = None
    radius_km: float = 10.0
    require_all: bool = False


class StorePricedItem(BaseModel):
    ingredient: str
    display_name: str
    brand: str
    price: float
    unit: str


class StoreResult(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    distance_km: float | None
    carries: list[str]
    missing_here: list[str]
    priced_items: list[StorePricedItem] = Field(default_factory=list)
    est_price: float | None = None


class FindStoresResponse(BaseModel):
    count: int
    normalized_ingredients: list[str]
    origin: dict[str, float]
    radius_km: float
    currency: str
    stores: list[StoreResult]
