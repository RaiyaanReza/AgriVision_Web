import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Bot, FileSearch, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const MotionDiv = motion.div;

export function DiseaseSolutionPanel({
  solutionData,
  queryMeta,
  isPending,
  error,
  expectedModel,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current || isPending) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".solution-card",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
      );
    }, panelRef);

    return () => ctx.revert();
  }, [solutionData, isPending]);

  if (isPending) {
    return (
      <Card className="p-6 border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
        <div className="flex items-center gap-3 text-emerald-900">
          <LoadingSpinner size="sm" />
          <div>
            <p className="font-semibold">Generating treatment solution...</p>
            <p className="text-sm text-emerald-800/80">
              Querying /api/rag/query with disease-specific context.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-rose-200 bg-rose-50/70">
        <p className="font-semibold text-rose-900">
          Could not generate solution.
        </p>
        <p className="text-sm text-rose-700 mt-1">
          {error.message ||
            "RAG request failed. Please retry with another image."}
        </p>
      </Card>
    );
  }

  if (!solutionData || !queryMeta) {
    return null;
  }

  const llm = solutionData?.llm || {};
  const modelUsed = llm?.model || "model-not-returned";
  const answer = llm?.answer;
  const results = solutionData?.results || [];
  const sources = solutionData?.sources || [];

  const hasExpectedModel = modelUsed === expectedModel;

  return (
    <MotionDiv
      ref={panelRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4"
    >
      <Card className="solution-card p-6 bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-900 text-emerald-50 border-emerald-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-xl font-bold">AI Treatment Solution</h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              hasExpectedModel
                ? "bg-emerald-300/20 text-emerald-100"
                : "bg-amber-300/20 text-amber-100"
            }`}
          >
            Model: {modelUsed}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-emerald-50/95">
          {answer ||
            "No LLM narrative returned. Showing ranked retrieval snippets below."}
        </p>
      </Card>

      <Card className="solution-card p-5 border border-emerald-100 bg-white">
        <div className="flex items-center gap-2 text-slate-900">
          <FileSearch className="h-4 w-4 text-agri-secondary" />
          <h4 className="font-semibold">How This Was Generated</h4>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">API:</span> {queryMeta.method}{" "}
            {queryMeta.endpoint}
          </p>
          <p>
            <span className="font-semibold">Crop:</span> {queryMeta.crop}
          </p>
          <p>
            <span className="font-semibold">Disease:</span> {queryMeta.disease}
          </p>
          <p>
            <span className="font-semibold">Prompt:</span> {queryMeta.question}
          </p>
          <p>
            <span className="font-semibold">Target model:</span>{" "}
            {queryMeta.requestedModel}
          </p>
        </div>
      </Card>

      {results.length > 0 ? (
        <Card className="solution-card p-5 border border-emerald-100 bg-white">
          <div className="flex items-center gap-2 text-slate-900 mb-3">
            <Bot className="h-4 w-4 text-agri-secondary" />
            <h4 className="font-semibold">Retrieved Evidence</h4>
          </div>
          <div className="space-y-3">
            {results.slice(0, 4).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-xl border border-slate-200 p-3 bg-slate-50"
              >
                <p className="font-medium text-slate-900">
                  {item.title || "Untitled"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.crop_type || "Unknown crop"}
                  {item.disease_name ? ` | ${item.disease_name}` : ""}
                  {typeof item.score === "number"
                    ? ` | Score: ${item.score}`
                    : ""}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {item.snippet || "No snippet"}
                </p>
              </div>
            ))}
          </div>
          {sources.length > 0 ? (
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-600">Sources</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sources.map((src, idx) => (
                  <span
                    key={`${src.document_id || src.document_name || idx}`}
                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
                  >
                    {src.document_name || "Source"}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </MotionDiv>
  );
}
