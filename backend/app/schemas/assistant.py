from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any

class ChatMessage(BaseModel):
    id: str
    sender: str  # user, assistant, system
    content: str
    timestamp: str
    citations: Optional[List[str]] = []
    tool_calls: Optional[List[ToolCallLog]] = []
    actions: Optional[List[Dict[str, Any]]] = []
    ground_truth_verified: Optional[bool] = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"
    user_id: Optional[str] = "USR-1001"

class ChatResponse(BaseModel):
    response: ChatMessage
    session_id: str
