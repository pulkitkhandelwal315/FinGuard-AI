from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.db.repository import repo
from app.auth.rbac import get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(severity: Optional[str] = None):
    alerts = repo.get_alerts(severity=severity)

    return {
        "total_alerts": len(alerts),
        "critical_count": sum(1 for a in alerts if a["severity"] == "CRITICAL"),
        "high_count": sum(1 for a in alerts if a["severity"] == "HIGH"),
        "medium_count": sum(1 for a in alerts if a["severity"] == "MEDIUM"),
        "alerts": alerts[:50]
    }

@router.patch("/{alert_id}")
def update_alert_status(
    alert_id: str,
    payload: dict,
    user: Dict[str, Any] = Depends(get_current_user)
):
    new_status = payload.get("status", "RESOLVED")
    updated = repo.update_alert_status(alert_id, new_status, actor=user["name"], role=user["role"])

    audit_service.log_action(
        actor=user["name"],
        role=user["role"],
        action="UPDATE_ALERT_STATUS",
        target=alert_id,
        details=f"Alert status changed to {new_status}."
    )

    if not updated:
        # Fallback response if alert was from legacy mock
        return {
            "alert_id": alert_id,
            "status": new_status,
            "updated_at": datetime.now().isoformat()
        }
    return updated
