export const Badge = ({ children, severity = "info", className = "" }) => {
  const colors = {
    healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    mild: "bg-amber-100 text-amber-700 border-amber-200",
    severe: "bg-rose-100 text-rose-700 border-rose-200",
    info: "bg-sky-100 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[severity] || colors.info} ${className}`}
    >
      {children}
    </span>
  );
};
