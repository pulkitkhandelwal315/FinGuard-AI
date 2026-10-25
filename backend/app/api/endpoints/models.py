from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.ml.risk_aggregator import risk_aggregator
from app.services.audit_service import audit_service
from app.auth.rbac import get_current_user, require_permission, PERM_MANAGE_ML_THRESHOLDS

router = APIRouter(prefix="/api/models", tags=["MLOps & Model Monitoring"])

@router.get("/metrics")
def get_mlops_metrics():
    return {
        "active_models": [
            {
                "model_name": "XGBoost Classifier v4",
                "version": "v4.2.0",
                "status": "HEALTHY",
                "precision": 0.89,
                "recall": 0.86,
                "f1_score": 0.87,
                "pr_auc": 0.92,
                "latency_ms": 84.2,
                "data_drift_level": "Low",
                "prediction_drift_level": "Medium",
                "last_retrained": "2026-08-20"
            },
            {
                "model_name": "Isolation Forest Anomaly v2",
                "version": "v2.1.0",
                "status": "HEALTHY",
                "precision": 0.84,
                "recall": 0.81,
                "f1_score": 0.82,
                "pr_auc": 0.88,
                "latency_ms": 32.5,
                "data_drift_level": "Low",
                "prediction_drift_level": "Low",
                "last_retrained": "2026-08-18"
            },
            {
                "model_name": "PyTorch LSTM Sequence v3",
                "version": "v3.0.1",
                "status": "HEALTHY",
                "precision": 0.86,
                "recall": 0.83,
                "f1_score": 0.84,
                "pr_auc": 0.89,
                "latency_ms": 112.0,
                "data_drift_level": "Medium",
                "prediction_drift_level": "Low",
                "last_retrained": "2026-08-15"
            }
        ],
        "thresholds": {
            "low_risk_max": risk_aggregator.low_max,
            "medium_risk_max": risk_aggregator.med_max,
            "high_risk_max": risk_aggregator.high_max,
            "critical_risk_min": 0.80
        },
        "comparison_matrix": [
            {"model_name": "Logistic Regression", "precision": 0.71, "recall": 0.68, "f1_score": 0.69, "pr_auc": 0.73, "latency_ms": 12.0, "status": "Deprecated"},
            {"model_name": "Random Forest", "precision": 0.82, "recall": 0.79, "f1_score": 0.80, "pr_auc": 0.84, "latency_ms": 45.0, "status": "Staging"},
            {"model_name": "Isolation Forest", "precision": 0.84, "recall": 0.81, "f1_score": 0.82, "pr_auc": 0.88, "latency_ms": 32.5, "status": "Production"},
            {"model_name": "XGBoost Classifier", "precision": 0.89, "recall": 0.86, "f1_score": 0.87, "pr_auc": 0.92, "latency_ms": 84.2, "status": "Production"}
        ],
        "pr_curve_data": [
            {"recall": 0.1, "precision": 0.98},
            {"recall": 0.3, "precision": 0.95},
            {"recall": 0.5, "precision": 0.92},
            {"recall": 0.7, "precision": 0.89},
            {"recall": 0.86, "precision": 0.87},
            {"recall": 0.95, "precision": 0.74},
            {"recall": 1.0, "precision": 0.52}
        ],
        "confusion_matrix": {
            "true_positive": 158,
            "false_positive": 24,
            "true_negative": 12620,
            "false_negative": 40
        },
        "total_predictions_24h": 12842,
        "avg_latency_ms": 76.2,
        "fraud_rate_percentage": 1.82
    }

@router.post("/thresholds")
def update_thresholds(
    config: dict,
    user: Dict[str, Any] = Depends(require_permission(PERM_MANAGE_ML_THRESHOLDS))
):
    old_thresholds = {
        "low_risk_max": risk_aggregator.low_max,
        "medium_risk_max": risk_aggregator.med_max,
        "high_risk_max": risk_aggregator.high_max,
    }

    if "high_risk_max" in config:
        risk_aggregator.high_max = float(config["high_risk_max"])
    if "medium_risk_max" in config:
        risk_aggregator.med_max = float(config["medium_risk_max"])
    if "low_risk_max" in config:
        risk_aggregator.low_max = float(config["low_risk_max"])

    new_thresholds = {
        "low_risk_max": risk_aggregator.low_max,
        "medium_risk_max": risk_aggregator.med_max,
        "high_risk_max": risk_aggregator.high_max,
    }

    audit_service.log_action(
        actor=user["name"],
        role=user["role"],
        action="UPDATE_ML_THRESHOLDS",
        target="RiskAggregator",
        details=f"Thresholds changed from {old_thresholds} to {new_thresholds}."
    )

    return {
        "message": "Fraud detection risk classification thresholds updated successfully.",
        "thresholds": {
            "low_risk_max": risk_aggregator.low_max,
            "medium_risk_max": risk_aggregator.med_max,
            "high_risk_max": risk_aggregator.high_max,
            "critical_risk_min": 0.80
        }
    }
