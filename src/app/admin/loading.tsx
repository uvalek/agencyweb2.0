// Instant loading skeleton for the admin list. Next.js shows this the
// moment a navigation starts, so clicks feel responsive while the server
// re-validates auth and queries Supabase.
export default function AdminLoading() {
  return (
    <div className="px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-6xl animate-pulse">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="h-10 w-32 rounded bg-white/[0.06]" />
          <div className="flex gap-3">
            <div className="h-9 w-28 rounded-full bg-white/[0.06]" />
            <div className="h-9 w-20 rounded-full bg-white/[0.06]" />
          </div>
        </header>

        <div className="mb-10">
          <div className="h-9 w-72 rounded bg-white/[0.06]" />
          <div className="mt-3 h-5 w-64 rounded bg-white/[0.04]" />
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>

        <ul className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-24 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
