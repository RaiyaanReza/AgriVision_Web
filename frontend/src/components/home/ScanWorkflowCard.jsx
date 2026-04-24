import { motion } from "framer-motion";
import { ChevronRight, Brain, Zap, CheckCircle2, Loader2 } from "lucide-react";

export function ScanWorkflowCard({ onSubmit, isPending, hasImage }) {
  const steps = [
    { label: "Specimen Capture", icon: CheckCircle2 },
    { label: "Neural Mapping", icon: Brain },
    { label: "Instant Report", icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              (idx === 0 && hasImage) || (idx === 1 && isPending) 
                ? "bg-green-500 text-white shadow-lg shadow-green-200" 
                : "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600"
            }`}>
              <step.icon size={18} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-black uppercase tracking-widest ${
                (idx === 0 && hasImage) || (idx === 1 && isPending)
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-600"
              }`}>
                {step.label}
              </p>
              <div className="h-1 w-full bg-gray-50 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: (idx === 0 && hasImage) || (idx === 1 && isPending) ? "100%" : "0%" }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <motion.button
          whileHover={hasImage && !isPending ? { scale: 1.02, y: -2 } : {}}
          whileTap={hasImage && !isPending ? { scale: 0.98 } : {}}
          onClick={onSubmit}
          disabled={!hasImage || isPending}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${
            hasImage && !isPending
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-100"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 shadow-none cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Specimen
            </>
          ) : (
            <>
              Initialize Scan
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
        <p className="text-[10px] text-center mt-4 font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          Secured by Enterprise AI
        </p>
      </div>
    </div>
  );
}

