import { Card } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function SolutionLoadingState() {
  return (
    <Card className="p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-800/40 transition-colors">
      <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
        <LoadingSpinner size="sm" />
        <div>
          <p className="font-semibold">Generating treatment solution...</p>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80">
            Querying /api/rag/query with disease-specific context.
          </p>
        </div>
      </div>
    </Card>
  );
}
