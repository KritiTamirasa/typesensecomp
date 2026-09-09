import { CheckIcon } from "./icons";

// Only options backed by real recipe tags in the dataset (`vegetarian`,
// `vegan`, `gluten free`) so the filter never silently returns zero results.
const DIET_OPTIONS = [
  { label: "Vegetarian", tag: "vegetarian" },
  { label: "Vegan", tag: "vegan" },
  { label: "Gluten-Free", tag: "gluten free" },
];

interface Props {
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function DietaryFilter({ selected, onChange }: Props) {
  function toggle(tag: string) {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  }

  return (
    <div>
      <p className="section-eyebrow">Anything we should know?</p>
      <p className="mt-1 text-sm text-muted">
        Choose any dietary preferences or restrictions.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Dietary preferences">
        <button
          type="button"
          onClick={() => onChange([])}
          aria-pressed={selected.length === 0}
          className={selected.length === 0 ? "chip-filter-active" : "chip-filter"}
        >
          {selected.length === 0 && <CheckIcon />}
          No restrictions
        </button>
        {DIET_OPTIONS.map((opt) => {
          const active = selected.includes(opt.tag);
          return (
            <button
              key={opt.tag}
              type="button"
              onClick={() => toggle(opt.tag)}
              aria-pressed={active}
              className={active ? "chip-filter-active" : "chip-filter"}
            >
              {active && <CheckIcon />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
