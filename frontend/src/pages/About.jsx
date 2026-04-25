import { AboutHero } from "../components/about/AboutHero";
import { MissionSection } from "../components/about/MissionSection";
import { StatsSection } from "../components/about/StatsSection";
import { TeamSection } from "../components/about/TeamSection";
import { TechnologyFlow } from "../components/about/TechnologyFlow";

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <AboutHero />
        <MissionSection />
        <StatsSection />
        <TechnologyFlow />
        <TeamSection />
      </div>

      {/* Modern Professional Footer */}
      <footer className="pt-32 pb-12 bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <h3 className="text-xl font-black mb-6 tracking-tighter">AgriVision Pro</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm leading-relaxed">
                Empowering the next generation of precision agriculture through advanced computer vision and agentic AI systems.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">System</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-500 transition-colors">YOLO Routing</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Neural Mapping</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Global Impact</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-50 dark:border-gray-900">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-700">
              © 2026 AgriVision Pro // All Rights Reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
