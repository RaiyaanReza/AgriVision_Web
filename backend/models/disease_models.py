import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from ultralytics import YOLO

from config import DISEASE_CONFIDENCE_THRESHOLD, DISEASE_MODELS

logger = logging.getLogger(__name__)


class DiseaseModelRegistry:
    """Loads and serves crop-specific YOLO disease models."""

    def __init__(self) -> None:
        self._models: Dict[str, YOLO] = {}
        self._load_models()

    def _load_models(self) -> None:
        for crop_name, model_path in DISEASE_MODELS.items():
            try:
                path = Path(model_path)
                if not path.exists():
                    logger.warning(
                        "Disease model missing for crop=%s at path=%s", crop_name, path
                    )
                    continue

                self._models[crop_name.lower()] = YOLO(str(path))
                logger.info("Disease model loaded for crop=%s", crop_name)
            except Exception as exc:
                logger.error(
                    "Failed to load disease model for crop=%s: %s",
                    crop_name,
                    exc,
                    exc_info=True,
                )

    def has_model(self, crop_name: str) -> bool:
        return crop_name.lower() in self._models

    def predict(self, crop_name: str, image_source: Any) -> Dict[str, Any]:
        key = crop_name.lower()
        if key not in self._models:
            raise ValueError(f"No disease model available for crop: {crop_name}")

        model = self._models[key]

        try:
            results = model(image_source, verbose=False)
            if not results:
                raise ValueError("Disease model returned no results.")

            result = results[0]
            parsed = self._parse_result(result)
            if parsed is None:
                return {
                    "disease": "No_Disease_Detected",
                    "confidence": 0.0,
                    "boxes": [],
                }

            return parsed
        except Exception as exc:
            logger.error(
                "Disease inference failed for crop=%s: %s",
                crop_name,
                exc,
                exc_info=True,
            )
            raise

    def _parse_result(self, result: Any) -> Optional[Dict[str, Any]]:
        if hasattr(result, "probs") and result.probs is not None:
            top_idx = int(result.probs.top1)
            confidence = float(result.probs.top1conf.item())
            disease = result.names[top_idx]
            return {"disease": disease, "confidence": confidence, "boxes": []}

        if (
            hasattr(result, "boxes")
            and result.boxes is not None
            and len(result.boxes) > 0
        ):
            parsed_boxes: List[Dict[str, float]] = []
            best_label: Optional[str] = None
            best_confidence = 0.0

            for box in result.boxes:
                confidence = float(box.conf[0])
                if confidence < DISEASE_CONFIDENCE_THRESHOLD:
                    continue

                class_idx = int(box.cls[0])
                label = result.names[class_idx]
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                parsed_boxes.append(
                    {
                        "x1": float(x1),
                        "y1": float(y1),
                        "x2": float(x2),
                        "y2": float(y2),
                    }
                )

                if confidence > best_confidence:
                    best_confidence = confidence
                    best_label = label

            if best_label is None:
                return None

            return {
                "disease": best_label,
                "confidence": best_confidence,
                "boxes": parsed_boxes,
            }

        return None
