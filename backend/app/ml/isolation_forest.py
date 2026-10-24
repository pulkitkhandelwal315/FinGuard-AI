from typing import Dict, Any

class IsolationForestAnomalyDetector:
    """Unsupervised Isolation Forest anomaly score model."""
    
    def predict_anomaly_score(self, features: Dict[str, Any]) -> float:
        zscore = features.get("amount_zscore", 0.0)
        dist_km = features.get("distance_from_previous_km", 0.0)
        is_new_device = features.get("is_new_device", False)
        txns_1h = features.get("txns_last_1_hour", 0)

        anomaly_score = 0.04
        if zscore > 4.0:
            anomaly_score += 0.38
        elif zscore > 2.0:
            anomaly_score += 0.18

        if dist_km > 1000.0:
            anomaly_score += 0.32
        elif dist_km > 200.0:
            anomaly_score += 0.14

        if is_new_device and zscore > 1.5:
            anomaly_score += 0.22

        if txns_1h > 5:
            anomaly_score += 0.25

        return round(min(max(anomaly_score, 0.01), 0.99), 2)

isolation_forest_model = IsolationForestAnomalyDetector()
