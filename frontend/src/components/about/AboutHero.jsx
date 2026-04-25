import { motion } from 'framer-motion';

export function AboutHero() {
  return (
    <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-400">
              AI For Better Farming
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8"
          >
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              About AgriVision
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Empowering growers with <span className="text-green-600 dark:text-green-400 font-semibold">AI-powered disease detection</span> and{" "}
            <span className="text-green-600 dark:text-green-400 font-semibold">intelligent treatment guidance</span> grounded in local agricultural knowledge.
          </motion.p>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 flex justify-center items-center gap-8"
          >
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-green-500"></div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/25"></div>
            </div>
            <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-green-500"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
