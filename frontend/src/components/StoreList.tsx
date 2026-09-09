import type { FindStoresResponse } from "../lib/types";

interface Props {
  data: FindStoresResponse | null;
  loading: boolean;
  error: string | null;
  originSource: "browser" | "fallback" | null;
}

export default function StoreList({ data, loading, error, originSource }: Props) {
  if (loading) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-sage border-t-forest-deep" />
        Finding nearby stores…
      </p>
    );
  }
  if (error) return <p className="mt-4 text-sm text-amber-text">{error}</p>;
  if (!data) return null;

  return (
    <div className="mt-4">
      <p className="text-xs text-muted">
        {data.count} store{data.count === 1 ? "" : "s"} within range, sorted by
        distance
        {originSource === "fallback" && " · using fallback location"}
      </p>
      {data.stores.length === 0 && (
        <p className="mt-2 text-sm text-muted">
          No stores nearby carry those ingredients. Try a wider radius.
        </p>
      )}
      <div className="mt-2 space-y-2">
        {data.stores.map((store) => (
          <div key={store.id} className="rounded-xl2 border border-forest-sage/40 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-ink">{store.name}</strong>
              {store.distance_km != null && (
                <span className="text-sm font-semibold text-forest-medium">
                  {store.distance_km} km
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{store.address}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {store.carries.length > 0 && (
                <span className="chip-have text-xs">
                  Carries: {store.carries.join(", ")}
                </span>
              )}
              {store.missing_here.length > 0 && (
                <span className="chip-missing text-xs">
                  Not here: {store.missing_here.join(", ")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
