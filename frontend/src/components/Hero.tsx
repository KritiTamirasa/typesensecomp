import { ArrowRightIcon, CameraIcon } from "./icons";

const PREVIEW_CHIPS = [
  { emoji: "🥬", label: "Spinach" },
  { emoji: "🍅", label: "Tomato" },
  { emoji: "🥚", label: "Eggs" },
  { emoji: "🧀", label: "Paneer" },
];

interface Props {
  onScanClick: () => void;
  onManualClick: () => void;
}

export default function Hero({ onScanClick, onManualClick }: Props) {
  return (
    <section className="relative overflow-hidden rounded-xl3 bg-brand-gradient px-6 py-12 text-white shadow-card sm:px-10 sm:py-16 animate-fade-up">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-forest-fresh/20 blur-3xl"
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
            Fridge → Recipes → Groceries
          </span>

          <h1 className="mt-4 text-hero font-extrabold tracking-tight">
            Turn your fridge into dinner.
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/85 sm:text-base">
            Snap your fridge or pantry, tell us what you&rsquo;re in the mood
            for, and NutriLens finds recipes you can make with what you
            already have.
          </p>
          <p className="mt-1 text-sm font-medium text-forest-sage">
            Your fridge is the search query.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={onScanClick} className="btn-primary bg-white text-forest-deep shadow-none hover:shadow-none focus-visible:outline-white">
              <CameraIcon className="h-4 w-4" />
              Scan my fridge
            </button>
            <button
              type="button"
              onClick={onManualClick}
              className="btn-secondary border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/20 focus-visible:outline-white"
            >
              Tell us what I have
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="glass-panel relative mx-auto max-w-xs border-white/25 bg-white/10 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-white/70">
              <span>fridge_scan.jpg</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5">
                {PREVIEW_CHIPS.length} ingredients detected
              </span>
            </div>
            <div className="mt-4 h-32 rounded-xl2 bg-gradient-to-br from-forest-sage/40 to-white/10" />
            <div className="mt-4 flex flex-wrap gap-2">
              {PREVIEW_CHIPS.map((chip, i) => (
                <span
                  key={chip.label}
                  className={`chip-base bg-white/90 text-forest-deep shadow-soft ${
                    i % 2 === 0 ? "animate-float" : "animate-float-delayed"
                  }`}
                >
                  <span>{chip.emoji}</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
