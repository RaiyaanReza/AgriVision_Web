import { motion } from "framer-motion";
import { Cpu, FlaskConical, Network, Globe2, ShieldCheck, Zap } from "lucide-react";

const stats = [
  { icon: Globe2, label: "50+ Crop Species" },
  { icon: ShieldCheck, label: "Enterprise Ready" },
  { icon: Zap, label: "Real-time Processing" },
];

export function InsightRibbon() {
  return (
    <section className="py-12 border-t border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-green-500 flex items-center justify-center text-[10px] font-black text-white">
                12k+
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Trusted by agronomists <br />across 40+ countries.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            {stats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

