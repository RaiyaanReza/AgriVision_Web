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
from config import settings
from services.database import get_db_session, save_prediction, save_treatment_recommendation
from models.models import CropClassifier
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3
)

# Initialize Classifier
classifier = CropClassifier()

class AgentState(TypedDict):
    image_path: str
    image_data: str  # Base64 encoded
    predicted_class: str
    confidence: float
    disease_detected: bool
    treatment_plan: str
    db_session: AsyncSession
    error: str

async def classify_image(state: AgentState) -> AgentState:
    """Node: Classify the input image"""
    try:
        print(f"Classifying image: {state['image_path']}")
        result = await classifier.predict(state['image_path'])
        
        predicted_class = result.get('class', 'Unknown')
        confidence = result.get('confidence', 0.0)
        
        # Simple logic: if not 'Healthy' or 'Normal', treat as disease
        disease_keywords = ['disease', 'blight', 'rust', 'spot', 'rot', 'mosaic', 'wilt']
        is_disease = any(keyword in predicted_class.lower() for keyword in disease_keywords)
        if 'healthy' in predicted_class.lower() or 'normal' in predicted_class.lower():
            is_disease = False
            
        return {
            **state,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "disease_detected": is_disease
        }
    except Exception as e:
        return {**state, "error": f"Classification failed: {str(e)}"}

def route_decision(state: AgentState) -> str:
    """Edge: Decide whether to fetch treatment or end"""
    if state.get("error"):
        return "end"
    if state["disease_detected"]:
        return "fetch_treatment"
    return "end"

async def fetch_treatment(state: AgentState) -> AgentState:
    """Node: Use Gemini to generate treatment plan based on disease"""
    disease = state["predicted_class"]
    
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
        treatment_plan = response.content
        
        return {
            **state,
            "treatment_plan": treatment_plan
        }
    except Exception as e:
        return {**state, "treatment_plan": f"Error fetching treatment: {str(e)}"}

async def save_to_database(state: AgentState) -> AgentState:
    """Node: Save prediction and treatment to SQLite"""
    try:
        # We need a fresh session or pass one in. For now, we create one here.
        # In a real API context, the session comes from the request.
        async with get_db_session() as session:
            # Save Prediction
            pred_record = await save_prediction(
                session=session,
                image_path=state["image_path"],
                predicted_class=state["predicted_class"],
                confidence=state["confidence"],
                is_disease=state["disease_detected"]
            )
            
            # Save Treatment if exists
            if state.get("treatment_plan"):
                await save_treatment_recommendation(
                    session=session,
                    prediction_id=pred_record.id,
                    treatment_text=state["treatment_plan"],
                    source="Gemini AI"
                )
                
        return state
    except Exception as e:
        print(f"Database save error: {e}")
        return {**state, "error": f"DB Save failed: {str(e)}"}

# Build the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("classify", classify_image)
workflow.add_node("fetch_treatment", fetch_treatment)
workflow.add_node("save_db", save_to_database)

# Add Edges
workflow.set_entry_point("classify")
workflow.add_conditional_edges(
    "classify",
    route_decision,
    {
        "fetch_treatment": "fetch_treatment",
        "end": "save_db" # Even if healthy, we save the prediction
    }
)
workflow.add_edge("fetch_treatment", "save_db")
workflow.add_edge("save_db", END)

# Compile the Agent
agent = workflow.compile()

async def run_agrivision_agent(image_path: str, image_base64: str = "") -> Dict[str, Any]:
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
        "error": ""
    }
    
    final_state = await agent.ainvoke(initial_state)
    
    if final_state.get("error"):
        raise Exception(final_state["error"])
        
    return {
        "class": final_state["predicted_class"],
        "confidence": final_state["confidence"],
        "is_disease": final_state["disease_detected"],
        "treatment": final_state.get("treatment_plan", "No treatment needed (Healthy)."),
        "status": "success"
    }
