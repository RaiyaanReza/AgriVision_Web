import { Card } from "../ui/Card";
import { DetectionSummaryMetrics } from "./DetectionSummaryMetrics";
import { DetectionPreviewPane } from "./DetectionPreviewPane";

export const DetectionResult = ({ result, previewUrl }) => {
  if (!result) return null;

  const { crop_result, disease_result } = result;
  const firstDisease = Array.isArray(disease_result)
    ? disease_result[0]
    : disease_result;
  const boxes = firstDisease?.boxes || [];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Detection Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetectionSummaryMetrics
          cropResult={crop_result}
          diseaseResult={firstDisease}
        />

        <div className="relative">
          <DetectionPreviewPane previewUrl={previewUrl} boxes={boxes} />
        </div>
      </div>
    </Card>
  );
};
