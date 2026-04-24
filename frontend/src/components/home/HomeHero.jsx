export function HomeHero() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 px-6 py-10 md:px-10 md:py-12 shadow-sm ring-1 ring-emerald-800/50">
      <p className="inline-flex items-center rounded-full border border-emerald-300/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
        Smart Crop Health Assistant
      </p>
      <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
        AgriVision AI Detection
      </h1>
      <p className="mt-4 max-w-3xl text-lg md:text-xl text-emerald-50/90">
        Upload an image of a crop leaf to detect diseases instantly and get
        localized treatment strategies.
      </p>
    </div>
  );
}
