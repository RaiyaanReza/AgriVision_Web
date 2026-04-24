import { AnimatePresence, motion } from "framer-motion";
import { DetectionResult } from "../prediction/DetectionResult";
import { DiseaseSolutionPanel } from "../prediction/DiseaseSolutionPanel";

const MotionDiv = motion.div;

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
        <MotionDiv
          key="results"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-6 mt-6"
        >
          <DetectionResult result={result} previewUrl={previewUrl} />
          <DiseaseSolutionPanel
            solutionData={solutionData}
            queryMeta={queryMeta}
            isPending={isSolutionPending}
            error={solutionError}
            expectedModel={expectedModel}
          />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
