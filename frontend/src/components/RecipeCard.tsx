import type { RecipeCard as Recipe } from "../lib/types";
import MatchBadge from "./MatchBadge";
import { ArrowRightIcon, CheckIcon, ClockIcon, PlusIcon } from "./icons";

interface Props {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onOpen }: Props) {
  const missingCount = recipe.missing_count ?? recipe.missing_ingredients.length;

  return (
    <button
      type="button"
      className="card-surface group flex h-full flex-col p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-fresh"
      onClick={() => onOpen(recipe)}
    >
      <div className="flex items-start justify-between gap-2">
        <MatchBadge percentage={recipe.available_percentage} />
        <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-muted">
          <ClockIcon />
          {recipe.cooking_time} min
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{recipe.name}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span>{recipe.cuisine}</span>
        {recipe.tags.includes("vegetarian") && (
          <span className="rounded-full bg-forest-sage/35 px-2 py-0.5 font-medium text-forest-deep">
            Vegetarian
          </span>
        )}
        {recipe.tags.includes("vegan") && (
          <span className="rounded-full bg-forest-sage/35 px-2 py-0.5 font-medium text-forest-deep">
            Vegan
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted">{recipe.description}</p>

      <div className="mt-3 space-y-2">
        {recipe.owned_ingredients.length > 0 && (
          <div>
            <p className="section-eyebrow text-[10px]">You have</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {recipe.owned_ingredients.slice(0, 4).map((i) => (
                <span key={i} className="chip-have text-xs">
                  <CheckIcon className="h-3 w-3" />
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {missingCount === 0 ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
            <CheckIcon className="h-4 w-4" /> You have everything!
          </p>
        ) : (
          <div>
            <p className="section-eyebrow text-[10px]">You need</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {recipe.missing_ingredients.slice(0, 3).map((i) => (
                <span key={i} className="chip-missing text-xs">
                  <PlusIcon className="h-3 w-3" />
                  {i}
                </span>
              ))}
              {missingCount > 3 && (
                <span className="chip-missing text-xs">+{missingCount - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-1 pt-4 text-sm font-semibold text-forest-medium transition-colors group-hover:text-forest-deep">
        View recipe
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
