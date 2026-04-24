export function HistoryHero() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 px-6 py-10 md:px-10 md:py-12 text-white shadow-sm ring-1 ring-emerald-800/50">
      <p className="inline-flex items-center rounded-full border border-emerald-300/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
        Local Session Memory
      </p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Scan History
      </h1>
      <p className="mt-4 max-w-3xl text-base md:text-lg text-emerald-50/95">
        Recent crop analysis outcomes from this browser session.
      </p>
    </div>
  );
}
