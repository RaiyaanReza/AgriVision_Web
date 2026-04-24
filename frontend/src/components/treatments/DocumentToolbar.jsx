export function DocumentToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search documents..."
        className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="mt-4 flex w-full gap-2 md:mt-0 md:w-auto">
        <button
          className={`rounded-md border px-4 py-2 text-sm transition-colors ${
            viewMode === "grid"
              ? "border-agri-primary bg-agri-primary text-white"
              : "border-slate-300 bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          }`}
          onClick={() => onViewModeChange("grid")}
        >
          Grid
        </button>
        <button
          className={`rounded-md border px-4 py-2 text-sm transition-colors ${
            viewMode === "table"
              ? "border-agri-primary bg-agri-primary text-white"
              : "border-slate-300 bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          }`}
          onClick={() => onViewModeChange("table")}
        >
          Table
        </button>
      </div>
    </div>
  );
}
