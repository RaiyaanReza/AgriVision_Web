export const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl bg-white shadow-lg ${className}`}>{children}</div>
);
