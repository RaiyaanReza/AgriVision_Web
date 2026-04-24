import { Card } from "../ui/Card";

export function SolutionErrorState({ message }) {
  return (
    <Card className="p-6 border-rose-200 bg-rose-50/70 dark:bg-rose-900/20 dark:border-rose-800 transition-colors">
      <p className="font-semibold text-rose-900 dark:text-rose-200">
        Could not generate solution.
      </p>
      <p className="text-sm text-rose-700 mt-1 dark:text-rose-300">
        {message || "RAG request failed. Please retry with another image."}
      </p>
    </Card>
  );
}
