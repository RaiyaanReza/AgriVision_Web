import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  Loader2,
  Microscope,
  RefreshCcw,
  Upload,
} from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (!selected) {
      return;
    }

    setFile(selected);
    setPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }
      return URL.createObjectURL(selected);
    });
    setResult(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: 1,
  });

  const analyzeImage = async () => {
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setResult(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "An error occurred while connecting to the server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const hasResult = Boolean(result?.success);
  const hasDisease = Boolean(result?.disease_result?.[0]);
  const isHealthy = Boolean(
    result?.disease_result?.[0]?.disease?.toLowerCase().includes("healthy"),
  );
  const cropName = result?.crop_result?.crop || "Unknown";
  const cropConfidence = result?.crop_result?.confidence
    ? (result.crop_result.confidence * 100).toFixed(1)
    : "0.0";
  const diseaseName = result?.disease_result?.[0]?.disease
    ?.replace(/__/g, " | ")
    ?.replace(/_/g, " ");
  const diseaseConfidence = result?.disease_result?.[0]?.confidence
    ? (result.disease_result[0].confidence * 100).toFixed(0)
    : "0";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5,_#f8fafc_42%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-600">
                AgriVision Prototype
              </p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Crop Disease Analyzer
              </h1>
            </div>
          </div>

          {(preview || result || error) && (
            <button
              type="button"
              onClick={resetAnalysis}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <RefreshCcw className="h-4 w-4" />
              New Scan
            </button>
          )}
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Image Input
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed p-6 text-center transition-all ${
                    isDragActive
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-slate-50/80 hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  <input {...getInputProps()} />

                  {preview ? (
                    <div className="relative flex w-full items-center justify-center">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-[340px] w-full rounded-3xl object-contain shadow-xl"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Upload className="h-9 w-9" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        Drop a leaf image here
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                        Upload a test image from the dataset to run the backend
                        workflow. Supported formats: JPG, PNG, WEBP.
                      </p>
                      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["Rice", "Potato", "Corn", "Brassica"].map((crop) => (
                          <span
                            key={crop}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        Scan Control
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {file
                          ? file.name
                          : "Upload an image to enable scanning"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={analyzeImage}
                      disabled={!file || loading}
                      className={`inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-black text-white transition-all ${
                        !file || loading
                          ? "cursor-not-allowed bg-slate-300 text-slate-500"
                          : "bg-emerald-600 shadow-lg shadow-emerald-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Leaf className="h-5 w-5" />
                      )}
                      {loading ? "Scanning..." : "Start Scanning"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Backend Result
              </p>
            </div>

            <div className="flex min-h-[520px] flex-col p-6">
              {!hasResult && !error && !loading && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <Microscope className="h-12 w-12" />
                  </div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    Waiting for upload
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    The frontend will call the FastAPI backend and show the
                    detected crop and disease here.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="h-24 w-24 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="h-10 w-10 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    Multi-model workflow running
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Crop identification, routing, and disease detection are in
                    progress.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-red-900">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <p className="text-lg font-black">Backend Error</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
                </div>
              )}

              {hasResult && (
                <div className="flex flex-1 flex-col gap-5">
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-blue-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Node 01: Identification
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold uppercase text-blue-400">
                          Detected Crop
                        </p>
                        <p className="mt-1 text-4xl font-black tracking-tight text-blue-950">
                          {cropName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-blue-600">
                          {cropConfidence}%
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">
                          Confidence
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border p-5 ${isHealthy ? "border-emerald-100 bg-emerald-50" : "border-orange-100 bg-orange-50"}`}
                  >
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Node 02: Pathology
                    </div>

                    {hasDisease ? (
                      <>
                        <p
                          className={`text-3xl font-black tracking-tight ${isHealthy ? "text-emerald-900" : "text-orange-900"}`}
                        >
                          {diseaseName}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-3 w-3 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-orange-500"}`}
                            />
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                              Model: {cropName}_v8_best.pt
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-4 py-2 text-xs font-black ${isHealthy ? "bg-emerald-600 text-white" : "bg-orange-600 text-white"}`}
                          >
                            {diseaseConfidence}% match
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
                        No disease result returned by backend.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={resetAnalysis}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-black"
                  >
                    New Analysis
                  </button>
                </div>
              )}

              {!hasResult && !error && !loading && (
                <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                  <p className="font-black uppercase tracking-[0.25em] text-slate-400">
                    Connection Check
                  </p>
                  <p className="mt-2">
                    Backend endpoint expected:{" "}
                    <span className="font-bold text-slate-700">
                      http://127.0.0.1:8000/api/predict
                    </span>
                    . Load a sample image and run the diagnostic to verify the
                    full chain.
                  </p>
                </div>
              )}

              {result && !result.success && !error && (
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-900">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                    <p className="text-lg font-black">Workflow terminated</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-amber-800">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
