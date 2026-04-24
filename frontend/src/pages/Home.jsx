import { useEffect, useState } from "react";
import { usePrediction } from "../hooks/usePrediction";
import { useDiseaseSolution } from "../hooks/useDiseaseSolution";
import { HomeHero } from "../components/home/HomeHero";
import { FeatureHighlights } from "../components/home/FeatureHighlights";
import { InsightRibbon } from "../components/home/InsightRibbon";
import { ScanExperienceSection } from "../components/home/ScanExperienceSection";
import { ResultsStage } from "../components/home/ResultsStage";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { mutate: predict, isPending, error, data: result } = usePrediction();
  const {
    fetchSolution,
    resetSolution,
    solutionData,
    queryMeta,
    isPending: isSolutionPending,
    error: solutionError,
    expectedModel,
  } = useDiseaseSolution();

  const handleUpload = (file) => {
    setSelectedImage(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleClear = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    resetSolution();
  };

  const submitPrediction = () => {
    if (selectedImage) predict(selectedImage);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!result?.success) {
      return;
    }

    fetchSolution(result);
  }, [result, fetchSolution]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <HomeHero />
      <FeatureHighlights />
      <ScanExperienceSection
        onUpload={handleUpload}
        onClear={handleClear}
        previewUrl={previewUrl}
        isPending={isPending}
        onSubmit={submitPrediction}
        hasImage={Boolean(selectedImage)}
        error={error}
      />
      <InsightRibbon />
      <ResultsStage
        result={result}
        previewUrl={previewUrl}
        solutionData={solutionData}
        queryMeta={queryMeta}
        isSolutionPending={isSolutionPending}
        solutionError={solutionError}
        expectedModel={expectedModel}
      />
    </div>
  );
}
