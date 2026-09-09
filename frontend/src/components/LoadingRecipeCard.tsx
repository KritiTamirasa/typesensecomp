export default function LoadingRecipeCard() {
  return (
    <div className="card-surface animate-pulse p-4" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 rounded-full bg-forest-sage/30" />
        <div className="h-4 w-10 rounded bg-mint" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-forest-sage/30" />
      <div className="mt-2 h-3 w-1/3 rounded bg-mint" />
      <div className="mt-3 h-3 w-full rounded bg-mint" />
      <div className="mt-1 h-3 w-5/6 rounded bg-mint" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-mint" />
        <div className="h-6 w-20 rounded-full bg-mint" />
      </div>
    </div>
  );
}
