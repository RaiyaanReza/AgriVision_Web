import { ShieldCheck, Sparkles, Stethoscope, Timer } from "lucide-react";

const featureCards = [
  {
    title: "Fast AI Diagnosis",
    description:
      "Get crop disease insights in moments so you can act before issues spread.",
    icon: Sparkles,
    iconBg:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    title: "Actionable Treatments",
    description:
      "See practical treatment recommendations tailored to the detected condition.",
    icon: Stethoscope,
    iconBg: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
  {
    title: "Confident Decisions",
    description:
      "Visual detection results and confidence scores help reduce uncertainty.",
    icon: ShieldCheck,
    iconBg:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    title: "Low-Latency Workflow",
    description: "Optimized scanning flow with smooth visual transitions.",
    icon: Timer,
    iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

export function FeatureHighlights() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {featureCards.map((feature) => {
        const FeatureIcon = feature.icon;
        return (
          <article
            key={feature.title}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:bg-slate-800/60 dark:border-slate-700 transition-colors"
          >
            <div
              className={`inline-flex items-center justify-center rounded-xl p-2.5 ${feature.iconBg}`}
            >
              <FeatureIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              {feature.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
