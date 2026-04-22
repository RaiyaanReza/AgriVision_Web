import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Timer,
} from "lucide-react";
import { usePrediction } from "../hooks/usePrediction";
import { ImageUploadZone } from "../components/prediction/ImageUploadZone";
import { DetectionResult } from "../components/prediction/DetectionResult";
import { TreatmentSuggestion } from "../components/prediction/TreatmentSuggestion";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Button } from "../components/ui/Button";

const featureCards = [
  {
    title: "Fast AI Diagnosis",
    description:
      "Get crop disease insights in moments so you can act before issues spread.",
    icon: Sparkles,
  },
  {
    title: "Actionable Treatments",
    description:
      "See practical treatment recommendations tailored to the detected condition.",
    icon: Stethoscope,
  },
  {
    title: "Confident Decisions",
    description:
      "Visual detection results and confidence scores help reduce uncertainty.",
    icon: ShieldCheck,
  },
  {
    title: "Low-Latency Workflow",
    description: "Optimized scanning flow with smooth visual transitions.",
    icon: Timer,
  },
];

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
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 px-6 py-10 md:px-10 md:py-12 shadow-sm ring-1 ring-emerald-800/50">
        <p className="inline-flex items-center rounded-full border border-emerald-300/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
          Smart Crop Health Assistant
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          AgriVision AI Detection
        </h1>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-emerald-50/90">
          Upload an image of a crop leaf to detect diseases instantly and get
          localized treatment strategies.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature) => {
          const FeatureToggleIcon = feature.icon;
          return (
            <article
              key={feature.title}
              className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <FeatureToggleIcon className="h-5 w-5 text-agri-secondary" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 bg-white p-6 md:p-10 rounded-3xl shadow-xl mb-8 ring-1 ring-emerald-100/70">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          <ImageUploadZone
            onUpload={handleUpload}
            onClear={handleClear}
            previewUrl={previewUrl}
            isLoading={isPending}
          />

          <aside className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Scan Workflow
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary" />
                Upload a clear leaf image.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary" />
                Run crop and disease inference.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 text-agri-secondary" />
                Treatment knowledge suggestions will be integrated next.
              </li>
            </ul>

            <div className="mt-6">
              <div className="w-full">
                <Button
                  size="lg"
                  onClick={submitPrediction}
                  disabled={!selectedImage || isPending}
                  className="w-full justify-center"
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" /> Analyzing
                      Crop...
                    </>
                  ) : (
                    "Start Scanning"
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-4 flex flex-col items-center">
          {error && (
            <p className="text-red-500 mt-4 text-sm font-medium animate-pulse">
              {error.message || "Error occurred."}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-100/70 via-teal-50 to-emerald-100/50 px-5 py-4 text-sm text-slate-700">
        Treatment knowledge suggestions are being integrated with the backend
        document/RAG pipeline and will appear here after API keys are
        configured.
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6 mt-6"
          >
            <DetectionResult result={result} previewUrl={previewUrl} />
            {result.treatment_suggestions ? (
              <TreatmentSuggestion suggestions={result.treatment_suggestions} />
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-white p-5 text-sm text-slate-600">
                AI-generated treatment suggestions will be shown in this section
                once the external LLM provider is connected.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
