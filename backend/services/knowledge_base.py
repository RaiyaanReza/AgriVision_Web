import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "knowledge_base.db"


def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_knowledge_base() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                crop_type TEXT,
                disease_name TEXT,
                content TEXT,
                tags TEXT,
                filename TEXT,
                mime_type TEXT,
                extracted_text TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def _safe_decode(raw: bytes) -> str:
    if not raw:
        return ""
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return ""


def extract_text_from_file(raw: bytes, filename: str = "") -> str:
    extension = Path(filename or "").suffix.lower()
    if extension == ".json":
        text = _safe_decode(raw)
        if not text:
            return ""
        try:
            parsed = json.loads(text)
            return json.dumps(parsed, indent=2)
        except json.JSONDecodeError:
            return text
    if extension in {".txt", ".md", ".csv"}:
        return _safe_decode(raw)
    if extension == ".pdf":
        return (
            "PDF file uploaded. Text extraction can be enabled later with a PDF parser "
            "(this placeholder keeps the RAG pipeline ready)."
        )
    return _safe_decode(raw)


def create_document(payload: dict[str, Any]) -> dict[str, Any]:
    record = {
        "id": str(uuid.uuid4()),
        "title": payload.get("title") or "Untitled",
        "crop_type": payload.get("crop_type") or "Unknown",
        "disease_name": payload.get("disease_name") or "",
        "content": payload.get("content") or "",
        "tags": payload.get("tags") or "",
        "filename": payload.get("filename") or "",
        "mime_type": payload.get("mime_type") or "",
        "extracted_text": payload.get("extracted_text") or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO documents (
                id, title, crop_type, disease_name, content, tags,
                filename, mime_type, extracted_text, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["title"],
                record["crop_type"],
                record["disease_name"],
                record["content"],
                record["tags"],
                record["filename"],
                record["mime_type"],
                record["extracted_text"],
                record["created_at"],
            ),
        )
        conn.commit()
    return record


def list_documents() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM documents ORDER BY datetime(created_at) DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def delete_document(doc_id: str) -> bool:
    with _connect() as conn:
        cursor = conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        return cursor.rowcount > 0


def query_documents(question: str, crop_type: str = "", disease_name: str = "") -> dict[str, Any]:
    normalized_question = (question or "").strip().lower()
    normalized_crop = (crop_type or "").strip().lower()
    normalized_disease = (disease_name or "").strip().lower()

    docs = list_documents()
    ranked: list[dict[str, Any]] = []
    for doc in docs:
        text_pool = " ".join(
            [
                doc.get("title", ""),
                doc.get("crop_type", ""),
                doc.get("disease_name", ""),
                doc.get("content", ""),
                doc.get("extracted_text", ""),
                doc.get("tags", ""),
            ]
        ).lower()

        if normalized_crop and normalized_crop not in (doc.get("crop_type", "").lower()):
            continue
        if normalized_disease and normalized_disease not in (
            doc.get("disease_name", "").lower()
        ):
            continue

        score = 0.0
        if normalized_question and normalized_question in text_pool:
            score += 0.65
        if normalized_crop and normalized_crop in text_pool:
            score += 0.2
        if normalized_disease and normalized_disease in text_pool:
            score += 0.15
        if not normalized_question:
            score += 0.25

        if score > 0:
            ranked.append({"score": min(score, 1.0), "doc": doc})

    ranked.sort(key=lambda item: item["score"], reverse=True)
    top_hits = ranked[:5]

    return {
        "results": [
            {
                "title": hit["doc"].get("title"),
                "crop_type": hit["doc"].get("crop_type"),
                "disease_name": hit["doc"].get("disease_name"),
                "snippet": (
                    hit["doc"].get("content")
                    or hit["doc"].get("extracted_text")
                    or "No text content available."
                )[:320],
                "score": round(hit["score"], 3),
            }
            for hit in top_hits
        ],
        "sources": [
            {
                "document_name": hit["doc"].get("title"),
                "document_id": hit["doc"].get("id"),
            }
            for hit in top_hits
        ],
        "mode": "local-rag-ready",
        "note": "Endpoint is ready for LangChain/LLM wiring once API keys are configured.",
    }
