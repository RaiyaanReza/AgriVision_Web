import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { useRAGQuery } from "../hooks/useRAGQuery";
import { DocumentUploadForm } from "../components/documents/DocumentUploadForm";
import { DocumentTable } from "../components/documents/DocumentTable";
import { DocumentCard } from "../components/documents/DocumentCard";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function Treatments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("");
  const [ragCrop, setRagCrop] = useState("");

  const { data: docs, isPending } = useDocuments();
  const {
    mutate: runRagQuery,
    isPending: isRagPending,
    data: ragData,
  } = useRAGQuery();

  const filteredDocs = Array.isArray(docs)
    ? docs.filter(
        (d) =>
          d.title?.toLowerCase().includes(search.toLowerCase()) ||
          d.crop_type?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const handleAsk = () => {
    if (!question.trim()) {
      return;
    }

    runRagQuery({ question, cropType: ragCrop || undefined });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treatment Knowledge Base</h1>
          <p className="text-gray-500 mt-1">
            Manage documents for RAG (Retrieval-Augmented Generation)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Upload Document</Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4 flex w-full gap-2 md:mt-0 md:w-auto">
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "grid"
                ? "border-agri-primary bg-agri-primary text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "table"
                ? "border-agri-primary bg-agri-primary text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Ask Treatment Knowledge Base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring"
            placeholder="e.g., best treatment for rice leaf blast"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring"
            placeholder="Crop filter"
            value={ragCrop}
            onChange={(e) => setRagCrop(e.target.value)}
          />
          <Button
            onClick={handleAsk}
            disabled={isRagPending || !question.trim()}
          >
            {isRagPending ? "Asking..." : "Ask"}
          </Button>
        </div>

        {ragData?.results?.length > 0 && (
          <div className="mt-4 space-y-3">
            {ragData.results.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="border rounded p-3"
              >
                <div className="font-medium">{item.title || "Untitled"}</div>
                <div className="text-sm text-gray-500">
                  {item.crop_type || "Unknown crop"}
                  {item.disease_name ? ` | ${item.disease_name}` : ""}
                </div>
                {item.snippet ? (
                  <p className="text-sm mt-1 text-gray-700">{item.snippet}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {isPending ? (
        <div className="flex justify-center p-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id || doc._id} doc={doc} />
          ))}
        </div>
      ) : (
        <DocumentTable documents={filteredDocs} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Knowledge Base Document"
      >
        <DocumentUploadForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
