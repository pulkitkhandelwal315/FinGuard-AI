from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CustomerProfile(BaseModel):
    customer_id: str
    name: str
    email: str
    phone: str
    risk_score: float
    risk_level: str
    total_transactions: int
    total_volume_inr: float
    fraud_alert_count: int
    linked_devices: List[str]
    known_locations: List[str]
    created_at: str

class MerchantProfile(BaseModel):
    merchant_id: str
    name: str
    category: str
    risk_score: float
    risk_level: str
    total_volume_inr: float
    transaction_count: int
    fraud_rate: float
    chargeback_rate: float
    top_location: str

class DeviceProfile(BaseModel):
    device_id: str
    device_type: str
    os_browser: str
    risk_score: float
    risk_level: str
    linked_accounts: List[str]
    known_ips: List[str]
    velocity_score: float
    first_seen: str
    last_seen: str

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    actor: str
    role: str
    action: str  # RULE_CHANGED, TRANSACTION_BLOCKED, ALERT_RESOLVED, THRESHOLD_UPDATED, CASE_ASSIGNED
    target: str
    details: str
    ip_address: str
