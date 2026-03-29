/* https://react.dev/learn/sharing-state-between-components */

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  limit?: number;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  limit,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const rangeStart = limit ? (page - 1) * limit + 1 : null;
  const rangeEnd = limit && total ? Math.min(page * limit, total) : null;

  const pageNumbers = generatePageNumbers(page, totalPages);

  return (
    <nav className="flex flex-col items-center gap-3">
      {rangeStart && rangeEnd && total && (
        <p className="text-sm text-slate-600">
          Risultati{" "}
          <span className="font-medium text-slate-900">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          di <span className="font-medium text-slate-900">{total}</span>
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600
                     hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          ‹
        </button>

        {pageNumbers.map((num, idx) =>
          num === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(Number(num))}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                num === page
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {num}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600
                     hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          ›
        </button>
      </div>
    </nav>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    // ArrayLike accetta qualsiasi cosa simile ad un array, quindi per esempio un oggetto che ha la proprietà lenght
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const delta = 1;

  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  pages.push(1);
  if (range[0] > 2) pages.push("...");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
