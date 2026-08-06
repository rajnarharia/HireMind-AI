from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def hr_chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    # Placeholder for HR chatbot AI logic
    return {
        "response": f"This is an AI response to: {request.message}. How else can I help you prepare for your interviews?",
        "source": "hr-chatbot"
    }
