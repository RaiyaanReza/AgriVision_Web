import logging

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .agents.workflow import run_workflow
from .schemas.response import PredictResponse
from .services.image_processor import ImageProcessor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Crop Disease Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught exceptions and return a standardized HTTP 500 response."""
    logger.error("Unhandled exception on path=%s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
    )


@app.get("/api/health")
async def health_check() -> dict:
    """Return API health status."""
    return {"status": "ok"}


@app.post("/api/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)) -> PredictResponse:
    """Run crop and disease detection workflow for an uploaded image."""
    try:
        prepared_image = await ImageProcessor.prepare_for_inference(image)
    except ValueError as exc:
        logger.warning("Invalid image upload rejected: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    workflow_state = run_workflow(prepared_image)

    success = bool(workflow_state.get("success", False))
    error = workflow_state.get("error")
    crop_result = workflow_state.get("crop_result")
    disease_result = workflow_state.get("disease_result")

    if isinstance(disease_result, dict):
        disease_result_payload = [disease_result]
    else:
        disease_result_payload = disease_result

    return PredictResponse(
        success=success,
        error=error,
        crop_result=crop_result,
        disease_result=disease_result_payload,
    )
