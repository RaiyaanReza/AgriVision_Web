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
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAppStore } from "../store/useAppStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function StatCard({ label, value, icon: Icon, accent, trend }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-lg shadow-gray-100/50 dark:shadow-none hover:shadow-xl transition-all duration-300 group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 translate-y-[-8px] opacity-10 group-hover:opacity-20 transition-opacity ${accent.split(' ')[1]}`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{label}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-10">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-green-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[25%] h-[25%] bg-blue-400 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-24 pb-8 px-4 sm:px-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-xs uppercase tracking-wider mb-4"
              >
                <HistoryIcon className="w-4 h-4" />
                Scan Archive
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Prediction History
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-xl">
                Review your past crop disease analyses and treatment recommendations with detailed insights.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/predict")}
              className="self-start sm:self-auto inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-green-200/50 dark:shadow-none transition-all"
            >
              <Search className="w-5 h-5" />
              New Analysis
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            label="Total Scans"
            value={stats.total}
            icon={HistoryIcon}
            accent="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="+12% this week"
          />
          <StatCard
            label="Diseases Detected"
            value={stats.diseases}
            icon={AlertCircle}
            accent="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard
            label="Healthy Crops"
            value={stats.healthy}
            icon={ShieldCheck}
            accent="bg-gradient-to-br from-emerald-500 to-green-600"
          />
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-2 mb-8 p-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm"
        >
          <Filter className="w-4 h-4 text-gray-400 mx-2" />
          {[
            { key: "all", label: "All Scans", icon: HistoryIcon },
            { key: "disease", label: "Diseases", icon: AlertCircle },
            { key: "healthy", label: "Healthy", icon: CheckCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === tab.key
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading history...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 p-8 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 p-8 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Sprout className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No predictions found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
                {filter !== "all"
                  ? `No ${filter} predictions in this category.`
                  : "Start by analyzing your first crop image to build your history."}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/predict")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-green-200/50 dark:shadow-none transition-all"
              >
                Start Your First Analysis
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            filtered.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-xl hover:shadow-green-100/50 dark:hover:shadow-none transition-all cursor-pointer"
                onClick={() => navigate(`/prediction/${prediction.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          prediction.is_disease
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : "bg-gradient-to-br from-emerald-400 to-green-500"
                        }`}
                      />
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {prediction.predicted_class.replace(/_/g, ' ')}
                      </h3>
                      <span
                        className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                          prediction.is_disease
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {(prediction.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(prediction.created_at)}
                      </span>
                      {prediction.treatment && (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Treatment available
                        </span>
                      )}
                    </div>

                    {prediction.treatment?.treatment_text && (
                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        {prediction.treatment.treatment_text}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
