import { useCallback, useEffect, useState } from "react";
import UploadArea from "./components/UploadArea";
import IngredientChips from "./components/IngredientChips";
import RecipeCardView from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import { analyzeFridge, findStores, searchRecipes } from "./lib/api";
import { getLocation } from "./lib/geo";
import type {
  FindStoresResponse,
  RecipeCard,
  SearchResponse,
} from "./lib/types";

type Stage = "upload" | "results" | "detail";

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setAnalyzing(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const res = await analyzeFridge(file);
      setIngredients(res.ingredients);
      setProvider(res.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  async function runSearch() {
    setError(null);
    setSearching(true);
    try {
      const res = await searchRecipes({
        ingredients,
        query: query.trim() || undefined,
      });
      setResults(res);
      setStage("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recipe search failed");
    } finally {
      setSearching(false);
    }
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
                onClick={runSearch}
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
            onBack={() => setStage("results")}
            onFindStores={findNearbyStores}
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
