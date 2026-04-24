import { HistoryPredictionCard } from "./HistoryPredictionCard";

export function HistoryListSection({ predictions }) {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 bg-white rounded-xl">
        No predictions made yet in this session.
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
