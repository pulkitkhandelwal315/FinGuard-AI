from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional

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
    return {
        "access_token": "mock_jwt_access_token_finguard_ai_2026",
        "token_type": "bearer",
        "user": {
            "id": "USR-1001",
            "name": "Pulkit Khandelwal" if payload.email == "admin@finguard.ai" else payload.email.split("@")[0].capitalize(),
            "email": payload.email,
            "role": payload.role or "ADMIN",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Pulkit"
        }
    }

@router.post("/signup")
def signup(payload: SignupRequest):
    return {
        "message": "User account created successfully.",
        "user": {
            "id": f"USR-{payload.name[:3].upper()}-2026",
            "name": payload.name,
            "email": payload.email,
            "role": payload.role or "USER"
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
