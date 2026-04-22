export const LoadingSpinner = ({ size = "md", className = "" }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-agri-primary border-t-transparent ${
      size === "lg" ? "h-10 w-10" : size === "sm" ? "h-4 w-4" : "h-6 w-6"
    } ${className}`}
  />
);
