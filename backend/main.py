import logging
import os
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .agents.workflow import run_workflow
from .schemas.response import PredictResponse
from .services.image_processor import ImageProcessor
from .services.gemini_client import generate_rag_answer, is_gemini_configured
from .services.knowledge_base import (
    create_document,
    delete_document,
    extract_text_from_file,
    initialize_knowledge_base,
    list_documents,
    query_documents,
)

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


@app.on_event("startup")
async def startup_event() -> None:
    # Ensure `.env` values are present in process environment for local dev.
    # This is safe: it only loads if python-dotenv is installed.
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv(dotenv_path=os.path.join(os.getcwd(), ".env"), override=False)
    except Exception:
        pass
    initialize_knowledge_base()


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


class RAGQueryRequest(BaseModel):
    question: str
    cropType: str | None = None
    crop_type: str | None = None
    disease_name: str | None = None
    llm: bool | None = None


@app.get("/api/documents")
async def get_documents() -> list[dict[str, Any]]:
    return list_documents()


@app.post("/api/documents")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(""),
    crop_type: str = Form("Unknown"),
    disease_name: str = Form(""),
    content: str = Form(""),
    tags: str = Form(""),
) -> dict[str, Any]:
    raw = await file.read()
    extracted_text = extract_text_from_file(raw=raw, filename=file.filename or "")
    return create_document(
        {
            "title": title or file.filename or "Untitled",
            "crop_type": crop_type,
            "disease_name": disease_name,
            "content": content,
            "tags": tags,
            "filename": file.filename or "",
            "mime_type": file.content_type or "",
            "extracted_text": extracted_text,
        }
    )


class DocumentImportItem(BaseModel):
    title: str
    crop_type: str | None = None
    disease_name: str | None = None
    content: str | None = None
    tags: list[str] | str | None = None


@app.post("/api/documents/import")
async def import_documents(items: list[DocumentImportItem]) -> dict[str, Any]:
    created: list[dict[str, Any]] = []
    for item in items:
        tags_value = item.tags
        if isinstance(tags_value, list):
            tags_str = ",".join([t for t in tags_value if t])
        else:
            tags_str = tags_value or ""

        created.append(
            create_document(
                {
                    "title": item.title,
                    "crop_type": item.crop_type or "Unknown",
                    "disease_name": item.disease_name or "",
                    "content": item.content or "",
                    "tags": tags_str,
                    "filename": "import.json",
                    "mime_type": "application/json",
                    "extracted_text": "",
                }
            )
        )
    return {"created": len(created)}


@app.delete("/api/documents/{doc_id}")
async def remove_document(doc_id: str) -> dict[str, bool]:
    deleted = delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"deleted": True}


@app.post("/api/rag/query")
async def rag_query(payload: RAGQueryRequest) -> dict[str, Any]:
    crop = payload.cropType or payload.crop_type or ""
    retrieval = query_documents(
        question=payload.question,
        crop_type=crop,
        disease_name=payload.disease_name or "",
    )
    want_llm = bool(payload.llm)
    if want_llm and is_gemini_configured():
        try:
            retrieval["llm"] = generate_rag_answer(
                question=payload.question,
                retrieved=retrieval.get("results", []),
            )
        except Exception as exc:  # noqa: BLE001
            retrieval["llm"] = {
                "enabled": False,
                "model": "gemini-3.1-flash-lite",
                "error": str(exc),
            }
    else:
        retrieval["llm"] = {
            "enabled": False,
            "model": "gemini-3.1-flash-lite-preview",
        }
    return retrieval
