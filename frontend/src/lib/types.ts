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
  matched_count?: number;
  missing_count?: number;
  total_ingredients?: number;
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

export interface StoreResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km: number | null;
  carries: string[];
  missing_here: string[];
}

export interface FindStoresResponse {
  count: number;
  normalized_ingredients: string[];
  origin: { lat: number; lng: number };
  stores: StoreResult[];
}
