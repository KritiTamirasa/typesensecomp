import type { FindStoresResponse } from "../lib/types";

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

  return (
    <div className="store-list">
      <p className="muted small">
        {data.count} store{data.count === 1 ? "" : "s"} within range, sorted by
        distance
        {originSource === "fallback" && " · using fallback location"}
      </p>
      {data.stores.length === 0 && (
        <p className="muted">
          No stores nearby carry those ingredients. Try a wider radius.
        </p>
      )}
      {data.stores.map((store) => (
        <div key={store.id} className="store">
          <div className="store-head">
            <strong>{store.name}</strong>
            {store.distance_km != null && (
              <span className="distance">{store.distance_km} km</span>
            )}
          </div>
          <p className="muted small">{store.address}</p>
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
