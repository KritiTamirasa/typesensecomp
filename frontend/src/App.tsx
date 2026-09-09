import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadArea, { type UploadAreaHandle } from "./components/UploadArea";
import IngredientChips from "./components/IngredientChips";
import DietaryFilter from "./components/DietaryFilter";
import SearchBar, { type QuickFilterDef } from "./components/SearchBar";
import RecipeCardView from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import LoadingRecipeCard from "./components/LoadingRecipeCard";
import EmptyState from "./components/EmptyState";
import { analyzeFridge, findStores, searchRecipes } from "./lib/api";
import { getLocation } from "./lib/geo";
import type {
  FindStoresResponse,
  RecipeCard,
  SearchResponse,
} from "./lib/types";

type Stage = "upload" | "results" | "detail";

type QuickFilterKind = "tag" | "cuisine" | "maxTime";
interface QuickFilterConfig {
  id: string;
  label: string;
  kind: QuickFilterKind;
  value: string | number;
}

// Only chips backed by tags/cuisine values that actually exist in the seeded
// recipe dataset, so a click always executes a real Typesense query — never
// a filter that's guaranteed to come back empty.
const QUICK_FILTER_CONFIG: QuickFilterConfig[] = [
  { id: "under20", label: "Under 20 min", kind: "maxTime", value: 20 },
  { id: "high-protein", label: "High protein", kind: "tag", value: "high protein" },
  { id: "comfort-food", label: "Comfort food", kind: "tag", value: "comfort food" },
  { id: "indian", label: "Indian", kind: "cuisine", value: "Indian" },
  { id: "quick", label: "Quick", kind: "tag", value: "quick" },
];

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [manualDraft, setManualDraft] = useState("");
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [activeQuickIds, setActiveQuickIds] = useState<string[]>([]);

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

  const uploadRef = useRef<UploadAreaHandle>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

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
      // Merge rather than replace, so a second fridge/pantry photo adds to
      // what was already detected instead of discarding it.
      setIngredients((prev) => Array.from(new Set([...prev, ...res.ingredients])));
      setProvider(res.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  function toggleQuickFilter(id: string) {
    setActiveQuickIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const quickFilterDefs: QuickFilterDef[] = QUICK_FILTER_CONFIG.map((f) => ({
    id: f.id,
    label: f.label,
    active: activeQuickIds.includes(f.id),
  }));

  async function runSearch() {
    setError(null);
    setSearching(true);
    try {
      const active = QUICK_FILTER_CONFIG.filter((f) => activeQuickIds.includes(f.id));
      const quickTags = active.filter((f) => f.kind === "tag").map((f) => f.value as string);
      const cuisine = active.find((f) => f.kind === "cuisine")?.value as string | undefined;
      const maxCookingTime = active.find((f) => f.kind === "maxTime")?.value as
        | number
        | undefined;

      const res = await searchRecipes({
        ingredients,
        query: query.trim() || undefined,
        tags: [...dietTags, ...quickTags],
        cuisine,
        max_cooking_time: maxCookingTime,
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
    setIngredients((prev) => Array.from(new Set([...prev, ...parsed])));
    setManualDraft("");
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
    <div className="min-h-screen bg-mint">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-text/20 bg-amber-bg px-4 py-3 text-sm font-medium text-amber-text">
            {error}
          </div>
        )}

        {stage === "upload" && (
          <div className="space-y-8">
            {ingredients.length === 0 && !analyzing && (
              <Hero
                onScanClick={() => uploadRef.current?.openPicker()}
                onManualClick={() => manualInputRef.current?.focus()}
              />
            )}

            <section className="card-surface p-6 sm:p-8">
              <p className="section-eyebrow">Step 1</p>
              <h2 className="mt-1 text-section font-extrabold text-ink">
                Show us what&rsquo;s inside
              </h2>
              <p className="mt-1 text-sm text-muted">
                Upload a photo of your fridge or pantry.
              </p>

              <div className="mt-5">
                <UploadArea
                  ref={uploadRef}
                  onSelect={handleFile}
                  previewUrl={previewUrl}
                  loading={analyzing}
                />
              </div>

              <div className="mt-6 border-t border-forest-sage/30 pt-6">
                <p className="text-sm font-semibold text-ink">
                  Or enter ingredients manually
                </p>
                <p className="mt-1 text-xs text-muted">
                  Useful for testing recipe search before the photo flow is
                  ready — hits the same search API either way.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    ref={manualInputRef}
                    className="input-field max-w-xs"
                    value={manualDraft}
                    aria-label="Ingredients, comma separated"
                    placeholder="spinach, paneer, tomato, eggs"
                    onChange={(e) => setManualDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        useManualIngredients();
                      }
                    }}
                  />
                  <button type="button" className="btn-secondary" onClick={useManualIngredients}>
                    Use these ingredients
                  </button>
                </div>
              </div>
            </section>

            {ingredients.length > 0 && (
              <section className="card-surface animate-fade-up p-6 sm:p-8">
                <p className="section-eyebrow">Step 2</p>
                <h2 className="mt-1 text-section font-extrabold text-ink">
                  Here&rsquo;s what we found
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Review your ingredients before we search for recipes.
                  {provider && (
                    <span className="text-muted"> · detected via {provider} vision</span>
                  )}
                </p>
                <div className="mt-4">
                  <IngredientChips ingredients={ingredients} onChange={setIngredients} />
                </div>

                <div className="mt-8 border-t border-forest-sage/30 pt-6">
                  <DietaryFilter selected={dietTags} onChange={setDietTags} />
                </div>

                <div className="mt-8 border-t border-forest-sage/30 pt-6">
                  <SearchBar
                    query={query}
                    onQueryChange={setQuery}
                    quickFilters={quickFilterDefs}
                    onToggleQuickFilter={toggleQuickFilter}
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary mt-8 w-full sm:w-auto"
                  onClick={runSearch}
                  disabled={searching || ingredients.length === 0}
                >
                  {searching ? "Searching…" : "Find recipes"}
                </button>

                {searching && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <LoadingRecipeCard />
                    <LoadingRecipeCard />
                    <LoadingRecipeCard />
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {stage === "results" && results && (
          <div className="animate-fade-up space-y-6">
            <button type="button" className="btn-ghost" onClick={() => setStage("upload")}>
              ← Edit ingredients
            </button>

            <div className="card-surface p-6 sm:p-8">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                quickFilters={quickFilterDefs}
                onToggleQuickFilter={toggleQuickFilter}
              />
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={runSearch}
                disabled={searching}
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>

            <div>
              <p className="section-eyebrow">Best matches for your fridge</p>
              <h2 className="mt-1 text-section font-extrabold text-ink">
                {results.recipes.length} recipes ranked by what you have
              </h2>
              <p className="mt-1 text-sm text-muted">
                Using: {results.normalized_ingredients.join(", ") || "no ingredients"}
              </p>
            </div>

            {searching ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingRecipeCard key={i} />
                ))}
              </div>
            ) : results.recipes.length === 0 ? (
              <EmptyState onEditIngredients={() => setStage("upload")} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.recipes.map((r) => (
                  <RecipeCardView key={r.id} recipe={r} onOpen={openRecipe} />
                ))}
              </div>
            )}
          </div>
        )}

        {stage === "detail" && selected && (
          <div className="card-surface animate-fade-up p-6 sm:p-8">
            <RecipeDetail
              recipe={selected}
              onBack={() => setStage("results")}
              onFindStores={findNearbyStores}
              stores={stores}
              storesLoading={storesLoading}
              storesError={storesError}
              originSource={originSource}
            />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-center text-xs text-muted sm:px-8">
        Search powered by Typesense · vision provider: {provider ?? "mock"}
      </footer>
    </div>
  );
}
