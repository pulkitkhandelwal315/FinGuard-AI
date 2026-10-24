from fastapi import APIRouter
from app.schemas.assistant import ChatRequest, ChatResponse
from app.ai.assistant import ai_assistant_service
from app.api.endpoints.transactions import TRANSACTION_STORE

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest):
    chat_msg = ai_assistant_service.process_message(request.message, TRANSACTION_STORE)
    return ChatResponse(
        response=chat_msg,
        session_id=request.session_id or "default_session"
    )

@router.get("/history")
def get_chat_history():
    return {
        "history": [
            {
                "id": "MSG-INIT",
                "sender": "assistant",
                "content": "Hello! I am your **FinGuard AI Financial Assistant**. Ask me about transaction risk flags, spending breakdowns, or comparison trends!",
                "timestamp": "2026-08-24T10:00:00Z"
            }
        ]
    }
