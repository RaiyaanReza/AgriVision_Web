const aboutPoints = [
  {
    title: "Detection Engine",
    description:
      "Custom YOLO26-cls pipeline detects crop and disease classes from uploaded leaf images.",
  },
  {
    title: "Agentic Routing",
    description:
      "LangGraph workflow validates crop confidence and routes to crop-specific disease models.",
  },
  {
    title: "Knowledge + RAG",
    description:
      "Document retrieval with optional Gemini answer generation provides context-aware treatment support.",
  },
];

export function AboutContent() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {aboutPoints.map((point) => (
        <article
          key={point.title}
          className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {point.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {point.description}
          </p>
        </article>
      ))}
    </div>
  );
}
