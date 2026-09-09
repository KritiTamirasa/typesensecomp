interface Props {
  percentage: number;
  size?: "sm" | "md";
}

function tone(pct: number): string {
  if (pct >= 80) return "bg-brand-gradient text-white";
  if (pct >= 50) return "bg-forest-sage/50 text-forest-deep";
  return "bg-mint text-muted";
}

export default function MatchBadge({ percentage, size = "md" }: Props) {
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${padding} ${tone(percentage)}`}
      title="Ingredient match — how much of this recipe you already have"
    >
      {percentage}% match
    </span>
  );
}
