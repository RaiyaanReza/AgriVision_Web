import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Leaf, MessageCircle, History, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/prediction', icon: Leaf, label: t('nav.prediction') },
    { path: '/chat', icon: MessageCircle, label: 'AgriBot' },
    { path: '/history', icon: History, label: t('nav.history') },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="mobile-nav glass border-t border-primary-200 dark:border-primary-800"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-text-secondary'
                }`}
              />
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
};

export default MobileNav;
