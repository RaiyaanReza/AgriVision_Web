import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Activity, FileText, ChevronRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
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
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold text-xs uppercase tracking-widest mb-6 border border-green-100 dark:border-green-800"
          >
            <Zap className="w-3.5 h-3.5" />
            Instant Diagnosis
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 dark:from-white dark:via-green-400 dark:to-white"
          >
            Disease Intelligence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Upload a high-resolution photo of your crop to receive an expert-grade diagnosis and precision treatment plan in seconds.
          </motion.p>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Upload Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-2xl shadow-green-200/20 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Upload className="w-6 h-6 text-green-600" />
                  Capture
                </h2>
                {preview && (
                  <button 
                    onClick={resetForm}
                    className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>
              
              <div className="relative group">
                {!preview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('fileInput').click()}
                    className="aspect-square rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center p-10 group-hover:border-green-400/50 group-hover:bg-green-50/30 dark:group-hover:bg-green-900/10 transition-all cursor-pointer"
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform shadow-inner">
                      <Camera className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Drop your image</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Or click to browse from gallery</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                      {['JPG', 'PNG', 'WEBP'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl group"
                  >
                    <img
                      src={preview}
                      alt="Crop specimen"
                      className="w-full h-full object-cover transform transition-transform group-hover:scale-105 duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest">
                        Selected Specimen
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {preview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-xl shadow-green-200 dark:shadow-none transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        AI Analysis...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">
                        Detect Disease <ChevronRight className="w-6 h-6" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-5 bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-4 shadow-sm"
                >
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-900 dark:text-red-200 text-sm font-bold leading-snug">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 min-h-[600px] shadow-2xl shadow-blue-200/20 dark:shadow-none flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Diagnosis
                </h2>
                <ShieldCheck className="w-6 h-6 text-gray-300 dark:text-gray-700" />
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative w-32 h-32 mb-8">
                      <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-10 h-10 text-green-500 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-3">Scanning Specimen...</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
                      Running neural network models to identify morphological abnormalities.
                    </p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 flex-1"
                  >
                    {/* Diagnosis Card */}
                    <div className={`p-8 rounded-[2rem] relative overflow-hidden transition-all ${
                      result.is_disease 
                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-100 dark:border-orange-900/30 shadow-lg shadow-orange-100/50 dark:shadow-none' 
                        : 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-100 dark:border-green-900/30 shadow-lg shadow-green-100/50 dark:shadow-none'
                    }`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-10 translate-y-[-10] opacity-10 ${result.is_disease ? 'text-orange-600' : 'text-green-600'}`}>
                         {result.is_disease ? <AlertCircle size={120} /> : <CheckCircle size={120} />}
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-2xl shadow-inner ${result.is_disease ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-green-100 dark:bg-green-900/40 text-green-600'}`}>
                            {result.is_disease ? <AlertCircle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">Diagnosis Result</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none capitalize">
                              {result.class.replace(/_/g, ' ')}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-8 p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/5 inline-flex">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Reliability Score</span>
                            <span className={`text-2xl font-black ${result.confidence > 0.8 ? 'text-green-600' : 'text-amber-500'}`}>
                              {(result.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Pathogen Status</span>
                            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${result.is_disease ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              {result.is_disease ? 'Alert: Active' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Section */}
                    {result.treatment && (
                      <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-xl font-bold">Actionable Treatment Plan</h4>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed font-medium space-y-4">
                            {result.treatment.split('\n').map((line, i) => (
                              <p key={i} className={line.startsWith('-') || line.match(/^\d\./) ? 'pl-4' : ''}>
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex gap-4 pt-4 mt-auto">
                      <Button
                        onClick={() => navigate('/history')}
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl border-2 border-gray-100 dark:border-gray-800 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Diagnosis History
                      </Button>
                      <Button
                        onClick={resetForm}
                        className="flex-1 h-14 rounded-2xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 shadow-xl shadow-gray-200 dark:shadow-none"
                      >
                        New Specimen
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                  >
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-gray-100 dark:border-gray-800">
                      <Activity className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 dark:text-gray-600 mb-2">Pending Analysis</h3>
                    <p className="text-gray-400 dark:text-gray-600 max-w-xs mx-auto text-sm font-medium">
                      Select an image and initiate the neural engine to view diagnostic insights.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-700">
          Neural Architecture V2.0 // Real-time Crop Pathogen Identification
        </p>
      </footer>
    </div>
  );
}
