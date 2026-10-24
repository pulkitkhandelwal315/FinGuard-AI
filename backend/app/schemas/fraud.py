from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FeatureContribution(BaseModel):
    feature_name: str
    impact_percentage: float
    is_risk_increasing: bool
    description: str

class RuleTriggered(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    description: str

class FraudAnalysisResult(BaseModel):
    transaction_id: str
    amount: float
    merchant: str
    xgboost_score: float
    isolation_forest_score: float
    lstm_sequence_score: float
    rule_score: float
    final_risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    triggered_rules: List[RuleTriggered]
    feature_contributions: List[FeatureContribution]
    explanation_text: str
    timestamp: str

class FraudRule(BaseModel):
    id: str
    name: str
    condition: str
    risk_level: str
    is_active: bool
    created_by: str
