from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    title: str
    description: str
    actor: str
    event_type: str

class EntityNode(BaseModel):
    id: str
    label: str
    type: str  # CUSTOMER, TRANSACTION, DEVICE, IP, MERCHANT, ACCOUNT
    risk_level: Optional[str] = "LOW"

class EntityEdge(BaseModel):
    source: str
    target: str
    relationship: str

class NetworkGraphData(BaseModel):
    nodes: List[EntityNode]
    edges: List[EntityEdge]

class InvestigationCase(BaseModel):
    case_id: str
    transaction_id: str
    customer_id: str
    amount: float
    merchant: str
    risk_score: float
    status: str  # OPEN, UNDER_INVESTIGATION, CLOSED_FRAUD, CLOSED_LEGITIMATE, ESCALATED
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    assigned_analyst: str
    created_at: str
    updated_at: str
    timeline: List[TimelineEvent]
    notes: List[Dict[str, Any]]
    network_graph: Optional[NetworkGraphData] = None
