from pydantic import BaseModel, Field
from typing import List, Optional

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class CropClassification(BaseModel):
    crop: str = Field(..., description="Detected crop type")
    confidence: float = Field(..., description="Confidence score of the crop classification (0-1)")

class DiseaseDetection(BaseModel):
    disease: str = Field(..., description="Detected disease name or indication of health")
    confidence: float = Field(..., description="Confidence score of the disease detection (0-1)")
    boxes: Optional[List[BoundingBox]] = Field(default=[], description="Bounding boxes for the detected disease, if applicable mapping to YOLO output")

class PredictResponse(BaseModel):
    success: bool = Field(True, description="Whether the prediction pipeline succeeded")
    error: Optional[str] = Field(None, description="Error message if success is false")
    crop_result: Optional[CropClassification] = Field(None, description="Result from the Crop Classifier node")
    disease_result: Optional[List[DiseaseDetection]] = Field(None, description="Result from the specific Disease model")
