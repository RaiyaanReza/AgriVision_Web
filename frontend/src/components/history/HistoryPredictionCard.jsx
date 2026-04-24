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
    <Card className="p-4 border border-emerald-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg">
            {prediction.crop_result?.crop_name ||
              prediction.crop_result?.crop ||
              "Unknown"}
          </h3>
          <span className="text-sm text-gray-500">
            Confidence: {formatConfidence(prediction.crop_result?.confidence)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-700">{diseaseName}</p>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              severity === "healthy"
                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                : "border-rose-200 bg-rose-100 text-rose-700"
            }`}
          >
            {severity}
          </span>
        </div>
      </div>
    </Card>
  );
}
