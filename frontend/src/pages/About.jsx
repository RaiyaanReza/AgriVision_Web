export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">About AgriVision</h1>
      <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          AgriVision is an AI-powered platform for detecting crop diseases and
          providing precise treatment suggestions based on real-world local
          knowledge.
        </p>
        <p>
          We use a custom YOLOv8 integration to power fast and accurate
          detection pipelines directly from the frontend interface with Python
          backend processing via RAG technology.
        </p>
      </div>
    </div>
  );
}
