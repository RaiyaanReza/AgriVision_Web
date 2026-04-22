import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "Models"

# Model Paths based on workspace structure
CROP_CLASSIFIER_MODEL_PATH = MODELS_DIR / "Crops Classifier" / "best.pt"

DISEASE_MODELS = {
    "Brassica": MODELS_DIR / "Brassica" / "best.pt",
    "Corn": MODELS_DIR / "Corn" / "best.pt",
    "Potato": MODELS_DIR / "Potato" / "best.pt",
    "Rice": MODELS_DIR / "Rice" / "best.pt",
    "GourdGuava": MODELS_DIR / "Brassica" / "best.pt",  # Fallback or add specific
    "Solanacea": MODELS_DIR
    / "Potato"
    / "best.pt",  # Eggplant/Tomato handled by Potato or specific
}

# Mapping from Crop Classifier output to Model Registry keys
CROP_NAME_MAPPING = {
    "Solanacea": "Potato",
    "GourdGuava": "Brassica",  # Adjust if you have a Guava model
    "Wheat": "Rice",  # Fallback if no wheat model
}

# Thresholds
CROP_CONFIDENCE_THRESHOLD = 0.60
DISEASE_CONFIDENCE_THRESHOLD = 0.50

# App Settings
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
