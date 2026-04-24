import { useEffect, useState } from "react";
import { usePrediction } from "../hooks/usePrediction";
import { useDiseaseSolution } from "../hooks/useDiseaseSolution";
import { HomeHero } from "../components/home/HomeHero";
import { FeatureHighlights } from "../components/home/FeatureHighlights";
import { InsightRibbon } from "../components/home/InsightRibbon";
import { ScanExperienceSection } from "../components/home/ScanExperienceSection";
import { ResultsStage } from "../components/home/ResultsStage";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-white dark:bg-[#050505] overflow-x-hidden selection:bg-green-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      <HomeHero />

      <main className="relative z-10">
        <FeatureHighlights />
        
        {/* Core Experience Section */}
        <section id="diagnosis" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-4"
                >
                  <div className="h-[2px] w-8 bg-current"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Disease Intelligence</span>
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
                  Ready to start <br />your diagnosis?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                  Our advanced neural networks analyze leaf geometry and spectral data to identify pathogens with surgical precision.
                </p>
              </div>
            </div>
            
            <ScanExperienceSection
              onUpload={handleUpload}
              onClear={handleClear}
              previewUrl={previewUrl}
              isPending={isPending}
              onSubmit={submitPrediction}
              hasImage={Boolean(selectedImage)}
              error={error}
            />
          </div>
        </section>

        {/* Results Section - Conditional with Smooth Transition */}
        <AnimatePresence>
          {result && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="py-32 bg-gray-50/50 dark:bg-gray-900/20"
            >
              <div className="max-w-7xl mx-auto px-6 md:px-8">
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
            </motion.section>
          )}
        </AnimatePresence>

        <InsightRibbon />
      </main>

      {/* Modern Professional Footer */}
      <footer className="pt-32 pb-12 bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <h3 className="text-xl font-black mb-6 tracking-tighter">AgriVision Pro</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm leading-relaxed">
                Empowering the next generation of precision agriculture through advanced computer vision and agentic AI systems.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">System</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-500 transition-colors">YOLO Routing</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Neural Mapping</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Global Impact</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-50 dark:border-gray-900">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-700">
              © 2026 AgriVision Pro // All Rights Reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


