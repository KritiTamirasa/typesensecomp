import { useState } from "react";
import { PlusIcon } from "./icons";

interface Props {
  ingredients: string[];
  onChange: (next: string[]) => void;
}

const EMOJI_MAP: Record<string, string> = {
  spinach: "🥬",
  tomato: "🍅",
  egg: "🥚",
  paneer: "🧀",
  cheddar: "🧀",
  cheese: "🧀",
  onion: "🧅",
  garlic: "🧄",
  carrot: "🥕",
  chicken: "🍗",
  rice: "🍚",
  milk: "🥛",
  butter: "🧈",
  lemon: "🍋",
  potato: "🥔",
  pepper: "🌶️",
};

function emojiFor(name: string): string {
  const key = Object.keys(EMOJI_MAP).find((k) => name.includes(k));
  return key ? EMOJI_MAP[key] : "🥗";
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
    <div className="flex flex-wrap items-center gap-2">
      {ingredients.map((item) => (
        <span key={item} className="chip-ingredient animate-fade-up">
          <span aria-hidden="true">{emojiFor(item)}</span>
          {item}
          <button
            type="button"
            className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-forest-deep/60 transition-colors hover:bg-forest-deep/10 hover:text-forest-deep"
            onClick={() => remove(item)}
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1.5 rounded-full border border-dashed border-forest-medium/40 px-3 py-1.5">
        <PlusIcon className="h-3.5 w-3.5 text-forest-medium" />
        <input
          className="w-32 bg-transparent text-sm outline-none placeholder:text-muted"
          value={draft}
          placeholder="Add ingredient"
          aria-label="Add ingredient"
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
    </div>
  );
}
