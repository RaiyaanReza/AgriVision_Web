import { motion } from 'framer-motion';

const missionCards = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Our Mission",
    description: "To revolutionize agriculture by making advanced AI technology accessible to farmers worldwide, enabling early disease detection and sustainable crop management.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Global Impact",
    description: "Supporting farmers across continents with localized knowledge, reducing crop loss, and promoting food security through intelligent agricultural solutions.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Innovation First",
    description: "Continuously advancing our AI models with cutting-edge research, ensuring the highest accuracy in disease detection and treatment recommendations.",
    color: "from-purple-500 to-pink-600",
  },
];

export function MissionSection() {
  return (
    <section className="py-24 px-6 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 text-green-600 dark:text-green-400 mb-4">
            <div className="h-[2px] w-8 bg-current"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">What Drives Us</span>
            <div className="h-[2px] w-8 bg-current"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">
            Our Vision for Agriculture
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Building a future where technology and tradition work together for sustainable farming.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {missionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent dark:from-green-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              
              <div className="relative bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} text-white mb-6 shadow-lg`}>
                  {card.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {card.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                  <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-10`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
