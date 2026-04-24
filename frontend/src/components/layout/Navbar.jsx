import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Sprout, ChevronDown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../common';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navLinks = [
    { path: '/', label: t('nav.home', 'Home') },
    { path: '/predict', label: t('nav.prediction', 'Detection') },
    { path: '/history', label: t('nav.history', 'History') },
    { path: '/chat', label: 'AgriBot', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { path: '/about', label: t('nav.about', 'About') },
  ];

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-8 pt-4`}
      >
        <div 
          className={`max-w-7xl mx-auto rounded-3xl transition-all duration-500 ${
            isScrolled
              ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border border-white/40 dark:border-gray-800/40 py-2 md:py-3'
              : 'bg-transparent py-4 md:py-6'
          }`}
        >
          <div className="px-6 md:px-8 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group relative z-10">
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg shadow-green-200/50 dark:shadow-none"
                >
                  <Sprout className="w-6 h-6 text-white" />
                </motion.div>
                <div className="absolute -inset-1 bg-green-400 blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                  Agri<span className="text-green-600">Vision</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                  Pro Edition
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/30 p-1 rounded-2xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-md">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2.5 text-sm font-bold transition-all rounded-xl flex items-center gap-2 ${
                    location.pathname === link.path
                      ? 'text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-green-400/5 dark:bg-green-400/10 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    >
                      <Sun className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: 90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    >
                      <Moon className="w-5 h-5 text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-950 z-[90] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-2xl font-black tracking-tighter">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-8 h-8 text-gray-400" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                        location.pathname === link.path
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-black'
                          : 'text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <span className="text-lg flex items-center gap-3">
                        {link.icon}
                        {link.label}
                      </span>
                      <ChevronDown className="w-5 h-5 -rotate-90 opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-900">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Settings</p>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <span className="font-bold text-gray-600 dark:text-gray-400">Language</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
