import { ShieldCheck, Sparkles, Stethoscope, Timer } from "lucide-react";

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

export function FeatureHighlights() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {featureCards.map((feature) => {
        const FeatureIcon = feature.icon;
        return (
          <article
            key={feature.title}
            className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
          >
            <FeatureIcon className="h-5 w-5 text-agri-secondary" />
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
  );
}
