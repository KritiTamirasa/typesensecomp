import { useState } from "react";

interface Props {
  ingredients: string[];
  onChange: (next: string[]) => void;
}

export default function IngredientChips({ ingredients, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim().toLowerCase();
    if (value && !ingredients.includes(value)) {
      onChange([...ingredients, value]);
    }
    setDraft("");
  }

  function remove(item: string) {
    onChange(ingredients.filter((i) => i !== item));
  }

  return (
    <div className="chips">
      {ingredients.map((item) => (
        <span key={item} className="chip">
          {item}
          <button
            type="button"
            className="chip-x"
            onClick={() => remove(item)}
            aria-label={`remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="chip-input"
        value={draft}
        placeholder="add ingredient…"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
