import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";

const MotionDiv = motion.div;

export function RAGQuerySection({
  question,
  onQuestionChange,
  crop,
  onCropChange,
  isPending,
  ragData,
  onAsk,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-8 border border-emerald-100 dark:bg-slate-800/60 dark:border-slate-700 transition-colors">
      <h2 className="text-lg font-semibold mb-3 dark:text-slate-50">
        Ask Treatment Knowledge Base
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
          placeholder="e.g., best treatment for rice leaf blast"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
        />
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
          placeholder="Crop filter"
          value={crop}
          onChange={(e) => onCropChange(e.target.value)}
        />
        <Button onClick={onAsk} disabled={isPending || !question.trim()}>
          {isPending ? "Asking..." : "Ask"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isPending && (
          <MotionDiv
            key="rag-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 transition-colors"
          >
            Searching knowledge documents...
          </MotionDiv>
        )}
      </AnimatePresence>

      {ragData?.llm?.enabled && ragData?.llm?.answer ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-700 transition-colors">
          <div className="text-xs font-semibold tracking-wide text-emerald-800 dark:text-emerald-300">
            Gemini answer (grounded in your uploaded docs)
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed dark:text-slate-300">
            {ragData.llm.answer}
          </div>
        </div>
      ) : ragData?.llm?.enabled === false && ragData?.llm?.error ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300 transition-colors">
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
              className="border border-emerald-100 rounded-xl p-3 bg-emerald-50/40 dark:bg-slate-900/40 dark:border-slate-700 transition-colors"
            >
              <div className="font-medium dark:text-slate-100">
                {item.title || "Untitled"}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {item.crop_type || "Unknown crop"}
                {item.disease_name ? ` | ${item.disease_name}` : ""}
              </div>
              {item.snippet ? (
                <p className="text-sm mt-1 text-gray-700 dark:text-slate-300">
                  {item.snippet}
                </p>
              ) : null}
            </MotionDiv>
          ))}
        </div>
      ) : null}
    </div>
  );
}
