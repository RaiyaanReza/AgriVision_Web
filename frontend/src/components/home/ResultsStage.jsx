import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, BrainCircuit, Activity } from "lucide-react";
import { DetectionResult } from "../prediction/DetectionResult";
import { DiseaseSolutionPanel } from "../prediction/DiseaseSolutionPanel";

export function ResultsStage({
  result,
  previewUrl,
  solutionData,
  queryMeta,
  isSolutionPending,
  solutionError,
  expectedModel,
}) {
  return (
    <AnimatePresence mode="wait">
      {result && (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-12"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Analysis Complete</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Specimen Report</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-500">Live AI Feed</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DetectionResult result={result} previewUrl={previewUrl} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Treatment Protocol</h3>
              </div>
              
              <DiseaseSolutionPanel
                solutionData={solutionData}
                queryMeta={queryMeta}
                isPending={isSolutionPending}
                error={solutionError}
                expectedModel={expectedModel}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

