import { Card } from "../ui/Card";
import { formatConfidence } from "../../utils/formatters";

export function HistoryPredictionCard({ prediction }) {
  const disease = Array.isArray(prediction.disease_result)
    ? prediction.disease_result[0]
    : prediction.disease_result;
  const diseaseName = disease?.disease_name || disease?.disease || "Unknown";
  const severity =
    disease?.severity ||
    (typeof diseaseName === "string" &&
    diseaseName.toLowerCase().includes("healthy")
      ? "healthy"
      : "info");

  return (
    <Card className="p-4 border border-emerald-100 dark:border-slate-700 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg dark:text-slate-100">
            {prediction.crop_result?.crop_name ||
              prediction.crop_result?.crop ||
              "Unknown"}
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Confidence: {formatConfidence(prediction.crop_result?.confidence)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-700 dark:text-slate-300">
            {diseaseName}
          </p>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              severity === "healthy"
                ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
                : "border-rose-200 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300"
            }`}
          >
            {severity}
          </span>
        </div>
      </div>
    </Card>
  );
}
