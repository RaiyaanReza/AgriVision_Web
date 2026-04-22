import { useAppStore } from "../store/useAppStore";
import { Card } from "../components/ui/Card";
import { formatConfidence } from "../utils/formatters";

export default function History() {
  const predictions = useAppStore((state) => state.predictions);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Scan History (Local Session)</h1>
      {predictions.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl">
          No predictions made yet in this session.
        </div>
      ) : (
        <div className="space-y-6">
          {predictions.map((p, i) => {
            const disease = Array.isArray(p.disease_result)
              ? p.disease_result[0]
              : p.disease_result;
            const diseaseName =
              disease?.disease_name || disease?.disease || "Unknown";
            const severity =
              disease?.severity ||
              (typeof diseaseName === "string" &&
              diseaseName.toLowerCase().includes("healthy")
                ? "healthy"
                : "info");

            return (
              <Card key={i} className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {p.crop_result?.crop_name ||
                        p.crop_result?.crop ||
                        "Unknown"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Confidence: {formatConfidence(p.crop_result?.confidence)}
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
          })}
        </div>
      )}
    </div>
  );
}
