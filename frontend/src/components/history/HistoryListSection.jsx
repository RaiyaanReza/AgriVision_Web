import { ClipboardList } from "lucide-react";
import { HistoryPredictionCard } from "./HistoryPredictionCard";

export function HistoryListSection({ predictions }) {
  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-emerald-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400 transition-colors">
        <ClipboardList className="h-12 w-12 mb-4 text-emerald-300 dark:text-slate-600" />
        <p className="text-lg font-medium">No predictions yet</p>
        <p className="mt-1 text-sm max-w-xs text-center">
          Upload a crop image on the Home page to start building your scan
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {predictions.map((prediction, index) => (
        <HistoryPredictionCard key={index} prediction={prediction} />
      ))}
    </div>
  );
}
