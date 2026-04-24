import { Button } from "../ui/Button";

export function TreatmentsHeader({ onOpenUpload }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Treatment Knowledge Base
        </h1>
        <p className="text-slate-600 mt-1 dark:text-slate-400">
          Manage documents for RAG (Retrieval-Augmented Generation)
        </p>
      </div>
      <Button onClick={onOpenUpload}>+ Upload Document</Button>
    </div>
  );
}
