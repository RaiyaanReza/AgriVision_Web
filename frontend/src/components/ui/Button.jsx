export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-agri-primary text-white hover:bg-agri-secondary border border-transparent",
    secondary:
      "bg-slate-700 text-white hover:bg-slate-800 border border-transparent",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
    outline:
      "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-agri-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
