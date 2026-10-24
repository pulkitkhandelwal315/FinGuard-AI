from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.api.endpoints.transactions import TRANSACTION_STORE

router = APIRouter(prefix="/api/investigations", tags=["Fraud Investigations"])

INVESTIGATION_CASES = [
    {
        "case_id": "CASE-10231",
        "transaction_id": "TXN-94821",
        "customer_id": "CUST-1042",
        "amount": 48250.0,
        "merchant": "XYZ Electronics",
        "risk_score": 0.87,
        "status": "UNDER_INVESTIGATION",
        "priority": "HIGH",
        "assigned_analyst": "Admin",
        "created_at": "2026-08-24T10:21:00Z",
        "updated_at": "2026-08-24T10:31:00Z",
        "timeline": [
            {"id": "EV-1", "timestamp": "10:21 AM", "title": "Transaction initiated", "description": "₹48,250 transaction attempted at XYZ Electronics", "actor": "System", "event_type": "TXN"},
            {"id": "EV-2", "timestamp": "10:21 AM", "title": "New device detected", "description": "Unrecognized hardware fingerprint DEV-NEW-9841", "actor": "System", "event_type": "DEVICE"},
            {"id": "EV-3", "timestamp": "10:21 AM", "title": "Risk score generated", "description": "Ensemble ML model computed 87% fraud risk score", "actor": "ML Engine", "event_type": "SCORE"},
            {"id": "EV-4", "timestamp": "10:22 AM", "title": "Alert generated", "description": "CRITICAL alert routed to Fraud Monitoring Center", "actor": "Alert Engine", "event_type": "ALERT"},
            {"id": "EV-5", "timestamp": "10:24 AM", "title": "Analyst opened case", "description": "Assigned to Senior Analyst Admin", "actor": "Admin", "event_type": "CASE"},
            {"id": "EV-6", "timestamp": "10:31 AM", "title": "Marked suspicious", "description": "Investigator flagged for secondary authentication check", "actor": "Admin", "event_type": "NOTE"}
        ],
        "notes": [
            {"id": "N-1", "author": "Admin", "text": "Customer confirmed device change in progress. Awaiting OTP verification log.", "timestamp": "2026-08-24T10:30:00Z"}
        ]
    },
    {
        "case_id": "CASE-10232",
        "transaction_id": "TXN-82147",
        "customer_id": "CUST-1088",
        "amount": 76000.0,
        "merchant": "Apex Crypto Exchange",
        "risk_score": 0.91,
        "status": "OPEN",
        "priority": "CRITICAL",
        "assigned_analyst": "Unassigned",
        "created_at": "2026-08-24T11:05:00Z",
        "updated_at": "2026-08-24T11:05:00Z",
        "timeline": [
            {"id": "EV-10", "timestamp": "11:05 AM", "title": "Transaction initiated", "description": "₹76,000 crypto purchase from overseas IP", "actor": "System", "event_type": "TXN"}
        ],
        "notes": []
    }
]

from app.db.repository import repo
from app.auth.rbac import get_current_user

@router.get("")
def get_cases(status: Optional[str] = None):
    db_cases = repo.get_cases(status=status)
    cases = db_cases if db_cases else INVESTIGATION_CASES
    if status and status != "ALL":
        cases = [c for c in cases if c["status"] == status]
    return {
        "total_cases": len(cases),
        "cases": cases
    }

@router.get("/{case_id}")
def get_case_detail(case_id: str):
    db_case = repo.get_case(case_id)
    case = db_case
    if not case:
        found = [c for c in INVESTIGATION_CASES if c["case_id"].upper() == case_id.upper()]
        if not found:
            raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
        case = found[0]
    
    # Construct Entity Graph Nodes & Edges (Same Device, IP, Merchant, Account)
    network_graph = {
        "nodes": [
            {"id": case["transaction_id"], "label": case["transaction_id"], "type": "TRANSACTION", "risk_level": "HIGH"},
            {"id": case["customer_id"], "label": case["customer_id"], "type": "CUSTOMER", "risk_level": "LOW"},
            {"id": "DEV-NEW-9841", "label": "DEV-NEW-9841", "type": "DEVICE", "risk_level": "HIGH"},
            {"id": "185.220.101.5", "label": "185.220.101.5", "type": "IP", "risk_level": "CRITICAL"},
            {"id": case["merchant"], "label": case["merchant"], "type": "MERCHANT", "risk_level": "MEDIUM"},
            {"id": "TXN-94815", "label": "TXN-94815 (₹12K)", "type": "TRANSACTION", "risk_level": "MEDIUM"},
            {"id": "TXN-94819", "label": "TXN-94819 (₹35K)", "type": "TRANSACTION", "risk_level": "HIGH"}
        ],
        "edges": [
            {"source": case["transaction_id"], "target": case["customer_id"], "relationship": "Same Customer"},
            {"source": case["transaction_id"], "target": "DEV-NEW-9841", "relationship": "Same Device"},
            {"source": case["transaction_id"], "target": "185.220.101.5", "relationship": "Same IP"},
            {"source": case["transaction_id"], "target": case["merchant"], "relationship": "Merchant"},
            {"source": "DEV-NEW-9841", "target": "TXN-94815", "relationship": "Linked Device"},
            {"source": "185.220.101.5", "target": "TXN-94819", "relationship": "Linked IP"}
        ]
    }
    
    return {
        "case": case,
        "network_graph": network_graph
    }

@router.patch("/{case_id}")
def update_case_status(
    case_id: str,
    payload: dict,
    user: Dict[str, Any] = Depends(get_current_user)
):
    updated = repo.update_case(case_id, payload, actor=user["name"], role=user["role"])
    if updated:
        return {"message": "Case updated successfully", "case": updated}

    # Fallback for memory cases
    for c in INVESTIGATION_CASES:
        if c["case_id"].upper() == case_id.upper():
            if payload.get("status"):
                c["status"] = payload["status"]
            if payload.get("priority"):
                c["priority"] = payload["priority"]
            if payload.get("note"):
                c["notes"].append({
                    "id": f"N-{len(c['notes'])+1}",
                    "author": f"{user['name']} ({user['role']})",
                    "text": payload["note"],
                    "timestamp": datetime.now().isoformat()
                })
            c["updated_at"] = datetime.now().isoformat()
            return {"message": "Case updated successfully", "case": c}

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
