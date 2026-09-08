import type { FindStoresResponse, RecipeCard } from "../lib/types";
import StoreList from "./StoreList";

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
    <div className="detail">
      <button className="link-btn" onClick={onBack}>
        ← Back to recipes
      </button>

      <h2>{recipe.name}</h2>
      <p className="muted">
        {recipe.cuisine} · {recipe.cooking_time} min ·{" "}
        {recipe.available_percentage}% of ingredients on hand
      </p>
      <p>{recipe.description}</p>

      <div className="detail-grid">
        <div>
          <h4>You have</h4>
          <ul className="have-list">
            {recipe.owned_ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
            {recipe.owned_ingredients.length === 0 && (
              <li className="muted">nothing detected</li>
            )}
          </ul>
        </div>
        <div>
          <h4>You need to buy</h4>
          <ul className="missing-list">
            {recipe.missing_ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
            {recipe.missing_ingredients.length === 0 && (
              <li className="muted">nothing — you're good to cook!</li>
            )}
          </ul>
        </div>
      </div>

      <h4>All ingredients</h4>
      <p className="muted small">{recipe.ingredients.join(", ")}</p>

      <h4>Instructions</h4>
      <p className="instructions">{recipe.instructions}</p>

      {recipe.missing_ingredients.length > 0 && (
        <>
          <button className="primary-btn" onClick={onFindStores}>
            🛒 Find Missing Ingredients Nearby
          </button>
          <StoreList
            data={stores}
            loading={storesLoading}
            error={storesError}
            originSource={originSource}
          />
        </>
      )}
    </div>
  );
}
