export const ConfidenceBar = ({
  confidence,
  colorClass = "bg-agri-primary",
}) => {
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{
            width: `${Math.max(0, Math.min(100, (confidence || 0) * 100))}%`,
          }}
        />
      </div>
    </div>
  );
};
