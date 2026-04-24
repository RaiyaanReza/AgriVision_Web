import { Sparkles } from "lucide-react";
import { Card } from "../ui/Card";

export function SolutionNarrativeCard({ modelUsed, expectedModel, answer }) {
  const hasExpectedModel = modelUsed === expectedModel;

  return (
    <Card className="solution-card p-6 bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-900 text-emerald-50 border-emerald-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-xl font-bold">AI Treatment Solution</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasExpectedModel
              ? "bg-emerald-300/20 text-emerald-100"
              : "bg-amber-300/20 text-amber-100"
          }`}
        >
          Model: {modelUsed}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-emerald-50/95">
        {answer ||
          "No LLM narrative returned. Showing ranked retrieval snippets below."}
      </p>
    </Card>
  );
}
