import logging
from typing import Dict

from ..config import CROP_CONFIDENCE_THRESHOLD, CROP_NAME_MAPPING
from ..models.crop_classifier import CropClassifier
from .state import WorkflowState

logger = logging.getLogger(__name__)

_crop_classifier: CropClassifier | None = None


def _get_crop_classifier() -> CropClassifier:
    """Return a singleton crop classifier instance."""
    global _crop_classifier
    if _crop_classifier is None:
        _crop_classifier = CropClassifier()
    return _crop_classifier


def crop_classifier_node(state: WorkflowState) -> dict:
    """Classify crop from image and decide next route based on confidence threshold."""
    image = state.get("image")
    if image is None:
        logger.error("Router node received empty image in workflow state.")
        return {
            "success": False,
            "error": "Image is missing from workflow state.",
            "route_decision": "error",
            "image": None,  # Remove image from state to prevent serialization issues
        }

    try:
        classifier = _get_crop_classifier()
        prediction: Dict[str, float | str] = classifier.predict(image)
        confidence = float(prediction.get("confidence", 0.0))

        raw_crop_name = str(prediction.get("crop", "Unknown"))
        crop_name = CROP_NAME_MAPPING.get(raw_crop_name, raw_crop_name)

        route_decision = (
            "continue" if confidence >= CROP_CONFIDENCE_THRESHOLD else "error"
        )
        logger.info(
            "Crop router result raw_crop=%s mapped_crop=%s confidence=%.4f threshold=%.2f route=%s",
            raw_crop_name,
            crop_name,
            confidence,
            CROP_CONFIDENCE_THRESHOLD,
            route_decision,
        )

        return {
            "crop_result": {
                "crop": crop_name,
                "confidence": confidence,
            },
            "route_decision": route_decision,
        }
    except Exception as exc:
        logger.error("Crop classification node failed: %s", exc, exc_info=True)
        return {
            "success": False,
            "error": f"Crop classification failed: {exc}",
            "route_decision": "error",
            "image": None,
        }
