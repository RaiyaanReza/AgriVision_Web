import os
import re
from typing import Any


def _list_gemini_api_keys() -> list[str]:
    """
    Lists non-empty GEMINI_API_KEY_* keys from environment in slot order.
    This matches the project's slot-based `.env` style.
    """
    candidates: list[tuple[int, str]] = []
    for key, value in os.environ.items():
        if not key.startswith("GEMINI_API_KEY_"):
            continue
        if not value or not value.strip():
            continue
        try:
            slot = int(key.split("_")[-1])
        except ValueError:
            slot = 10_000
        candidates.append((slot, value.strip()))

    if not candidates:
        return []
    candidates.sort(key=lambda x: x[0])
    return [v for _, v in candidates]


def is_gemini_configured() -> bool:
    return len(_list_gemini_api_keys()) > 0


def _build_prompt(question: str, retrieved: list[dict[str, Any]]) -> str:
    sources_text = []
    for idx, item in enumerate(retrieved, start=1):
        title = item.get("title") or "Untitled"
        crop = item.get("crop_type") or "Unknown"
        disease = item.get("disease_name") or ""
        snippet = (item.get("snippet") or "").strip()
        snippet = re.sub(r"\s+", " ", snippet)
        sources_text.append(
            f"[{idx}] title={title} | crop={crop} | disease={disease}\n{snippet}"
        )

    context_block = "\n\n".join(sources_text) if sources_text else "(no sources found)"

    return (
        "You are AgriVision, an agritech assistant.\n"
        "Answer the user's question using ONLY the provided sources.\n"
        "If the sources are insufficient, say you don't have enough information yet and suggest what document to add.\n"
        "Keep the answer concise, practical, and safety-aware.\n\n"
        f"USER QUESTION:\n{question}\n\n"
        f"SOURCES:\n{context_block}\n\n"
        "OUTPUT FORMAT:\n"
        "- Provide a short actionable answer.\n"
        "- Then provide 2-5 bullet points of steps.\n"
        "- End with a short 'Sources:' line listing source indices used.\n"
    )


def generate_rag_answer(question: str, retrieved: list[dict[str, Any]]) -> dict[str, Any]:
    api_keys = _list_gemini_api_keys()
    if not api_keys:
        return {
            "enabled": False,
            "error": "Gemini API key not configured.",
        }

    # Import lazily so backend still starts if dependency is missing.
    from google import genai  # type: ignore
    from google.genai import types  # type: ignore

    # Gemini 3.1 Flash-Lite is currently served under the preview model ID.
    # We keep this pinned (as requested) for deterministic behavior.
    model = "gemini-3.1-flash-lite-preview"

    prompt = _build_prompt(question=question, retrieved=retrieved)
    last_error: str | None = None
    for api_key in api_keys:
        try:
            client = genai.Client(
                api_key=api_key,
                http_options=types.HttpOptions(api_version="v1beta"),
            )
            response = client.models.generate_content(model=model, contents=prompt)
            text = getattr(response, "text", None) or ""
            return {
                "enabled": True,
                "model": model,
                "answer": text.strip(),
            }
        except Exception as exc:  # noqa: BLE001
            error_text = str(exc)
            last_error = error_text
            # Common case in your `.env`: a suspended consumer key.
            if "CONSUMER_SUSPENDED" in error_text or "Consumer" in error_text and "suspended" in error_text:
                continue
            # Quota or permission errors should try next keys too.
            if "PERMISSION_DENIED" in error_text or "RESOURCE_EXHAUSTED" in error_text:
                continue
            break

    return {
        "enabled": False,
        "model": model,
        "error": last_error or "Gemini call failed.",
    }

