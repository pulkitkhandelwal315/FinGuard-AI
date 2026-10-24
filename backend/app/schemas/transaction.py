from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TransactionBase(BaseModel):
    transaction_id: str
    timestamp: str
    amount: float
    currency: str = "INR"
    merchant: str
    merchant_category: str
    payment_method: str
    location: str
    account_id: str
    customer_id: str
    device_id: str
    ip_address: str
    transaction_type: str = "PAYMENT"
    status: str = "COMPLETED"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country: Optional[str] = "India"
    device_type: Optional[str] = "Mobile"

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    created_at: str
    fraud_probability: Optional[float] = None
    anomaly_score: Optional[float] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = "LOW"
    status_flag: Optional[str] = "NORMAL"

class DataValidationReport(BaseModel):
    total_rows: int
    valid_count: int
    invalid_count: int
    duplicate_count: int
    errors: List[Dict[str, Any]] = []

class TransactionUploadResponse(BaseModel):
    message: str
    report: DataValidationReport
    processed_transactions: int
