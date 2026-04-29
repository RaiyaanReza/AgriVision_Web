"""
LangGraph Router Agent for AgriVision
Orchestrates: Image Classification -> Disease Detection -> Gemini RAG Treatment -> DB Save
"""

from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import base64
import httpx
import json
from pathlib import Path
from config import settings
from services.database import (
    get_manual_session,
    save_prediction,
    save_treatment_recommendation,
)
from models.crop_classifier import CropClassifier
from models.disease_models import DiseaseModelRegistry
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite-preview",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3,
)

# Initialize Models
classifier = CropClassifier()
disease_registry = DiseaseModelRegistry()


class AgentState(TypedDict):
    image_path: str
    image_data: str  # Base64 encoded
    predicted_class: str
    confidence: float
    disease_detected: bool
    treatment_plan: str
    db_session: AsyncSession
    error: str
    crop_type: str


async def classify_image(state: AgentState) -> AgentState:
    """Node: Classify the input image to identify crop type"""
    try:
        print(f"Classifying image: {state['image_path']}")
        result = await classifier.predict(state["image_path"])

        crop_type = result.get("class", "Unknown")
        confidence = result.get("confidence", 0.0)

        # Map crop names if needed (e.g., Wheat -> Rice per config mapping)
        mapped_crop = settings.CROP_NAME_MAPPING.get(crop_type, crop_type)

        return {
            **state,
            "crop_type": mapped_crop,
            "predicted_class": mapped_crop,
            "confidence": confidence,
            "disease_detected": False,
        }
    except Exception as e:
        return {**state, "error": f"Classification failed: {str(e)}"}


async def detect_disease(state: AgentState) -> AgentState:
    """Node: Run disease detection model for the classified crop"""
    try:
        crop_type = state.get("crop_type", "")
        image_path = state["image_path"]

        print(f"Detecting disease for crop={crop_type} image={image_path}")

        if not disease_registry.has_model(crop_type):
            print(f"No disease model for crop={crop_type}, skipping disease detection")
            return {
                **state,
                "predicted_class": crop_type,
                "disease_detected": False,
            }

        result = disease_registry.predict(crop_type, image_path)
        disease_name = result.get("disease", "Unknown")
        confidence = result.get("confidence", 0.0)

        # Check if healthy
        is_disease = True
        if (
            "healthy" in disease_name.lower()
            or "normal" in disease_name.lower()
            or "no_disease" in disease_name.lower()
        ):
            is_disease = False

        predicted_class = (
            f"{crop_type} - {disease_name}" if is_disease else f"{crop_type} - Healthy"
        )

        print(
            f"Disease result: {disease_name} confidence={confidence:.3f} is_disease={is_disease}"
        )

        return {
            **state,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "disease_detected": is_disease,
        }
    except Exception as e:
        print(f"Disease detection error: {e}")
        return {**state, "error": f"Disease detection failed: {str(e)}"}


def route_decision(state: AgentState) -> str:
    """Edge: Decide whether to fetch treatment or end"""
    if state.get("error"):
        return "end"
    if state["disease_detected"]:
        return "fetch_treatment"
    return "end"


