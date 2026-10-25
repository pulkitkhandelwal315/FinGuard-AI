from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "ADMIN"

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "USER"

@router.post("/login")
def login(payload: LoginRequest):
    user_name = "Pulkit Khandelwal" if payload.email == "admin@finguard.ai" else payload.email.split("@")[0].capitalize()
    role = payload.role or "ADMIN"

    audit_service.log_action(
        actor=user_name,
        role=role,
        action="USER_LOGIN",
        target=payload.email,
        details=f"User logged in with role {role}."
    )

    return {
        "access_token": "mock_jwt_access_token_finguard_ai_2026",
        "token_type": "bearer",
        "user": {
            "id": "USR-1001",
            "name": user_name,
            "email": payload.email,
            "role": role,
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Pulkit"
        }
    }

@router.post("/signup")
def signup(payload: SignupRequest):
    role = payload.role or "USER"

    audit_service.log_action(
        actor=payload.name,
        role=role,
        action="USER_SIGNUP",
        target=payload.email,
        details=f"New account created with role {role}."
    )

    return {
        "message": "User account created successfully.",
        "user": {
            "id": f"USR-{payload.name[:3].upper()}-2026",
            "name": payload.name,
            "email": payload.email,
            "role": role
        }
    }

@router.get("/me")
def get_current_user(role: Optional[str] = "ADMIN"):
    return {
        "user": {
            "id": "USR-1001",
            "name": "Pulkit Khandelwal",
            "email": "pulkit@finguard.ai",
            "role": role.upper() if role else "ADMIN",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Pulkit"
        }
    }
