import { Card } from "../ui/Card";

export function SolutionErrorState({ message }) {
  return (
    <Card className="p-6 border-rose-200 bg-rose-50/70">
      <p className="font-semibold text-rose-900">
        Could not generate solution.
      </p>
      <p className="text-sm text-rose-700 mt-1">
        {message || "RAG request failed. Please retry with another image."}
      </p>
    </Card>
  );
}
