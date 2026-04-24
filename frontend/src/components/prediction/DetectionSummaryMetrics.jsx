import { Badge } from "../ui/Badge";
import { formatConfidence } from "../../utils/formatters";
import { ConfidenceBar } from "./ConfidenceBar";

export function DetectionSummaryMetrics({ cropResult, diseaseResult }) {
  const cropName = cropResult?.crop_name || cropResult?.crop || "Unknown";
  const diseaseName =
    diseaseResult?.disease_name || diseaseResult?.disease || "None detected";
  const severity =
    diseaseResult?.severity ||
    (typeof diseaseName === "string" &&
    diseaseName.toLowerCase().includes("healthy")
      ? "healthy"
      : "info");

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300">
          Crop Identified
        </h3>
        <p className="text-xl dark:text-slate-100">{cropName}</p>
        <div className="mt-1">
          <ConfidenceBar
            confidence={cropResult?.confidence}
            colorClass="bg-agri-primary"
          />
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {formatConfidence(cropResult?.confidence)} confidence
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300">
          Disease Status
        </h3>
        <div className="flex items-center gap-2 mt-1 mb-2">
          <p className="text-xl dark:text-slate-100">{diseaseName}</p>
          <Badge severity={severity}>{severity}</Badge>
        </div>

        {diseaseResult?.confidence !== undefined && (
          <div>
            <ConfidenceBar
              confidence={diseaseResult.confidence}
              colorClass="bg-rose-500"
            />
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {formatConfidence(diseaseResult.confidence)} confidence
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
