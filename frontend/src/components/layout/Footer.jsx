import { Leaf } from "lucide-react";
import { NavLink } from "react-router-dom";

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Treatments", href: "/treatments" },
  { name: "History", href: "/history" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-emerald-100 mt-auto dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-agri-primary" />
            <span className="ml-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              AgriVision
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className="text-sm text-gray-500 hover:text-agri-primary dark:text-slate-400 dark:hover:text-agri-accent transition-colors"
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-slate-800">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} AgriVision. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
