import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Database, FileText, Search, Sparkles } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { useRAGQuery } from "../hooks/useRAGQuery";
import { DocumentUploadForm } from "../components/documents/DocumentUploadForm";
import { DocumentTable } from "../components/documents/DocumentTable";
import { DocumentCard } from "../components/documents/DocumentCard";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const MotionDiv = motion.div;

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
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-6xl mx-auto py-8 px-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Treatment Knowledge Base
          </h1>
          <p className="text-slate-600 mt-1">
            Manage documents for RAG (Retrieval-Augmented Generation)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Upload Document</Button>
      </div>

      <div className="mb-6 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-100/70 via-teal-50 to-emerald-100/50 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1 font-medium">
            <Database className="h-4 w-4 text-agri-secondary" />
            SQLite-backed storage enabled
          </span>
          <span className="inline-flex items-center gap-1">
            <Search className="h-4 w-4 text-agri-secondary" />
            Local semantic-style retrieval ready
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-agri-secondary" />
            LLM integration can be plugged in later via API keys
          </span>
        </div>
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

      <div className="bg-white p-4 rounded-2xl shadow mb-8 border border-emerald-100">
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

        <AnimatePresence mode="wait">
          {isRagPending && (
            <MotionDiv
              key="rag-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            >
              Searching knowledge documents...
            </MotionDiv>
          )}
        </AnimatePresence>

        {ragData?.llm?.enabled && ragData?.llm?.answer ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="text-xs font-semibold tracking-wide text-emerald-800">
              Gemini answer (grounded in your uploaded docs)
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {ragData.llm.answer}
            </div>
          </div>
        ) : ragData?.llm?.enabled === false && ragData?.llm?.error ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            LLM is not available right now. Retrieval results are shown below.
          </div>
        ) : null}

        {ragData?.results?.length > 0 ? (
          <div className="mt-4 space-y-3">
            {ragData.results.map((item, index) => (
              <MotionDiv
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="border border-emerald-100 rounded-xl p-3 bg-emerald-50/40"
              >
                <div className="font-medium">{item.title || "Untitled"}</div>
                <div className="text-sm text-gray-500">
                  {item.crop_type || "Unknown crop"}
                  {item.disease_name ? ` | ${item.disease_name}` : ""}
                </div>
                {item.snippet ? (
                  <p className="text-sm mt-1 text-gray-700">{item.snippet}</p>
                ) : null}
              </MotionDiv>
            ))}
          </div>
        ) : null}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="mt-4 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        filteredDocs.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id || doc._id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No knowledge documents yet
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Upload PDF/JSON/TXT documents and start asking treatment
              questions.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)}>
                Upload Document
              </Button>
            </div>
          </div>
        )
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
    </MotionDiv>
  );
}
