import { useCallback, useEffect, useRef, useState } from "react";
import UploadArea from "./components/UploadArea";
import IngredientChips from "./components/IngredientChips";
import RecipeCardView from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import { analyzeFridge, findStores, searchRecipes } from "./lib/api";
import { getLocation } from "./lib/geo";
import { milesToKm } from "./lib/format";
import type {
  FindStoresResponse,
  RecipeCard,
  SearchResponse,
} from "./lib/types";

type Stage = "upload" | "results" | "detail";

// Formats a browser can both preview in <img> and the backend accepts.
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  previewUrlRef.current = previewUrl;
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [manualDraft, setManualDraft] = useState("");

  const [willingToBuy, setWillingToBuy] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [selected, setSelected] = useState<RecipeCard | null>(null);

  const [stores, setStores] = useState<FindStoresResponse | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [originSource, setOriginSource] = useState<
    "browser" | "fallback" | null
  >(null);
  const [radiusMi, setRadiusMi] = useState(10);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(
        `Unsupported image format${file.type ? ` (${file.type})` : ""}. ` +
          "Please use a JPEG, PNG, WebP or GIF — iPhone HEIC photos aren't supported. " +
          "On iPhone: Settings → Camera → Formats → \"Most Compatible\", or share the photo as a screenshot.",
      );
      return;
    }

    setAnalyzing(true);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const res = await analyzeFridge(file);
      setIngredients(res.ingredients);
      setProvider(res.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  async function runSearch(willing: boolean = willingToBuy) {
    setError(null);
    setSearching(true);
    try {
      const res = await searchRecipes({
        ingredients,
        query: query.trim() || undefined,
        willing_to_buy: willing,
      });
      setResults(res);
      setStage("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recipe search failed");
    } finally {
      setSearching(false);
    }
  }

  function useManualIngredients() {
    const parsed = manualDraft
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (parsed.length === 0) return;
    setError(null);
    setProvider(null);
    setIngredients(parsed);
  }

  function openRecipe(recipe: RecipeCard) {
    setSelected(recipe);
    setStores(null);
    setStoresError(null);
    setStage("detail");
  }

  async function findNearbyStores() {
    if (!selected) return;
    setStoresLoading(true);
    setStoresError(null);
    try {
      const loc = await getLocation();
      setOriginSource(loc.source);
      const res = await findStores({
        ingredients: selected.missing_ingredients,
        lat: loc.lat,
        lng: loc.lng,
        radius_km: milesToKm(radiusMi),
      });
      setStores(res);
    } catch (e) {
      setStoresError(e instanceof Error ? e.message : "Store search failed");
    } finally {
      setStoresLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🧊 Fridge → Recipes → Groceries</h1>
        <p className="muted">
          Snap your fridge. We detect what's inside, rank recipes by what you
          already have, and point you to stores for the rest.
        </p>
      </header>

      {error && <div className="banner error">{error}</div>}

      {stage === "upload" && (
        <section className="panel">
          <UploadArea
            onSelect={handleFile}
            previewUrl={previewUrl}
            loading={analyzing}
          />

          <div className="section-head">
            <h3>Or enter ingredients manually</h3>
          </div>
          <p className="muted small">
            Useful for testing recipe search before the photo flow is ready —
            hits the same search API either way.
          </p>
          <div className="chips" style={{ marginBottom: "0.5rem" }}>
            <input
              className="chip-input"
              value={manualDraft}
              placeholder="spinach, paneer, tomato, eggs"
              onChange={(e) => setManualDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  useManualIngredients();
                  setManualDraft("");
                }
              }}
            />
          </div>
          <button
            className="link-btn"
            onClick={() => {
              useManualIngredients();
              setManualDraft("");
            }}
          >
            Use these ingredients
          </button>

          {ingredients.length > 0 && (
            <>
              <div className="section-head">
                <h3>Detected ingredients</h3>
                {provider && (
                  <span className="muted small">via {provider} vision</span>
                )}
              </div>
              <p className="muted small">
                Tap × to remove, or type to add anything we missed.
              </p>
              <IngredientChips
                ingredients={ingredients}
                onChange={setIngredients}
              />

              <label className="field-label">
                Optional: refine with a search
                <input
                  className="text-input"
                  placeholder='e.g. "high protein dinner", "Italian", "under 30 minutes"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>

              <button
                className="primary-btn big"
                onClick={() => runSearch()}
                disabled={searching}
              >
                {searching ? "Searching…" : "🍳 Find Recipes"}
              </button>
            </>
          )}
        </section>
      )}

      {stage === "results" && results && (
        <section className="panel">
          <button
            className="link-btn"
            onClick={() => setStage("upload")}
          >
            ← Edit ingredients
          </button>
          <div className="section-head">
            <h3>{results.recipes.length} recipes ranked by what you have</h3>
          </div>
          <p className="muted small">
            Using: {results.normalized_ingredients.join(", ") || "no ingredients"}
          </p>
          <label className="buy-toggle">
            <input
              type="checkbox"
              checked={willingToBuy}
              onChange={(e) => {
                const next = e.target.checked;
                setWillingToBuy(next);
                runSearch(next);
              }}
            />
            🛒 I'm willing to buy missing ingredients
            <span className="muted small">
              {willingToBuy
                ? " — showing prices, all recipes ranked"
                : " — prioritizing recipes you can almost make"}
            </span>
          </label>
          <div className="recipe-grid">
            {results.recipes.map((r) => (
              <RecipeCardView key={r.id} recipe={r} onOpen={openRecipe} />
            ))}
          </div>
          {results.recipes.length === 0 && (
            <p className="muted">No recipes matched. Try adjusting your search.</p>
          )}
        </section>
      )}

      {stage === "detail" && selected && (
        <section className="panel">
          <RecipeDetail
            recipe={selected}
            willingToBuy={willingToBuy}
            onBack={() => setStage("results")}
            onFindStores={findNearbyStores}
            radiusMi={radiusMi}
            onRadiusChange={setRadiusMi}
            stores={stores}
            storesLoading={storesLoading}
            storesError={storesError}
            originSource={originSource}
          />
        </section>
      )}

      <footer className="muted small">
        Search powered by Typesense · vision provider: {provider ?? "mock"}
      </footer>
    </div>
  );
}
