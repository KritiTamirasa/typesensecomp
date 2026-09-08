import type { FindStoresResponse } from "../lib/types";
import { kmToMiles, money } from "../lib/format";

interface Props {
  data: FindStoresResponse | null;
  loading: boolean;
  error: string | null;
  originSource: "browser" | "fallback" | null;
}

export default function StoreList({ data, loading, error, originSource }: Props) {
  if (loading) return <p className="muted">Finding nearby stores…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  const currency = data.currency ?? "USD";

  return (
    <div className="store-list">
      <p className="muted small">
        {data.count} store{data.count === 1 ? "" : "s"} within{" "}
        {kmToMiles(data.radius_km).toFixed(0)} mi, sorted by distance
        {originSource === "fallback" && " · using fallback location"}
      </p>
      {data.stores.length === 0 && (
        <p className="muted">
          No stores in range carry those ingredients. Try a wider radius.
        </p>
      )}
      {data.stores.map((store) => (
        <div key={store.id} className="store">
          <div className="store-head">
            <strong>{store.name}</strong>
            <span className="store-meta">
              {store.est_price != null && (
                <span className="price-tag">
                  ~{money(store.est_price, currency)} here
                </span>
              )}
              {store.distance_km != null && (
                <span className="distance">
                  {kmToMiles(store.distance_km).toFixed(1)} mi
                </span>
              )}
            </span>
          </div>
          <p className="muted small">{store.address}</p>
          {store.priced_items.length > 0 && (
            <ul className="store-prices">
              {store.priced_items.map((p) => (
                <li key={p.ingredient}>
                  <span>{p.ingredient}</span>
                  <span className="price-tag">
                    {money(p.price, currency)}
                    <span className="muted"> · {p.display_name}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="ing-line">
            {store.carries.length > 0 && (
              <span className="ing-label have">
                Carries: {store.carries.join(", ")}
              </span>
            )}
            {store.missing_here.length > 0 && (
              <span className="ing-label missing">
                Not here: {store.missing_here.join(", ")}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
