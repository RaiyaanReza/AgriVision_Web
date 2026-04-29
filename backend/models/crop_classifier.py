import logging
from ultralytics import YOLO
from pathlib import Path
from config import CROP_CLASSIFIER_MODEL_PATH

logger = logging.getLogger(__name__)


class CropClassifier:
    """Wrapper for the YOLO-based Crop Classifier."""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            if not Path(CROP_CLASSIFIER_MODEL_PATH).exists():
                logger.error(f"Model path does not exist: {CROP_CLASSIFIER_MODEL_PATH}")
                return

            self.model = YOLO(str(CROP_CLASSIFIER_MODEL_PATH))
            logger.info("Crop Classifier model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Crop Classifier: {e}", exc_info=True)
            self.model = None

    async def predict(self, image_source) -> dict:
        """
        Runs YOLO inference on the input image to classify the crop.
        Returns a dict: {"crop": "CropName", "confidence": 0.99}
        """
        if self.model is None:
            raise RuntimeError("Crop Classifier model is not initialized.")

        try:
            results = self.model(image_source, verbose=False)

            if not results or len(results) == 0:
                raise ValueError("No prediction results from model.")

            result = results[0]

            # Case 1: The model is a YOLO Classification model
            if hasattr(result, "probs") and result.probs is not None:
                top_1_idx = result.probs.top1
                confidence = float(result.probs.top1conf.item())
                crop_name = result.names[top_1_idx]
                return {"class": crop_name, "confidence": confidence}

            # Case 2: The model is a YOLO Detection model (fallback if trained as det)
            if hasattr(result, "boxes") and len(result.boxes) > 0:
                best_box = max(result.boxes, key=lambda b: float(b.conf[0]))
                crop_name = result.names[int(best_box.cls[0])]
                confidence = float(best_box.conf[0])
                return {"class": crop_name, "confidence": confidence}

            raise ValueError(
                "Could not extract classification or detection boxes from model result."
            )

        except Exception as e:
            logger.error(f"Error during Crop Classifier inference: {e}", exc_info=True)
            raise
