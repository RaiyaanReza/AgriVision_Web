import { Card } from "../ui/Card";
import { BookOpen } from "lucide-react";

export const TreatmentSuggestion = ({ suggestions }) => {
  if (!suggestions) return null;

  return (
    <Card className="p-6 mt-6 bg-slate-50 border-t-4 border-agri-primary">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-agri-primary" size={24} />
        <h2 className="text-2xl font-bold">Treatment Overview (RAG)</h2>
      </div>

      <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
        {suggestions.text || suggestions}
      </div>

      {suggestions.sources && suggestions.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-2">Sources:</h4>
          <ul className="text-xs text-gray-500 list-disc list-inside">
            {suggestions.sources.map((src, i) => (
              <li key={i}>{src.document_name || src}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
