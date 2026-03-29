type StarRatingProps = {
  rating: number | undefined;
  ratingsCount?: number;
  showValue?: boolean;
};

export function StarRating({ rating, ratingsCount, showValue = true }: StarRatingProps) {
  if (rating === null || rating === undefined) {
    return <span className="text-sm text-slate-400">Nessun voto</span>;
  }

    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {'★'.repeat(fullStars).split('').map((s, i) => (
          <span key={`f-${i}`} className="text-amber-400">{s}</span>
        ))}
        {hasHalf && <span className="text-amber-400">⯪</span>}
        {'★'.repeat(emptyStars).split('').map((s, i) => (
          <span key={`e-${i}`} className="text-slate-300">{s}</span>
        ))}
      </span>
      {showValue && (
        <span className="text-sm text-slate-500">{rating.toFixed(2)}</span>
      )}

      {ratingsCount !== undefined && (
        <span className="text-xs text-slate-400">
          ({ratingsCount.toLocaleString()})
        </span>
      )}
    </span>
  );
}
