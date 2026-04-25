import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HistoryIcon,
  Calendar,
  AlertCircle,
  ChevronRight,
  Sprout,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function StatCard({ label, value, icon, accent }) {
  const IconComp = icon;
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#161b22] border border-gray-800/60">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}
      >
        <IconComp className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/predictions/history?limit=50`,
        );
        if (!cancelled) {
          setPredictions(res.data.data || []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Failed to load prediction history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = predictions.filter((p) => {
    if (filter === "disease") return p.is_disease;
    if (filter === "healthy") return !p.is_disease;
    return true;
  });

  const stats = {
    total: predictions.length,
    diseases: predictions.filter((p) => p.is_disease).length,
    healthy: predictions.filter((p) => !p.is_disease).length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800/60 bg-[#161b22]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-100 tracking-tight">
                Prediction History
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Review your past crop disease analyses and treatment
                recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate("/predict")}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Predictions"
            value={stats.total}
            icon={HistoryIcon}
            accent="bg-blue-600/20 text-blue-400"
          />
          <StatCard
            label="Diseases Detected"
            value={stats.diseases}
            icon={AlertCircle}
            accent="bg-amber-600/20 text-amber-400"
          />
          <StatCard
            label="Healthy Crops"
            value={stats.healthy}
            icon={ShieldCheck}
            accent="bg-emerald-600/20 text-emerald-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-500 mr-1" />
          {[
            { key: "all", label: "All" },
            { key: "disease", label: "Diseases" },
            { key: "healthy", label: "Healthy" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500/60 mb-3" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Sprout className="w-12 h-12 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-400 text-sm mb-1">No predictions found</p>
              <p className="text-gray-600 text-xs mb-6">
                {filter !== "all"
                  ? `No ${filter} predictions in this category.`
                  : "Start by analyzing your first crop image."}
              </p>
              <button
                onClick={() => navigate("/predict")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Start Your First Analysis
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            filtered.map((prediction) => (
              <div
                key={prediction.id}
                className="group p-5 rounded-2xl bg-[#161b22] border border-gray-800/60 hover:border-gray-700/80 transition-all cursor-pointer"
                onClick={() => navigate(`/prediction/${prediction.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          prediction.is_disease
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <h3 className="font-medium text-gray-100 truncate">
                        {prediction.predicted_class}
                      </h3>
                      <span
                        className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          prediction.is_disease
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(prediction.created_at)}
                      </span>
                      {prediction.treatment && (
                        <span className="text-emerald-400/80">
                          Treatment available
                        </span>
                      )}
                    </div>

                    {prediction.treatment?.treatment_text && (
                      <p className="mt-3 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {prediction.treatment.treatment_text}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
