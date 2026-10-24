from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ModelHealthMetric(BaseModel):
    model_name: str
    version: str
    status: str  # HEALTHY, DRIFT_DETECTED, RETRAINING_RECOMMENDED
    precision: float
    recall: float
    f1_score: float
    pr_auc: float
    latency_ms: float
    data_drift_level: str  # Low, Medium, High
    prediction_drift_level: str
    last_retrained: str

class ThresholdConfig(BaseModel):
    low_risk_max: float = 0.30
    medium_risk_max: float = 0.60
    high_risk_max: float = 0.80
    critical_risk_min: float = 0.80

class ModelComparisonRow(BaseModel):
    model_name: str
    precision: float
    recall: float
    f1_score: float
    pr_auc: float
    latency_ms: float
    status: str

class MLOpsOverview(BaseModel):
    active_models: List[ModelHealthMetric]
    thresholds: ThresholdConfig
    comparison_matrix: List[ModelComparisonRow]
    total_predictions_24h: int
    avg_latency_ms: float
    fraud_rate_percentage: float
