from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, Dict, Any
from app.db.repository import repo
from app.services.audit_service import audit_service
from app.auth.rbac import get_current_user, apply_pii_masking, require_permission, PERM_VIEW_AUDIT_LOGS

router = APIRouter(prefix="/api/entities", tags=["Entities & Audit Logs"])

@router.get("/customers")
def get_customers(user: Dict[str, Any] = Depends(get_current_user)):
    customers = repo.get_customers()
    masked_customers = [apply_pii_masking(c, user["role"]) for c in customers]
    return {
        "total": len(masked_customers),
        "customers": masked_customers
    }

@router.get("/customers/{cust_id}")
def get_customer_detail(cust_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    customer = repo.get_customer(cust_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {cust_id} not found.")

    txns, _ = repo.get_transactions(limit=10, search=cust_id)
    masked_customer = apply_pii_masking(customer, user["role"])

    return {
        "customer": masked_customer,
        "recent_transactions": txns
    }

@router.get("/merchants")
def get_merchants():
    merchants = repo.get_merchants()
    return {"total": len(merchants), "merchants": merchants}

@router.get("/merchants/{merchant_id}")
def get_merchant_detail(merchant_id: str):
    merchant = repo.get_merchant(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant {merchant_id} not found.")

    txns, _ = repo.get_transactions(limit=10, search=merchant["name"])
    return {
        "merchant": merchant,
        "recent_transactions": txns
    }

@router.get("/devices")
def get_devices():
    devices = repo.get_devices()
    return {"total": len(devices), "devices": devices}

@router.get("/devices/{device_id}")
def get_device_detail(device_id: str):
    device = repo.get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found.")

    txns, _ = repo.get_transactions(limit=10, search=device_id)
    return {
        "device": device,
        "recent_transactions": txns
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 100):
    logs = audit_service.get_all_logs(limit)
    return {
        "total": len(logs),
        "audit_logs": logs
    }

@router.get("/audit-logs/verify")
def verify_audit_chain():
    """Traverses the SHA-256 cryptographic chain to detect any tampering or unauthorized mutations."""
    verification = audit_service.verify_chain_integrity()
    return verification
