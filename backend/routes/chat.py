"""
Chat API Routes with Streaming Support
Provides real-time chat with AgriBot agent
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, AsyncGenerator
import json
import base64
from io import BytesIO

from agents.chat_agent import agri_bot_agent
from langchain_core.messages import HumanMessage

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message request model"""
    message: str
    image_data: Optional[str] = None  # Base64 encoded image


async def stream_response(message: str, image_data: Optional[str] = None) -> AsyncGenerator[str, None]:
    """Stream chat response token by token"""
    
    try:
        # Prepare state
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "image_data": image_data,
            "crop_type": None,
            "disease_detected": None,
            "confidence": None,
            "treatment_plan": None,
            "context_docs": None
        }
        
        # Run the agent
        result = await agri_bot_agent.ainvoke(initial_state)
        
        # Stream the final response
        if result.get("messages"):
            last_message = result["messages"][-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            
            # Simulate streaming by yielding chunks
            words = content.split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        yield f"data: {json.dumps({'error': error_msg})}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/stream")
async def chat_stream(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """
    Stream chat response with optional image upload
    Returns Server-Sent Events (SSE) stream
    """
    
    image_data = None
    if image:
        contents = await image.read()
        image_data = base64.b64encode(contents).decode('utf-8')
    
    return StreamingResponse(
        stream_response(message, image_data),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/")
async def chat(request: ChatMessage):
    """
    Non-streaming chat endpoint
    Returns complete response at once
    """
    
    try:
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "image_data": request.image_data,
            "crop_type": None,
            "disease_detected": None,
            "confidence": None,
            "treatment_plan": None,
            "context_docs": None
        }
        
        result = await agri_bot_agent.ainvoke(initial_state)
        
        if result.get("messages"):
            last_message = result["messages"][-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            
            return {
                "response": content,
                "metadata": {
                    "crop_type": result.get("crop_type"),
                    "disease_detected": result.get("disease_detected"),
                    "confidence": result.get("confidence")
                }
            }
        
        raise HTTPException(status_code=500, detail="No response generated")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def chat_health():
    """Check chat service health"""
    return {"status": "healthy", "service": "AgriBot Chat"}