async def fetch_treatment(state: AgentState) -> AgentState:
    """Node: Fetch treatment plan from local JSON or use Gemini and save it back"""
    disease = state["predicted_class"]
    crop_type = state.get("crop_type", "")

    # 1. Search local treatments.json
    treatments_path = Path(__file__).resolve().parent.parent.parent / "treatments.json"
    local_treatments = []
    if treatments_path.exists():
        try:
            with open(treatments_path, "r", encoding="utf-8") as f:
                local_treatments = json.load(f)
        except Exception:
            pass

    # Check if exact disease exists
    for item in local_treatments:
        # predicted_class has format "{crop_type} - {disease_name}"
        if (
            item.get("disease_name", "").lower() in disease.lower()
            and item.get("crop_type", "").lower() in crop_type.lower()
        ):
            print(f"Found local treatment for {disease}, skipping Gemini API.")
            return {**state, "treatment_plan": item.get("content")}

    print(f"No local treatment found for {disease}, querying Gemini.")

    prompt = f"""
    You are an expert agricultural scientist. 
    The crop has been diagnosed with: {disease}.
    Provide a concise, actionable treatment plan including:
    1. Immediate actions
    2. Chemical/Organic remedies
    3. Prevention strategies
    Format the response clearly with bullet points. Keep it under 200 words.
    """

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])

        # Handle cases where response.content might be a list (multimodal/structured)
        content = response.content
        if isinstance(content, list):
            treatment_plan = "".join(
                [
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in content
                ]
            )
        else:
            treatment_plan = str(content)

        # Append to treatments.json for future use
        new_id = max([item.get("id", 0) for item in local_treatments], default=0) + 1

        # Extract disease name from predicted_class format: "{crop_type} - {disease_name}"
        disease_split = disease.split(" - ")
        disease_name = disease_split[1] if len(disease_split) > 1 else disease

        new_treatment = {
            "id": new_id,
            "title": f"{crop_type} - {disease_name} Treatment",
            "crop_type": crop_type,
            "disease_name": disease_name,
            "content": treatment_plan,
            "tags": [crop_type, disease_name.replace(" ", "_"), "Generated"],
        }

        local_treatments.append(new_treatment)
        try:
            with open(treatments_path, "w", encoding="utf-8") as f:
                json.dump(local_treatments, f, ensure_ascii=False, indent=2)
            print(f"Saved new treatment to {treatments_path}")
        except Exception as e:
            print(f"Failed to save treatment to {treatments_path}: {e}")

        return {**state, "treatment_plan": treatment_plan}
    except Exception as e:
        return {**state, "treatment_plan": f"Error fetching treatment: {str(e)}"}


async def save_to_database(state: AgentState) -> AgentState:
    """Node: Save prediction and treatment to SQLite (non-fatal)"""
    try:
        async with get_manual_session() as session:
            # Save Prediction
            pred_record = await save_prediction(
                session=session,
                image_path=state["image_path"],
                predicted_class=state["predicted_class"],
                confidence=state["confidence"],
                is_disease=state["disease_detected"],
            )

            # Save Treatment if exists
            if state.get("treatment_plan"):
                await save_treatment_recommendation(
                    session=session,
                    prediction_id=pred_record.id,
                    treatment_text=state["treatment_plan"],
                    source="Gemini AI",
                )

        return state
    except Exception as e:
        # Log but do NOT fail the prediction — the user still gets their diagnosis
        print(f"[WARN] Database save skipped: {e}")
        return state


# Build the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("classify", classify_image)
workflow.add_node("detect_disease", detect_disease)
workflow.add_node("fetch_treatment", fetch_treatment)
workflow.add_node("save_db", save_to_database)

# Add Edges
workflow.set_entry_point("classify")
workflow.add_edge("classify", "detect_disease")
workflow.add_conditional_edges(
    "detect_disease",
    route_decision,
    {
        "fetch_treatment": "fetch_treatment",
        "end": "save_db",  # Even if healthy, we save the prediction
    },
)
workflow.add_edge("fetch_treatment", "save_db")
workflow.add_edge("save_db", END)

# Compile the Agent
agent = workflow.compile()


async def run_agrivision_agent(
    image_path: str, image_base64: str = ""
) -> Dict[str, Any]:
    """
    Main entry point to run the full agentic workflow.
    """
    initial_state = {
        "image_path": image_path,
        "image_data": image_base64,
        "predicted_class": "",
        "confidence": 0.0,
        "disease_detected": False,
        "treatment_plan": "",
        "db_session": None,
        "error": "",
    }

    final_state = await agent.ainvoke(initial_state)

    if final_state.get("error"):
        raise Exception(final_state["error"])

    return {
        "class": final_state["predicted_class"],
        "confidence": final_state["confidence"],
        "is_disease": final_state["disease_detected"],
        "treatment": final_state.get(
            "treatment_plan", "No treatment needed (Healthy)."
        ),
        "status": "success",
    }
