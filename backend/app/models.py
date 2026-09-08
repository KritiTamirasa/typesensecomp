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


class FacetCount(BaseModel):
    value: str
    count: int


class SearchRecipesResponse(BaseModel):
    count: int
    normalized_ingredients: list[str]
    recipes: list[RecipeCard]
    facets: dict[str, list[FacetCount]]


class FindStoresRequest(BaseModel):
    ingredients: list[str]
    lat: float | None = None
    lng: float | None = None
    radius_km: float = 10.0
    require_all: bool = False


class StoreResult(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    distance_km: float | None
    carries: list[str]
    missing_here: list[str]


class FindStoresResponse(BaseModel):
    count: int
    normalized_ingredients: list[str]
    origin: dict[str, float]
    stores: list[StoreResult]
