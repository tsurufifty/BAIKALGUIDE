export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
      <div className="mb-12 h-10 w-48 animate-pulse rounded bg-foreground/10" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-foreground/5" />
        ))}
      </div>
    </div>
  );
}
