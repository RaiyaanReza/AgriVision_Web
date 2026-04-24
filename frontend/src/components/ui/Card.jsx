export const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-xl bg-white shadow-lg dark:bg-slate-800 dark:shadow-slate-900/30 transition-colors ${className}`}
  >
    {children}
  </div>
);
