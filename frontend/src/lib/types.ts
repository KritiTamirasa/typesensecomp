export interface AnalyzeResponse {
  provider: string;
  ingredients: string[];
  raw_ingredients: string[];
}

export interface RecipeCard {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  ingredients: string[];
  instructions: string;
  cooking_time: number;
  tags: string[];
  owned_ingredients: string[];
  missing_ingredients: string[];
  match_score: number;
  available_percentage: number;
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface SearchResponse {
  count: number;
  normalized_ingredients: string[];
  recipes: RecipeCard[];
  facets: Record<string, FacetCount[]>;
}

export interface PriceMatch {
  ingredient: string;
  display_name: string;
  brand: string;
  store_id: string;
  store_name: string;
  category: string;
  unit: string;
  price: number;
  unit_price: number;
}

export interface PricedIngredient {
  ingredient: string;
  best: PriceMatch;
  alternatives: PriceMatch[];
}

export interface PriceLookupResponse {
  currency: string;
  items: PricedIngredient[];
  unpriced: string[];
  basket_total: number;
}

export interface StorePricedItem {
  ingredient: string;
  display_name: string;
  brand: string;
  price: number;
  unit: string;
}

export interface StoreResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km: number | null;
  carries: string[];
  missing_here: string[];
  priced_items: StorePricedItem[];
  est_price: number | null;
}

export interface FindStoresResponse {
  count: number;
  normalized_ingredients: string[];
  origin: { lat: number; lng: number };
  radius_km: number;
  currency: string;
  stores: StoreResult[];
}
