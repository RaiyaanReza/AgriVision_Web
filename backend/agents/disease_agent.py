import logging
from typing import Any

from ..models.disease_models import DiseaseModelRegistry
from .state import WorkflowState

logger = logging.getLogger(__name__)

_disease_registry: DiseaseModelRegistry | None = None


def _get_disease_registry() -> DiseaseModelRegistry:
    """Return a singleton disease model registry instance."""
    global _disease_registry
    if _disease_registry is None:
        _disease_registry = DiseaseModelRegistry()
    return _disease_registry


def disease_detector_node(state: WorkflowState) -> dict:
    """Detect disease using crop-specific model and update workflow state."""
    image: Any = state.get("image")
    crop_result = state.get("crop_result", {})
    crop_name = crop_result.get("crop") if isinstance(crop_result, dict) else None

    if image is None:
        logger.error("Disease detector node received empty image in workflow state.")
        return {"success": False, "error": "Image is missing from workflow state."}

    if not crop_name:
        logger.error("Disease detector node could not find crop name in crop_result.")
        return {"success": False, "error": "Crop classification result is missing or invalid."}

    try:
        registry = _get_disease_registry()
        disease_result = registry.predict(str(crop_name), image)
        logger.info(
            "Disease detector result crop=%s disease=%s confidence=%.4f",
            crop_name,
            disease_result.get("disease"),
            float(disease_result.get("confidence", 0.0)),
        )

        return {
            "disease_result": disease_result,
            "success": True,
        }
    except Exception as exc:
        logger.error("Disease detection node failed for crop=%s: %s", crop_name, exc, exc_info=True)
        return {
            "success": False,
            "error": f"Disease detection failed for crop '{crop_name}': {exc}",
        }
