from enum import Enum
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, Header, Depends, status

class UserRole(str, Enum):
    ANALYST = "ANALYST"
    SENIOR_ANALYST = "SENIOR_ANALYST"
    ADMIN = "ADMIN"
    AUDITOR = "AUDITOR"

# Fine-Grained Permissions
PERM_RECOMMEND_BLOCK = "RECOMMEND_BLOCK"
PERM_EXECUTE_BLOCK = "EXECUTE_BLOCK"
PERM_EDIT_RULES = "EDIT_RULES"
PERM_MANAGE_ML_THRESHOLDS = "MANAGE_ML_THRESHOLDS"
PERM_VIEW_UNMASKED_PII = "VIEW_UNMASKED_PII"
PERM_VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS"
PERM_INVESTIGATE_CASES = "INVESTIGATE_CASES"

ROLE_PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.ANALYST: [
        PERM_RECOMMEND_BLOCK,
        PERM_INVESTIGATE_CASES,
    ],
    UserRole.SENIOR_ANALYST: [
        PERM_RECOMMEND_BLOCK,
        PERM_EXECUTE_BLOCK,
        PERM_INVESTIGATE_CASES,
        PERM_VIEW_UNMASKED_PII,
        PERM_VIEW_AUDIT_LOGS,
    ],
    UserRole.ADMIN: [
        PERM_RECOMMEND_BLOCK,
        PERM_EXECUTE_BLOCK,
        PERM_EDIT_RULES,
        PERM_MANAGE_ML_THRESHOLDS,
        PERM_VIEW_UNMASKED_PII,
        PERM_VIEW_AUDIT_LOGS,
        PERM_INVESTIGATE_CASES,
    ],
    UserRole.AUDITOR: [
        PERM_VIEW_AUDIT_LOGS,
    ]
}

def has_permission(role: str, permission: str) -> bool:
    try:
        user_role = UserRole(role.upper())
        return permission in ROLE_PERMISSIONS.get(user_role, [])
    except ValueError:
        return False

def get_current_user(
    x_user_role: Optional[str] = Header("ADMIN", alias="X-User-Role"),
    x_user_email: Optional[str] = Header("admin@finguard.ai", alias="X-User-Email"),
    x_user_name: Optional[str] = Header("Admin User", alias="X-User-Name")
) -> Dict[str, Any]:
    role_str = (x_user_role or "ADMIN").upper()
    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.ANALYST

    return {
        "name": x_user_name or "Analyst",
        "email": x_user_email or "analyst@finguard.ai",
        "role": role.value,
        "permissions": ROLE_PERMISSIONS.get(role, [])
    }

def require_permission(permission: str):
    def dependency(user: Dict[str, Any] = Depends(get_current_user)):
        if not has_permission(user["role"], permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{user['role']}' lacks permission '{permission}'."
            )
        return user
    return dependency

def mask_email(email: str) -> str:
    if not email or "@" not in email:
        return "***"
    user_part, domain = email.split("@", 1)
    if len(user_part) <= 2:
        masked_user = user_part[0] + "***"
    else:
        masked_user = user_part[0] + "***" + user_part[-1]
    return f"{masked_user}@{domain}"

def mask_phone(phone: str) -> str:
    if not phone or len(phone) < 6:
        return "***"
    return phone[:6] + "***" + phone[-3:]

def apply_pii_masking(customer: Dict[str, Any], role: str) -> Dict[str, Any]:
    """Masks customer PII unless role has PERM_VIEW_UNMASKED_PII."""
    if has_permission(role, PERM_VIEW_UNMASKED_PII):
        return customer

    masked = dict(customer)
    if "phone" in masked:
        masked["phone"] = mask_phone(masked["phone"])
    if "email" in masked:
        masked["email"] = mask_email(masked["email"])
    masked["pii_masked"] = True
    return masked
