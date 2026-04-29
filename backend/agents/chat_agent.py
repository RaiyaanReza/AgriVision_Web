"""
AgriBot Chat Agent – LangGraph Implementation
Uses gemini-3.1-flash-lite-preview with key rotation.
"""

from typing import TypedDict, Literal, Sequence
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import httpx
import base64
from config import settings
from services.gemini_client import generate_chat_completion

_API_BASE = getattr(settings, "API_BASE_URL", "http://localhost:8000")

RESPONSE_STYLE_GUIDE = """You are AgriBot, an agricultural assistant.
Always return clean, readable Markdown using this structure:

## Quick Answer
1-3 short sentences.

## What To Do
- 3 to 6 practical bullet points.

## Safety Checks
- 2 to 4 bullet points (PPE, dosage caution, escalation signs).

## Next Step
One short recommendation sentence.

Formatting rules:
- Put each heading on its own line.
- Do not place headings inline with paragraph text.
- Keep lines concise and avoid very long paragraphs.
"""


class AgentState(TypedDict):
    """State for the chat agent"""

    messages: Sequence[BaseMessage]
    image_data: str | None
    crop_type: str | None
    disease_detected: str | None
    confidence: float | None
    treatment_plan: str | None
    context_docs: list[dict] | None


def _call_llm(prompt: str) -> str:
    """Thin wrapper around generate_chat_completion for single-turn prompts."""
    full_prompt = f"{RESPONSE_STYLE_GUIDE}\n\nUSER REQUEST:\n{prompt}"
    result = generate_chat_completion([full_prompt])
    if not result.get("enabled"):
        error = result.get("error", "Unknown error")
        return f"Sorry, I couldn't process that request. ({error})"
    return result.get("text", "")


def classify_image(state: AgentState) -> dict:
    """Call the crop classifier API if image is present."""
    image_data = state.get("image_data")
    if not image_data:
        return {"crop_type": None, "disease_detected": None}

    try:
        resp = httpx.post(
            f"{_API_BASE}/api/predict",
            files={
                "file": (
                    "image.jpg",
                    base64.b64decode(image_data),
                    "image/jpeg",
                )
            },
            timeout=30.0,
        )
        result = resp.json()
        data = result.get("data", result)
        return {
            "crop_type": data.get("crop_type") or data.get("class"),
            "disease_detected": data.get("disease"),
            "confidence": data.get("confidence"),
        }
    except Exception as e:
        print(f"Classification error: {e}")
        return {"crop_type": None, "disease_detected": None}


def retrieve_treatments(state: AgentState) -> dict:
    """Retrieve treatment recommendations from database or generate via LLM."""
    disease = state.get("disease_detected")
    crop = state.get("crop_type")

    if not disease:
        prompt = (
            f"Provide general care tips for {crop or 'plants'} in a friendly, helpful tone. "
            "Keep it concise and practical."
        )
        return {"treatment_plan": _call_llm(prompt)}

    try:
        resp = httpx.get(
            f"{_API_BASE}/api/treatments/search",
            params={"disease": disease, "crop": crop},
            timeout=5.0,
        )
        if resp.status_code == 200:
            treatments = resp.json()
            if treatments:
                return {
                    "context_docs": treatments,
                    "treatment_plan": treatments[0].get("treatment_details"),
                }
    except Exception as e:
        print(f"Treatment retrieval error: {e}")

    # Fallback to LLM
    prompt = f"""Provide detailed treatment recommendations for:
Crop: {crop or 'Unknown'}
Disease: {disease}

Include:
1. Immediate actions
2. Organic treatments
3. Chemical treatments (if necessary)
4. Prevention tips

Be specific and actionable. Keep each section readable with short bullets."""
    return {"treatment_plan": _call_llm(prompt)}


def generate_response(state: AgentState) -> dict:
    """Generate final conversational response."""
    messages = state["messages"]
    treatment = state.get("treatment_plan")
    disease = state.get("disease_detected")
    confidence = state.get("confidence")

    if treatment and disease:
        treatment_msg = f"\n\n🔬 **Diagnosis**: {disease}"
        if confidence:
            treatment_msg += f" (Confidence: {confidence:.1%})"
        treatment_msg += f"\n\n💡 **Treatment Plan**:\n{treatment}"
        return {"messages": list(messages) + [AIMessage(content=treatment_msg)]}

    # Standard LLM response for general queries
    user_text = "\n".join(getattr(m, "content", str(m)) for m in messages)
    reply = _call_llm(user_text)
    return {"messages": list(messages) + [AIMessage(content=reply)]}


def route_after_classify(state: AgentState) -> Literal["retrieve", "respond"]:
    """Route to retrieve if image was processed, otherwise respond directly."""
    return "retrieve" if state.get("image_data") else "respond"


# ═══════════════════════════════════════
# Build the graph
# ═══════════════════════════════════════
workflow = StateGraph(AgentState)

workflow.add_node("classify", classify_image)
workflow.add_node("retrieve", retrieve_treatments)
workflow.add_node("respond", generate_response)

workflow.set_entry_point("classify")

workflow.add_conditional_edges(
    "classify",
    route_after_classify,
    {"retrieve": "retrieve", "respond": "respond"},
)

workflow.add_edge("retrieve", "respond")
workflow.add_edge("respond", END)

agri_bot_agent = workflow.compile()
