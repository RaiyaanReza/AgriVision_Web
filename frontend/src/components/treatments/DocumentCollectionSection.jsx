import { FileText } from "lucide-react";
import { DocumentCard } from "../documents/DocumentCard";
import { DocumentTable } from "../documents/DocumentTable";
import { Button } from "../ui/Button";

function LoadingSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:bg-slate-800/40 dark:border-slate-700 transition-colors"
        >
          <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700" />
            <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700" />
          </div>
          <div className="mt-4 h-3 w-1/2 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function EmptyDocumentState({ onOpenUpload }) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-300 bg-white p-10 text-center dark:bg-slate-800/40 dark:border-slate-700 transition-colors">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
        No knowledge documents yet
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Upload PDF/JSON/TXT documents and start asking treatment questions.
      </p>
      <div className="mt-6">
        <Button onClick={onOpenUpload}>Upload Document</Button>
      </div>
    </div>
  );
}

export function DocumentCollectionSection({
  isPending,
  viewMode,
  documents,
  onOpenUpload,
}) {
  if (isPending) {
    return <LoadingSkeletonGrid />;
  }

  if (viewMode === "table") {
    return <DocumentTable documents={documents} />;
  }

  if (!documents.length) {
    return <EmptyDocumentState onOpenUpload={onOpenUpload} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id || doc._id} doc={doc} />
      ))}
    </div>
  );
}
