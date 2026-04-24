import { Bot } from "lucide-react";
import { Card } from "../ui/Card";

export function SolutionEvidenceCard({ results, sources }) {
  if (!results?.length) {
    return null;
  }

  return (
    <Card className="solution-card p-5 border border-emerald-100 bg-white">
      <div className="flex items-center gap-2 text-slate-900 mb-3">
        <Bot className="h-4 w-4 text-agri-secondary" />
        <h4 className="font-semibold">Retrieved Evidence</h4>
      </div>
      <div className="space-y-3">
        {results.slice(0, 4).map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-xl border border-slate-200 p-3 bg-slate-50"
          >
            <p className="font-medium text-slate-900">
              {item.title || "Untitled"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {item.crop_type || "Unknown crop"}
              {item.disease_name ? ` | ${item.disease_name}` : ""}
              {typeof item.score === "number" ? ` | Score: ${item.score}` : ""}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {item.snippet || "No snippet"}
            </p>
          </div>
        ))}
      </div>
      {sources?.length ? (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-semibold text-slate-600">Sources</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.map((src, idx) => (
              <span
                key={`${src.document_id || src.document_name || idx}`}
                className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
              >
                {src.document_name || "Source"}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
