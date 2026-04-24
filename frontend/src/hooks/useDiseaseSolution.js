import { useCallback, useRef, useState } from "react";
import { useRAGQuery } from "./useRAGQuery";

const EXPECTED_MODEL = "gemini-3.1-flash-lite-preview";

const getDiseaseFromResult = (prediction) => {
  const diseaseResult = prediction?.disease_result;
  if (Array.isArray(diseaseResult)) {
    return diseaseResult[0] || null;
  }
  return diseaseResult || null;
};

export function useDiseaseSolution() {
  const [solutionData, setSolutionData] = useState(null);
  const [queryMeta, setQueryMeta] = useState(null);
  const lastSignatureRef = useRef("");

  const { mutateAsync, isPending, error } = useRAGQuery();

  const fetchSolution = useCallback(
    async (prediction) => {
      const crop = prediction?.crop_result?.crop_name || prediction?.crop_result?.crop || "Unknown crop";
      const diseaseInfo = getDiseaseFromResult(prediction);
      const disease =
        diseaseInfo?.disease_name || diseaseInfo?.disease || "Unknown disease";
      const cropConfidence = prediction?.crop_result?.confidence;
      const diseaseConfidence = diseaseInfo?.confidence;

      const signature = `${crop}::${disease}::${cropConfidence || 0}::${diseaseConfidence || 0}`;
      if (signature === lastSignatureRef.current) {
        return;
      }

      lastSignatureRef.current = signature;

      const question = [
        `Detected crop: ${crop}.`,
        `Detected disease: ${disease}.`,
        `Crop confidence: ${typeof cropConfidence === "number" ? cropConfidence.toFixed(3) : "N/A"}.`,
        `Disease confidence: ${typeof diseaseConfidence === "number" ? diseaseConfidence.toFixed(3) : "N/A"}.`,
        "Provide a practical farmer-friendly treatment plan with:",
        "1) immediate actions in the next 24 hours,",
        "2) treatment options and safe usage guidance,",
        "3) prevention steps for the next 7-14 days,",
        "4) warning signs that require expert field support.",
      ].join(" ");

      const payload = {
        question,
        cropType: crop,
        diseaseName: disease,
        llm: true,
      };

      setQueryMeta({
        endpoint: "/api/rag/query",
        method: "POST",
        question,
        crop,
        disease,
        requestedModel: EXPECTED_MODEL,
        generatedAt: new Date().toISOString(),
      });

      const response = await mutateAsync({
        question: payload.question,
        cropType: payload.cropType,
        diseaseName: payload.diseaseName,
        llm: payload.llm,
      });
      setSolutionData(response);
    },
    [mutateAsync],
  );

  const resetSolution = useCallback(() => {
    lastSignatureRef.current = "";
    setSolutionData(null);
    setQueryMeta(null);
  }, []);

  return {
    fetchSolution,
    resetSolution,
    solutionData,
    queryMeta,
    isPending,
    error,
    expectedModel: EXPECTED_MODEL,
  };
}
