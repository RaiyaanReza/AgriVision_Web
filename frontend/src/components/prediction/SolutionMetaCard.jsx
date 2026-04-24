import { FileSearch } from "lucide-react";
import { Card } from "../ui/Card";

export function SolutionMetaCard({ queryMeta }) {
  return (
    <Card className="solution-card p-5 border border-emerald-100 bg-white dark:bg-slate-800/60 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
        <FileSearch className="h-4 w-4 text-agri-secondary dark:text-agri-accent" />
        <h4 className="font-semibold">How This Was Generated</h4>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
        <p>
          <span className="font-semibold">API:</span> {queryMeta.method}{" "}
          {queryMeta.endpoint}
        </p>
        <p>
          <span className="font-semibold">Crop:</span> {queryMeta.crop}
        </p>
        <p>
          <span className="font-semibold">Disease:</span> {queryMeta.disease}
        </p>
        <p>
          <span className="font-semibold">Prompt:</span> {queryMeta.question}
        </p>
        <p>
          <span className="font-semibold">Target model:</span>{" "}
          {queryMeta.requestedModel}
        </p>
      </div>
    </Card>
  );
}
