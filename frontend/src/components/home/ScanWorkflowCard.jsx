import { ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function ScanWorkflowCard({ onSubmit, isPending, hasImage }) {
  return (
    <aside className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-700 transition-colors">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Scan Workflow
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary dark:text-agri-accent" />
          Upload a clear leaf image.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary dark:text-agri-accent" />
          Run crop and disease inference.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary dark:text-agri-accent" />
          Auto-fetch treatment solution via Gemini-backed RAG API.
        </li>
      </ul>

      <div className="mt-6">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!hasImage || isPending}
          className="w-full justify-center"
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Analyzing Crop...
            </>
          ) : (
            "Start Scanning"
          )}
        </Button>
      </div>
    </aside>
  );
}
