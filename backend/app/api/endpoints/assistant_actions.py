from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.db.repository import repo
from app.services.audit_service import audit_service
from app.auth.rbac import get_current_user, require_permission, PERM_EXECUTE_BLOCK, PERM_INVESTIGATE_CASES, has_permission

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant Guardrails"])

class AssistantActionRequest(BaseModel):
    action_type: str  # BLOCK_TRANSACTION, ESCALATE_CASE, FLAG_MERCHANT
    entity_id: str
    reason: Optional[str] = "Executed via AI Assistant Verified Action"

@router.post("/execute-action")
def execute_verified_assistant_action(
    payload: AssistantActionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Server-side validation gateway preventing hallucinated actions:
    1. Validates user RBAC permission for requested action.
    2. Validates that the entity actually exists in verified database records.
    3. Executes atomic state mutation.
    4. Records an immutable, cryptographically chained audit log.
    """
    action = payload.action_type.upper()
    entity_id = payload.entity_id.strip()

    # Step 1: RBAC Permission Check
    if action == "BLOCK_TRANSACTION":
        if not has_permission(user["role"], PERM_EXECUTE_BLOCK):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{user['role']}' lacks permission to execute BLOCK_TRANSACTION."
            )
        # Step 2: Ground-Truth Entity Verification
        txn = repo.get_transaction(entity_id)
        if not txn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hallucination Guardrail Triggered: Transaction '{entity_id}' does not exist in verified database."
            )
        # Step 3: Execution
        result = repo.block_transaction(entity_id, actor=user["name"], role=user["role"])
        return {
            "success": True,
            "action": action,
            "entity_id": entity_id,
            "verified": True,
            "message": f"Successfully blocked verified transaction {entity_id}.",
            "details": result
        }

    elif action == "ESCALATE_CASE":
        if not has_permission(user["role"], PERM_INVESTIGATE_CASES):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{user['role']}' lacks permission to ESCALATE_CASE."
            )
        case = repo.get_case(entity_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hallucination Guardrail Triggered: Case '{entity_id}' does not exist in verified database."
            )
        updated = repo.update_case(
            entity_id,
            {"status": "ESCALATED", "priority": "CRITICAL", "note": payload.reason},
            actor=user["name"],
            role=user["role"]
        )
        return {
            "success": True,
            "action": action,
            "entity_id": entity_id,
            "verified": True,
            "message": f"Successfully escalated verified case {entity_id}.",
            "case": updated
        }

    elif action == "FLAG_MERCHANT":
        if not has_permission(user["role"], PERM_INVESTIGATE_CASES):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{user['role']}' lacks permission to FLAG_MERCHANT."
            )
        merchant = repo.get_merchant(entity_id)
        if not merchant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hallucination Guardrail Triggered: Merchant '{entity_id}' does not exist in verified database."
            )
        audit_service.log_action(
            actor=user["name"],
            role=user["role"],
            action="FLAG_MERCHANT",
            target=entity_id,
            details=f"Merchant {merchant['name']} flagged for enhanced fraud scrutiny via AI assistant."
        )
        return {
            "success": True,
            "action": action,
            "entity_id": entity_id,
            "verified": True,
            "message": f"Merchant {merchant['name']} successfully flagged for enhanced scrutiny."
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported assistant action: '{action}'."
        )
