import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { SolutionLoadingState } from "./SolutionLoadingState";
import { SolutionErrorState } from "./SolutionErrorState";
import { SolutionNarrativeCard } from "./SolutionNarrativeCard";
import { SolutionMetaCard } from "./SolutionMetaCard";
import { SolutionEvidenceCard } from "./SolutionEvidenceCard";

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
    return <SolutionLoadingState />;
  }

  if (error) {
    return <SolutionErrorState message={error.message} />;
  }

  if (!solutionData || !queryMeta) {
    return null;
  }

  const llm = solutionData?.llm || {};
  const modelUsed = llm?.model || "model-not-returned";
  const answer = llm?.answer;
  const results = solutionData?.results || [];
  const sources = solutionData?.sources || [];

  return (
    <MotionDiv
      ref={panelRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4"
    >
      <SolutionNarrativeCard
        modelUsed={modelUsed}
        expectedModel={expectedModel}
        answer={answer}
      />

      <SolutionMetaCard queryMeta={queryMeta} />

      <SolutionEvidenceCard results={results} sources={sources} />
    </MotionDiv>
  );
}
