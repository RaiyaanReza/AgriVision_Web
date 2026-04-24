import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, ShieldCheck, Activity, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <div className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-green-400/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-black text-[10px] uppercase tracking-[0.2em] border border-green-100 dark:border-green-900/30 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence for Agriculture 4.0
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tighter mb-8">
              Protect Your <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Crops with AI.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl mb-10">
              AgriVision Pro uses state-of-the-art neural networks to detect 50+ crop diseases with 99.2% accuracy. Capture, analyze, and treat in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/predict">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 dark:shadow-none"
                >
                  Start Scanning
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/chat">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  Ask AgriBot
                  <Activity className="w-5 h-5 text-green-500" />
                </motion.button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Support</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-[3rem] blur-3xl -z-10 transform rotate-6"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] border border-white/20 dark:border-gray-800/50 p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" 
                alt="AI Agriculture" 
                className="rounded-[2.5rem] w-full h-[500px] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute top-12 left-12 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Precision</p>
                    <p className="text-2xl font-black text-white leading-none">99.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

