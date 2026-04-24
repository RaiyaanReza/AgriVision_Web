import { useState } from "react";
import { motion } from "framer-motion";
import { useDocuments } from "../hooks/useDocuments";
import { useRAGQuery } from "../hooks/useRAGQuery";
import { KnowledgeStatusBanner } from "../components/treatments/KnowledgeStatusBanner";
import { RAGQuerySection } from "../components/treatments/RAGQuerySection";
import { TreatmentsHeader } from "../components/treatments/TreatmentsHeader";
import { DocumentToolbar } from "../components/treatments/DocumentToolbar";
import { DocumentCollectionSection } from "../components/treatments/DocumentCollectionSection";
import { UploadDocumentModal } from "../components/treatments/UploadDocumentModal";

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
      <TreatmentsHeader onOpenUpload={() => setIsModalOpen(true)} />

      <KnowledgeStatusBanner />

      <DocumentToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <RAGQuerySection
        question={question}
        onQuestionChange={setQuestion}
        crop={ragCrop}
        onCropChange={setRagCrop}
        isPending={isRagPending}
        ragData={ragData}
        onAsk={handleAsk}
      />

      <DocumentCollectionSection
        isPending={isPending}
        viewMode={viewMode}
        documents={filteredDocs}
        onOpenUpload={() => setIsModalOpen(true)}
      />

      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MotionDiv>
  );
}
