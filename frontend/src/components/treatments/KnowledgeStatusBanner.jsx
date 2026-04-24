import { Database, Search, Sparkles } from "lucide-react";

export function KnowledgeStatusBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-100/70 via-teal-50 to-emerald-100/50 p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <span className="inline-flex items-center gap-1 font-medium">
          <Database className="h-4 w-4 text-agri-secondary" />
          SQLite-backed storage enabled
        </span>
        <span className="inline-flex items-center gap-1">
          <Search className="h-4 w-4 text-agri-secondary" />
          Local semantic-style retrieval ready
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-agri-secondary" />
          LLM integration can be plugged in later via API keys
        </span>
      </div>
    </div>
  );
}
