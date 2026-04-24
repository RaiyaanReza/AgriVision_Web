import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, CheckCircle, AlertCircle, ChevronRight, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/predictions/history?limit=50`);
      setPredictions(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load prediction history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: predictions.length,
    diseases: predictions.filter(p => p.is_disease).length,
    healthy: predictions.filter(p => !p.is_disease).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <History className="w-8 h-8 text-green-600" />
                Prediction History
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                View all your past crop disease analyses and treatments
              </p>
            </div>
            <Button onClick={() => navigate('/predict')}>
              New Analysis
            </Button>
          </div>
        </div>
      </motion.div>

      <Section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Predictions</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <History className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Diseases Detected</p>
                  <p className="text-3xl font-bold mt-1">{stats.diseases}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Healthy Crops</p>
                  <p className="text-3xl font-bold mt-1">{stats.healthy}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-200" />
              </div>
            </Card>
          </div>

          {/* Predictions List */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Analyses
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Loading history...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <Button onClick={fetchHistory} className="mt-4" variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">No predictions yet</p>
                  <Button onClick={() => navigate('/predict')}>
                    Start Your First Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        prediction.is_disease
                          ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                          : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {prediction.is_disease ? (
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {prediction.predicted_class}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prediction.is_disease
                                ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                                : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                            }`}>
                              {(prediction.confidence * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(prediction.created_at)}
                            </span>
                            {prediction.treatment && (
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Eye className="w-4 h-4" />
                                Treatment available
                              </span>
                            )}
                          </div>

                          {prediction.treatment && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                                {prediction.treatment.treatment_text}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/prediction/${prediction.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}
