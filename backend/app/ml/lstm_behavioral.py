from typing import List, Dict, Any

class LSTMBehavioralModel:
    """Sequence model evaluating historical transaction flows (e.g. ₹500 -> ₹800 -> ₹600 -> ₹48,000)."""

    def predict_sequence_risk(self, current_features: Dict[str, Any], historical_amounts: List[float]) -> float:
        if not historical_amounts:
            return 0.05

        current_amount = current_features.get("amount", 0.0)
        recent_amounts = historical_amounts[-4:] if len(historical_amounts) >= 4 else historical_amounts
        avg_recent = sum(recent_amounts) / len(recent_amounts) if recent_amounts else current_amount

        # Detect sharp step-function escalation in transaction amount sequence
        if current_amount > avg_recent * 4.0 and current_amount > 20000:
            return round(min(0.85 + (current_amount / 100000.0) * 0.1, 0.98), 2)
        elif current_amount > avg_recent * 2.5:
            return round(min(0.55 + (current_amount / 100000.0) * 0.1, 0.78), 2)

        return round(max(0.02, min(0.25, (current_amount / (avg_recent + 1.0)) * 0.05)), 2)

lstm_model = LSTMBehavioralModel()
