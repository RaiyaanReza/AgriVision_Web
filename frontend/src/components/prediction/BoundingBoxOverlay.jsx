export const BoundingBoxOverlay = ({ imageUrl, boxes }) => {
  const normalizeBox = (box) => {
    if (Array.isArray(box) && box.length >= 4) {
      return { x1: box[0], y1: box[1], x2: box[2], y2: box[3] };
    }

    if (box && typeof box === "object") {
      return {
        x1: Number(box.x1 ?? 0),
        y1: Number(box.y1 ?? 0),
        x2: Number(box.x2 ?? 0),
        y2: Number(box.y2 ?? 0),
      };
    }

    return null;
  };

  return (
    <div className="relative inline-block w-full rounded-lg overflow-hidden border">
      <img src={imageUrl} alt="Analysis Result" className="w-full block" />
      {boxes?.map((box, idx) => {
        const normalized = normalizeBox(box);
        if (!normalized) {
          return null;
        }

        const width = (normalized.x2 - normalized.x1) * 100;
        const height = (normalized.y2 - normalized.y1) * 100;
        const left = normalized.x1 * 100;
        const top = normalized.y1 * 100;

        return (
          <div
            key={idx}
            className="absolute border-2 border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          />
        );
      })}
    </div>
  );
};
