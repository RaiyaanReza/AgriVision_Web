import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { label: t('nav.home', 'Home'), path: '/' },
      { label: t('nav.prediction', 'Detection'), path: '/predict' },
      { label: t('nav.history', 'History'), path: '/history' },
      { label: 'AgriBot', path: '/chat' },
    ],
    resources: [
      { label: 'Documentation', url: '#' },
      { label: 'API Reference', url: '#' },
      { label: 'Blog', url: '#' },
    ],
    contact: [
      { icon: Mail, text: 'support@agrivision.com', url: 'mailto:support@agrivision.com' },
      { icon: Phone, text: '+1 (555) 123-4567', url: 'tel:+15551234567' },
      { icon: MapPin, text: 'Agricultural Tech Hub', url: '#' },
    ],
  };

  // const socialLinks = [];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sprout className="w-8 h-8 text-green-400" />
              <span className="text-xl font-bold">AgriVision</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              {t('footer.description', 'Empowering farmers with AI-driven crop diagnosis and real-time agricultural support.')}
            </p>
            {/* Social Links Removed for compatibility */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('footer.quick_links', 'Quick Links')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-green-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('footer.resources', 'Resources')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((resource) => (
                <li key={resource.label}>
                  <a
                    href={resource.url}
                    className="text-gray-300 hover:text-green-400 text-sm transition-colors"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('footer.contact', 'Contact')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className="flex items-center gap-2 text-gray-300 hover:text-green-400 text-sm transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} AgriVision. {t('footer.copyright', 'All rights reserved.')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
