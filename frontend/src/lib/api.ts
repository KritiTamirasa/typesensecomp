import type {
  AnalyzeResponse,
  FindStoresResponse,
  PriceLookupResponse,
  SearchResponse,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export async function analyzeFridge(file: File): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/analyze-fridge`, {
    method: "POST",
    body: form,
  });
  return handle<AnalyzeResponse>(res);
}

export async function searchRecipes(params: {
  ingredients: string[];
  query?: string;
  cuisine?: string | null;
  max_cooking_time?: number | null;
  tags?: string[];
  willing_to_buy?: boolean;
}): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search-recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ per_page: 24, ...params }),
  });
  return handle<SearchResponse>(res);
}

export async function findStores(params: {
  ingredients: string[];
  lat: number;
  lng: number;
  radius_km?: number;
  require_all?: boolean;
}): Promise<FindStoresResponse> {
  const res = await fetch(`${API_BASE}/find-stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ radius_km: 16, ...params }),
  });
  return handle<FindStoresResponse>(res);
}

export async function priceLookup(params: {
  ingredients: string[];
  category?: string | null;
  store_id?: string | null;
}): Promise<PriceLookupResponse> {
  const res = await fetch(`${API_BASE}/price-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handle<PriceLookupResponse>(res);
}
