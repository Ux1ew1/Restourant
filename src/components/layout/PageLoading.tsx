type PageLoadingProps = {
  label?: string;
  variant?: "public" | "admin" | "auth";
};

/**
 * Общий скелетон для переходов между route segment'ами Next.js.
 */
export function PageLoading({ label = "Загрузка страницы", variant = "public" }: PageLoadingProps) {
  const compact = variant === "auth";
  const rows = compact ? 3 : 4;

  return (
    <div
      className={compact ? "w-full space-y-4" : "mx-auto w-full max-w-6xl space-y-6"}
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      <span className="sr-only">{label}</span>

      <div className="space-y-3">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-vanilla-200" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded bg-vanilla-200" />
      </div>

      <div className={variant === "admin" ? "grid gap-4 lg:grid-cols-[14rem_1fr]" : "space-y-4"}>
        {variant === "admin" ? (
          <div className="hidden h-80 animate-pulse rounded-2xl bg-vanilla-200 lg:block" />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="min-h-32 animate-pulse rounded-2xl border border-vanilla-200 bg-vanilla-100 p-4"
            >
              <div className="mb-4 h-5 w-2/3 rounded bg-vanilla-200" />
              <div className="space-y-2">
                <div className="h-3 rounded bg-vanilla-200" />
                <div className="h-3 w-5/6 rounded bg-vanilla-200" />
                <div className="h-3 w-1/2 rounded bg-vanilla-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
