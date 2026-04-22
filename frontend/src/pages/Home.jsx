import { useEffect, useState } from "react";
import { usePrediction } from "../hooks/usePrediction";
import { ImageUploadZone } from "../components/prediction/ImageUploadZone";
import { DetectionResult } from "../components/prediction/DetectionResult";
import { TreatmentSuggestion } from "../components/prediction/TreatmentSuggestion";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Button } from "../components/ui/Button";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { mutate: predict, isPending, error, data: result } = usePrediction();

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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          AgriVision AI Detection
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Upload an image of a crop leaf to detect diseases instantly and get
          localized treatment strategies.
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl mb-8">
        <ImageUploadZone
          onUpload={handleUpload}
          onClear={handleClear}
          previewUrl={previewUrl}
          isLoading={isPending}
        />

        <div className="mt-6 flex flex-col items-center">
          <Button
            size="lg"
            onClick={submitPrediction}
            disabled={!selectedImage || isPending}
            className="w-full md:w-auto px-12"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Analyzing Crop...
              </>
            ) : (
              "Start Scanning"
            )}
          </Button>

          {error && (
            <p className="text-red-500 mt-4 text-sm font-medium">
              {error.message || "Error occurred."}
            </p>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <DetectionResult result={result} previewUrl={previewUrl} />
          {result.treatment_suggestions && (
            <TreatmentSuggestion suggestions={result.treatment_suggestions} />
          )}
        </div>
      )}
    </div>
  );
}
