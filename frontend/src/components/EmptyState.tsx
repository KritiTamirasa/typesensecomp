interface Props {
  onEditIngredients: () => void;
}

export default function EmptyState({ onEditIngredients }: Props) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="text-4xl" aria-hidden="true">
        🍽️
      </span>
      <h3 className="text-lg font-bold text-ink">No close matches yet</h3>
      <p className="max-w-sm text-sm text-muted">
        Try removing an ingredient filter or adding a few more pantry items.
      </p>
      <button type="button" onClick={onEditIngredients} className="btn-secondary mt-2">
        Edit ingredients
      </button>
    </div>
  );
}
