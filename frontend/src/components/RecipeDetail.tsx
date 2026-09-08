import { useEffect, useState } from "react";
import type {
  FindStoresResponse,
  PriceLookupResponse,
  RecipeCard,
} from "../lib/types";
import { priceLookup } from "../lib/api";
import { money } from "../lib/format";
import StoreList from "./StoreList";

interface Props {
  recipe: RecipeCard;
  willingToBuy: boolean;
  onBack: () => void;
  onFindStores: () => void;
  radiusMi: number;
  onRadiusChange: (mi: number) => void;
  stores: FindStoresResponse | null;
  storesLoading: boolean;
  storesError: string | null;
  originSource: "browser" | "fallback" | null;
}

export default function RecipeDetail({
  recipe,
  willingToBuy,
  onBack,
  onFindStores,
  radiusMi,
  onRadiusChange,
  stores,
  storesLoading,
  storesError,
  originSource,
}: Props) {
  const [prices, setPrices] = useState<PriceLookupResponse | null>(null);
  const [pricesError, setPricesError] = useState<string | null>(null);

  useEffect(() => {
    setPrices(null);
    setPricesError(null);
    if (!willingToBuy || recipe.missing_ingredients.length === 0) return;
    let cancelled = false;
    priceLookup({ ingredients: recipe.missing_ingredients })
      .then((res) => {
        if (!cancelled) setPrices(res);
      })
      .catch((e) => {
        if (!cancelled)
          setPricesError(e instanceof Error ? e.message : "Price lookup failed");
      });
    return () => {
      cancelled = true;
    };
  }, [recipe, willingToBuy]);

  const priceFor = (ingredient: string) =>
    prices?.items.find((i) => i.ingredient === ingredient)?.best ?? null;

  const currency = prices?.currency ?? "USD";

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
            {recipe.missing_ingredients.map((i) => {
              const p = priceFor(i);
              return (
                <li key={i}>
                  <span>{i}</span>
                  {p && (
                    <span className="price-tag">
                      {money(p.price, currency)} · {p.store_name}
                      {p.category !== "conventional" && ` (${p.category})`}
                    </span>
                  )}
                </li>
              );
            })}
            {recipe.missing_ingredients.length === 0 && (
              <li className="muted">nothing — you're good to cook!</li>
            )}
          </ul>
          {willingToBuy && prices && prices.items.length > 0 && (
            <p className="muted small">
              Estimated grocery cost: {money(prices.basket_total, currency)}
              {prices.unpriced.length > 0 &&
                ` · no price for ${prices.unpriced.join(", ")}`}
            </p>
          )}
          {pricesError && <p className="error small">{pricesError}</p>}
        </div>
      </div>

      <h4>All ingredients</h4>
      <p className="muted small">{recipe.ingredients.join(", ")}</p>

      <h4>Instructions</h4>
      <p className="instructions">{recipe.instructions}</p>

      {recipe.missing_ingredients.length > 0 && (
        <>
          <label className="radius-field">
            <span>
              Search radius: <strong>{radiusMi} mi</strong>
            </span>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={radiusMi}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
            />
          </label>
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
