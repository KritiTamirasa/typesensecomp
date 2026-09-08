import type { RecipeCard as Recipe } from "../lib/types";

interface Props {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

function matchClass(pct: number): string {
  if (pct >= 80) return "match-high";
  if (pct >= 50) return "match-mid";
  return "match-low";
}

export default function RecipeCard({ recipe, onOpen }: Props) {
  return (
    <button className="recipe-card" onClick={() => onOpen(recipe)}>
      <div className="recipe-card-head">
        <span className={`match-badge ${matchClass(recipe.available_percentage)}`}>
          {recipe.available_percentage}% match
        </span>
        <span className="muted">{recipe.cooking_time} min</span>
      </div>
      <h3>{recipe.name}</h3>
      <p className="muted small">{recipe.cuisine}</p>
      <p className="recipe-desc">{recipe.description}</p>

      <div className="ing-line">
        <span className="ing-label have">Have {recipe.owned_ingredients.length}</span>
        {recipe.missing_ingredients.length > 0 ? (
          <span className="ing-label missing">
            Missing {recipe.missing_ingredients.length}:{" "}
            {recipe.missing_ingredients.slice(0, 3).join(", ")}
            {recipe.missing_ingredients.length > 3 ? "…" : ""}
          </span>
        ) : (
          <span className="ing-label have">You have everything! 🎉</span>
        )}
      </div>

      <div className="tags">
        {recipe.tags.slice(0, 3).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}
