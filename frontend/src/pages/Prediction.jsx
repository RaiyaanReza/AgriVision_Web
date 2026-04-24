import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Activity, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function PredictionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-600" />
            Crop Disease Detection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Upload a crop image to get instant disease diagnosis and treatment recommendations
          </p>
        </div>
      </motion.div>

      <Section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Upload Image
                  </h2>
                  
                  {!preview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Drag & drop an image here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports: JPG, PNG, WebP (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          onClick={resetForm}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5 mr-2" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Analysis Results
                  </h2>

                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-64"
                      >
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">
                          AI is analyzing your image...
                        </p>
                      </motion.div>
                    ) : result ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Diagnosis */}
                        <div className={`p-4 rounded-lg ${
                          result.is_disease 
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            {result.is_disease ? (
                              <AlertCircle className="w-6 h-6 text-orange-600" />
                            ) : (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {result.class}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                            <span className="font-bold text-green-600">
                              {(result.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Treatment Plan */}
                        {result.treatment && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Treatment Plan
                              </h4>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="whitespace-pre-line text-gray-700 dark:text-gray-200">
                                {result.treatment}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => navigate('/history')}
                            variant="outline"
                            className="flex-1"
                          >
                            View History
                          </Button>
                          <Button
                            onClick={resetForm}
                            className="flex-1"
                          >
                            New Analysis
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-64 text-gray-400"
                      >
                        <Activity className="w-16 h-16 mb-4 opacity-50" />
                        <p>Results will appear here after analysis</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>
    </div>
  );
}
