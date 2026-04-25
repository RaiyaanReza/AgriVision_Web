"""
AgriBot Chat Agent - LangGraph Implementation
Orchestrates image classification, disease detection, and RAG-based treatment recommendations
"""

from typing import TypedDict, Annotated, Literal, Sequence
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import httpx
import base64
from config import settings

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite-preview",
    temperature=0.7,
    google_api_key=settings.GEMINI_API_KEY,
)


class AgentState(TypedDict):
    """State for the chat agent"""

    messages: Sequence[BaseMessage]
    image_data: str | None
    crop_type: str | None
    disease_detected: str | None
    confidence: float | None
    treatment_plan: str | None
    context_docs: list[dict] | None


async def classify_image(state: AgentState) -> dict:
    """Call the crop classifier API if image is present"""
    if not state.get("image_data"):
        return {"crop_type": None, "disease_detected": None}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.API_BASE_URL}/predict",
                files={
                    "file": (
                        "image.jpg",
                        base64.b64decode(state["image_data"]),
                        "image/jpeg",
                    )
                },
                timeout=30.0,
            )
            result = response.json()

            return {
                "crop_type": result.get("crop_type"),
                "disease_detected": result.get("disease"),
                "confidence": result.get("confidence"),
            }
    except Exception as e:
        print(f"Classification error: {e}")
        return {"crop_type": None, "disease_detected": None}


async def retrieve_treatments(state: AgentState) -> dict:
    """Retrieve treatment recommendations from database or generate via LLM"""
    disease = state.get("disease_detected")
    crop = state.get("crop_type")

    if not disease:
        # No disease detected, provide general care tips
        prompt = f"""Provide general care tips for {crop or 'plants'} in a friendly, helpful tone.
        Keep it concise (3-4 points). Respond in the same language as the user's message."""

        response = llm.invoke(prompt)
        return {"treatment_plan": response.content}

    try:
        # Try to get from database first
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.API_BASE_URL}/treatments/search",
                params={"disease": disease, "crop": crop},
                timeout=5.0,
            )
            if response.status_code == 200:
                treatments = response.json()
                if treatments:
                    return {
                        "context_docs": treatments,
                        "treatment_plan": treatments[0].get("treatment_details"),
                    }
    except:
        pass

    # Fallback: Generate treatment via LLM
    prompt = f"""You are an agricultural expert. Provide detailed treatment recommendations for:
    Crop: {crop or 'Unknown'}
    Disease: {disease}
    
    Include:
    1. Immediate actions
    2. Organic treatments
    3. Chemical treatments (if necessary)
    4. Prevention tips
    
    Be specific and actionable. Respond in the same language as the user's message."""

    response = llm.invoke(prompt)
    return {"treatment_plan": response.content}


async def generate_response(state: AgentState) -> dict:
    """Generate final conversational response"""
    messages = state["messages"]
    treatment = state.get("treatment_plan")
    disease = state.get("disease_detected")
    confidence = state.get("confidence")

    if treatment and disease:
        # Append treatment to conversation
        treatment_msg = f"\n\n🔬 **Diagnosis**: {disease}"
        if confidence:
            treatment_msg += f" (Confidence: {confidence:.1%})"
        treatment_msg += f"\n\n💡 **Treatment Plan**:\n{treatment}"

        messages_with_treatment = list(messages) + [AIMessage(content=treatment_msg)]
        return {"messages": messages_with_treatment}

    # Standard LLM response for general queries
    response = llm.invoke(messages)
    return {"messages": list(messages) + [response]}


def route_message(state: AgentState) -> Literal["classify", "retrieve", "respond"]:
    """Route based on whether image is present"""
    if state.get("image_data"):
        return "classify"
    elif state.get("disease_detected"):
        return "retrieve"
    else:
        return "respond"


# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("classify", classify_image)
workflow.add_node("retrieve", retrieve_treatments)
workflow.add_node("respond", generate_response)

# Set entry point
workflow.set_entry_point("classify")

# Add conditional edges
workflow.add_conditional_edges(
    "classify",
    route_message,
    {
        "classify": "retrieve",  # After classification, go to retrieval
        "retrieve": "respond",  # After retrieval, respond
        "respond": END,  # Direct response ends
    },
)

# Add edges
workflow.add_edge("retrieve", "respond")
workflow.add_edge("respond", END)

# Compile
agri_bot_agent = workflow.compile()
