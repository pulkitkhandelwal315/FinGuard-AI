from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from app.api.endpoints.transactions import TRANSACTION_STORE
from app.services.feature_engineering import feature_pipeline
from app.ml.xgboost_classifier import xgboost_model
from app.ml.isolation_forest import isolation_forest_model
from app.ml.lstm_behavioral import lstm_model
from app.ml.rule_engine import rule_engine, DEFAULT_RULES
from app.ml.risk_aggregator import risk_aggregator
from app.ml.shap_explainer import shap_explainer
from app.db.repository import repo
from app.auth.rbac import require_permission, PERM_EDIT_RULES, PERM_EXECUTE_BLOCK, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/fraud", tags=["Fraud Analytics"])

@router.get("/high-risk")
def get_high_risk_queue(limit: int = 20):
    high_risk = [t for t in TRANSACTION_STORE if t.get("risk_level") in ["HIGH", "CRITICAL"]]
    return {
        "total_high_risk": len(high_risk),
        "high_risk_transactions": high_risk[:limit]
    }

@router.get("/rules")
def get_fraud_rules():
    db_rules = repo.get_rules()
    return {"rules": db_rules if db_rules else DEFAULT_RULES}

@router.post("/rules/simulate")
def simulate_fraud_rule(candidate_rule: Dict[str, Any]):
    """Simulates impact of a candidate rule against historical transactions before going live."""
    db_txns, _ = repo.get_transactions(page=1, limit=500)
    txns = db_txns if db_txns else TRANSACTION_STORE
    simulation = rule_engine.simulate_rule(candidate_rule, txns)
    return {
        "candidate_rule": candidate_rule,
        "simulation": simulation
    }

@router.post("/rules/conflicts")
def check_rule_conflicts(candidate_rule: Dict[str, Any]):
    """Checks for contradictions or redundant rules against currently active rules."""
    active_rules = repo.get_rules() or DEFAULT_RULES
    conflicts = rule_engine.detect_conflicts(candidate_rule, active_rules)
    return {
        "has_conflicts": len(conflicts) > 0,
        "conflict_count": len(conflicts),
        "conflicts": conflicts
    }

@router.post("/rules")
def create_or_update_rule(
    payload: Dict[str, Any],
    user: Dict[str, Any] = Depends(require_permission(PERM_EDIT_RULES))
):
    """Creates or updates a fraud rule with versioning. Requires ADMIN role."""
    saved_rule = repo.upsert_rule(payload, actor=user["name"], role=user["role"])

    audit_service.log_action(
        actor=user["name"],
        role=user["role"],
        action="CREATE_UPDATE_FRAUD_RULE",
        target=saved_rule["rule_id"],
        details=f"Rule {saved_rule['rule_id']} v{saved_rule['version']} activated. Payload: {payload.get('rule_name', 'unnamed')}."
    )

    return {
        "message": f"Rule {saved_rule['rule_id']} v{saved_rule['version']} successfully activated.",
        "rule": saved_rule
    }

@router.post("/block-transaction")
def execute_block_transaction(
    payload: Dict[str, Any],
    user: Dict[str, Any] = Depends(require_permission(PERM_EXECUTE_BLOCK))
):
    """Atomically blocks a transaction across ledgers, resolves alerts, and logs chained audit entry. Requires SENIOR_ANALYST or ADMIN."""
    txn_id = payload.get("transaction_id")
    if not txn_id:
        raise HTTPException(status_code=400, detail="Missing transaction_id in payload.")

    try:
        result = repo.block_transaction(txn_id, actor=user["name"], role=user["role"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/analyze")
def analyze_transaction(txn_data: Dict[str, Any]):
    features = feature_pipeline.extract_features(txn_data, TRANSACTION_STORE[:100])
    
    xgb_score = xgboost_model.predict_proba(features)
    iso_score = isolation_forest_model.predict_anomaly_score(features)
    lstm_score = lstm_model.predict_sequence_risk(features, [1000.0, 1200.0, 1500.0])
    rules_triggered = rule_engine.evaluate_rules(features)
    
    final_score, risk_level, rule_score = risk_aggregator.aggregate(xgb_score, iso_score, lstm_score, rules_triggered)
    contributions, explanation = shap_explainer.explain(features, final_score)

    return {
        "transaction_id": txn_data.get("transaction_id", "TXN-RAW"),
        "amount": txn_data.get("amount", 0.0),
        "merchant": txn_data.get("merchant", "Unknown"),
        "xgboost_score": xgb_score,
        "isolation_forest_score": iso_score,
        "lstm_sequence_score": lstm_score,
        "rule_score": rule_score,
        "final_risk_score": final_score,
        "risk_level": risk_level,
        "triggered_rules": rules_triggered,
        "feature_contributions": contributions,
        "explanation_text": explanation
    }
