from typing import List, Tuple
from app.schemas.fraud import RuleTriggered

class RiskAggregator:
    def __init__(self, low_max: float = 0.30, med_max: float = 0.60, high_max: float = 0.80):
        self.low_max = low_max
        self.med_max = med_max
        self.high_max = high_max

    def aggregate(
        self,
        xgboost_score: float,
        isolation_score: float,
        lstm_score: float,
        triggered_rules: List[RuleTriggered]
    ) -> Tuple[float, str, float]:
        # Calculate rule score contribution
        critical_count = sum(1 for r in triggered_rules if r.severity == "CRITICAL")
        high_count = sum(1 for r in triggered_rules if r.severity == "HIGH")
        
        rule_score = min(critical_count * 0.45 + high_count * 0.25, 0.99)
        
        # Weighted ensemble calculation: XGBoost (40%), Isolation Forest (25%), LSTM (20%), Rules (15%)
        final_score = round(
            0.40 * xgboost_score +
            0.25 * isolation_score +
            0.20 * lstm_score +
            0.15 * rule_score,
            2
        )

        if final_score >= self.high_max:
            risk_level = "CRITICAL" if final_score > 0.85 else "HIGH"
        elif final_score >= self.med_max:
            risk_level = "HIGH" if final_score >= 0.70 else "MEDIUM"
        elif final_score >= self.low_max:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return final_score, risk_level, round(rule_score, 2)

risk_aggregator = RiskAggregator()
