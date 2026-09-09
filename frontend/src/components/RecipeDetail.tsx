import type { FindStoresResponse, RecipeCard } from "../lib/types";
import MatchBadge from "./MatchBadge";
import StoreList from "./StoreList";
import { CheckIcon, ClockIcon, PlusIcon } from "./icons";

interface Props {
  recipe: RecipeCard;
  onBack: () => void;
  onFindStores: () => void;
  stores: FindStoresResponse | null;
  storesLoading: boolean;
  storesError: string | null;
  originSource: "browser" | "fallback" | null;
}

export default function RecipeDetail({
  recipe,
  onBack,
  onFindStores,
  stores,
  storesLoading,
  storesError,
  originSource,
}: Props) {
  return (
    <div>
      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Back to recipes
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <MatchBadge percentage={recipe.available_percentage} />
        <span className="flex items-center gap-1 text-sm font-medium text-muted">
          <ClockIcon /> {recipe.cooking_time} min
        </span>
        <span className="text-sm font-medium text-muted">{recipe.cuisine}</span>
      </div>

      <h2 className="mt-3 text-section font-extrabold text-ink">{recipe.name}</h2>
      <p className="mt-2 max-w-2xl text-[15px] text-muted">{recipe.description}</p>
      <p className="mt-1 text-sm font-medium text-forest-medium">
        You have {recipe.matched_count ?? recipe.owned_ingredients.length} of{" "}
        {recipe.total_ingredients ?? recipe.ingredients.length} ingredients
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-5">
          <p className="section-eyebrow">You have</p>
          <ul className="mt-3 space-y-2">
            {recipe.owned_ingredients.map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <CheckIcon className="h-4 w-4 shrink-0 text-forest-medium" />
                {i}
              </li>
            ))}
            {recipe.owned_ingredients.length === 0 && (
              <li className="text-sm text-muted">Nothing detected yet</li>
            )}
          </ul>
        </div>
        <div className="card-surface p-5">
          <p className="section-eyebrow">You need</p>
          <ul className="mt-3 space-y-2">
            {recipe.missing_ingredients.map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <PlusIcon className="h-4 w-4 shrink-0 text-amber-text" />
                {i}
              </li>
            ))}
            {recipe.missing_ingredients.length === 0 && (
              <li className="flex items-center gap-2 text-sm font-semibold text-forest-deep">
                <CheckIcon className="h-4 w-4" /> You&rsquo;re good to cook!
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <p className="section-eyebrow">All ingredients</p>
        <p className="mt-1 text-sm text-muted">{recipe.ingredients.join(", ")}</p>
      </div>

      <div className="mt-6">
        <p className="section-eyebrow">Instructions</p>
        <p className="mt-2 whitespace-pre-line rounded-xl2 bg-mint p-4 text-sm leading-relaxed text-ink">
          {recipe.instructions}
        </p>
      </div>

      {recipe.missing_ingredients.length > 0 && (
        <div className="mt-8 rounded-xl3 border border-forest-sage/40 bg-white p-5">
          <p className="text-sm font-semibold text-ink">
            I&rsquo;m okay buying a few things
          </p>
          <p className="mt-1 text-sm text-muted">
            Find nearby stores that carry what this recipe is missing.
          </p>
          <button type="button" onClick={onFindStores} className="btn-primary mt-3">
            🛒 Find missing ingredients nearby
          </button>
          <StoreList
            data={stores}
            loading={storesLoading}
            error={storesError}
            originSource={originSource}
          />
        </div>
      )}
    </div>
  );
}
