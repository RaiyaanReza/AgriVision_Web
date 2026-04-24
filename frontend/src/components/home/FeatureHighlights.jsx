import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Stethoscope, Zap, Database, Cpu, Leaf } from 'lucide-react';

const features = [
  {
    title: "Neural Scan",
    description: "Real-time edge computing models analyze leaf venation and chlorophyll density for anomalies.",
    icon: <Cpu className="w-6 h-6" />,
    gradient: "from-blue-500 to-indigo-600",
    delay: 0.1
  },
  {
    title: "Eco-Precision",
    description: "Get organic and sustainable treatment plans that protect your soil and ecosystem.",
    icon: <Leaf className="w-6 h-6" />,
    gradient: "from-green-500 to-emerald-600",
    delay: 0.2
  },
  {
    title: "Global Dataset",
    description: "Trained on 1.2M+ high-res agricultural specimens across 200+ climate zones.",
    icon: <Database className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-600",
    delay: 0.3
  },
  {
    title: "Instant Response",
    description: "Sub-200ms inference time ensures immediate feedback even in low-bandwidth fields.",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-rose-500 to-pink-600",
    delay: 0.4
  }
];

export function FeatureHighlights() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-4">Core Technology</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
              Built for the <br />Future of Farming.
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">
            Leveraging computer vision and agronomist-verified data to secure global food supplies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              className="group p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-200/20 dark:hover:border-green-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-8 shadow-lg shadow-gray-200/50 dark:shadow-none transform group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
              
              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700">Enterprise Grade</span>
                <Sparkles className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

