import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatConfidence } from "../../utils/formatters";
import { BoundingBoxOverlay } from "./BoundingBoxOverlay";

export const DetectionResult = ({ result, previewUrl }) => {
  if (!result) return null;

  const { crop_result, disease_result } = result;
  const firstDisease = Array.isArray(disease_result)
    ? disease_result[0]
    : disease_result;

  const cropName = crop_result?.crop_name || crop_result?.crop || "Unknown";
  const diseaseName =
    firstDisease?.disease_name || firstDisease?.disease || "None detected";
  const severity =
    firstDisease?.severity ||
    (typeof diseaseName === "string" &&
    diseaseName.toLowerCase().includes("healthy")
      ? "healthy"
      : "info");
  const boxes = firstDisease?.boxes || [];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Detection Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Crop Identified
            </h3>
            <p className="text-xl">{cropName}</p>
            <div className="mt-1">
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-agri-primary"
                  style={{
                    width: `${Math.max(0, Math.min(100, (crop_result?.confidence || 0) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {formatConfidence(crop_result?.confidence)} confidence
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Disease Status
            </h3>
            <div className="flex items-center gap-2 mt-1 mb-2">
              <p className="text-xl">{diseaseName}</p>
              <Badge severity={severity}>{severity}</Badge>
            </div>

            {firstDisease?.confidence !== undefined && (
              <div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-rose-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, firstDisease.confidence * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {formatConfidence(firstDisease.confidence)} confidence
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {boxes.length > 0 ? (
            <BoundingBoxOverlay imageUrl={previewUrl} boxes={boxes} />
          ) : (
            <img
              src={previewUrl}
              alt="Analyzed Crop"
              className="w-full h-auto rounded-lg object-cover border"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
