import { motion } from "framer-motion";
import { Cpu, FlaskConical, Network } from "lucide-react";

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const chips = [
  { icon: Cpu, label: "YOLO + Agent Routing" },
  { icon: Network, label: "Live RAG API Retrieval" },
  { icon: FlaskConical, label: "Gemini Treatment Draft" },
];

export function InsightRibbon() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6 rounded-2xl border border-emerald-200/70 bg-linear-to-r from-emerald-100/70 via-teal-50 to-emerald-100/50 px-5 py-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-slate-700">
          After detection, AgriVision automatically calls the treatment API and
          generates a grounded solution with source references.
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <MotionSpan
                key={chip.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900"
              >
                <Icon className="h-3.5 w-3.5" />
                {chip.label}
              </MotionSpan>
            );
          })}
        </div>
      </div>
    </MotionDiv>
  );
}
