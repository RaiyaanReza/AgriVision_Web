import { BoundingBoxOverlay } from "./BoundingBoxOverlay";

export function DetectionPreviewPane({ previewUrl, boxes }) {
  const safeBoxes = boxes || [];

  if (safeBoxes.length > 0) {
    return <BoundingBoxOverlay imageUrl={previewUrl} boxes={safeBoxes} />;
  }

  return (
    <img
      src={previewUrl}
      alt="Analyzed Crop"
      className="w-full h-auto rounded-lg object-cover border"
    />
  );
}
