import { SearchIcon } from "./icons";

export interface QuickFilterDef {
  id: string;
  label: string;
  active: boolean;
}

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  quickFilters: QuickFilterDef[];
  onToggleQuickFilter: (id: string) => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  quickFilters,
  onToggleQuickFilter,
}: Props) {
  return (
    <div>
      <label htmlFor="mood-search" className="section-eyebrow">
        What are you in the mood for?
      </label>
      <div className="relative mt-2">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest-medium" />
        <input
          id="mood-search"
          className="input-field pl-11 text-base shadow-soft"
          placeholder='Something spicy and quick…'
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {quickFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Quick filters">
          {quickFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onToggleQuickFilter(f.id)}
              aria-pressed={f.active}
              className={f.active ? "chip-filter-active" : "chip-filter"}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
