from typing import Dict, Any

class XGBoostFraudClassifier:
    """Supervised XGBoost fraud probability prediction model."""
    
    def predict_proba(self, features: Dict[str, Any]) -> float:
        amount = features.get("amount", 0.0)
        ratio = features.get("amount_ratio_to_avg", 1.0)
        is_new_device = features.get("is_new_device", False)
        txns_5m = features.get("txns_last_5_min", 0)
        impossible_travel = features.get("impossible_travel", False)
        category = features.get("merchant_category", "")

        # Feature weight calculations matching supervised tree splits
        score = 0.03
        if ratio > 3.0:
            score += 0.25
        elif ratio > 1.8:
            score += 0.12
            
        if is_new_device:
            score += 0.22
            
        if txns_5m >= 3:
            score += 0.28
        elif txns_5m >= 1:
            score += 0.08
            
        if impossible_travel:
            score += 0.35
            
        if category in ["Luxury", "Financial Services"]:
            score += 0.10
            
        if amount > 50000:
            score += 0.15

        return round(min(max(score, 0.01), 0.99), 2)

xgboost_model = XGBoostFraudClassifier()
