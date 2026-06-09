// Instant loading skeleton for a single trial-request detail view.
export default function RequestDetailLoading() {
  return (
    <div className="px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="mb-8 h-5 w-32 rounded bg-white/[0.06]" />

        <div className="mb-8">
          <div className="h-9 w-80 rounded bg-white/[0.06]" />
          <div className="mt-3 h-5 w-56 rounded bg-white/[0.04]" />
        </div>

        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
