import math
from typing import Dict, Any, List
from datetime import datetime

class FeatureEngineeringPipeline:
    @staticmethod
    def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate spatial distance in kilometers between two coordinates."""
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return 0.0
        R = 6371.0  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    def extract_features(self, current_txn: Dict[str, Any], historical_txns: List[Dict[str, Any]]) -> Dict[str, Any]:
        amount = float(current_txn.get("amount", 0.0))
        customer_id = current_txn.get("customer_id")
        device_id = current_txn.get("device_id")
        lat = current_txn.get("latitude")
        lng = current_txn.get("longitude")
        country = current_txn.get("country", "India")
        def _parse_dt(val) -> datetime:
            if not val:
                return datetime.now()
            if isinstance(val, datetime):
                return val.replace(tzinfo=None)
            try:
                dt = datetime.fromisoformat(str(val).replace("Z", "+00:00"))
                return dt.replace(tzinfo=None)
            except Exception:
                return datetime.now()

        curr_time = _parse_dt(current_txn.get("timestamp"))

        # Customer history
        cust_history = [t for t in historical_txns if t.get("customer_id") == customer_id and t.get("transaction_id") != current_txn.get("transaction_id")]
        
        amounts = [float(t.get("amount", 0.0)) for t in cust_history]
        avg_amount = sum(amounts) / len(amounts) if amounts else amount
        std_amount = math.sqrt(sum((x - avg_amount)**2 for x in amounts) / len(amounts)) if len(amounts) > 1 else 1000.0

        # Velocity features
        txns_last_5m = 0
        txns_last_1h = 0
        txns_last_24h = 0
        amount_last_1h = 0.0

        for t in cust_history:
            t_time = _parse_dt(t.get("timestamp"))
            time_diff_sec = (curr_time - t_time).total_seconds()
            if time_diff_sec < 0:
                time_diff_sec = abs(time_diff_sec)
            
            if time_diff_sec <= 300:
                txns_last_5m += 1
            if time_diff_sec <= 3600:
                txns_last_1h += 1
                amount_last_1h += float(t.get("amount", 0.0))
            if time_diff_sec <= 86400:
                txns_last_24h += 1

        # Spatial distance and impossible travel check
        prev_txn = cust_history[0] if cust_history else None
        dist_km = 0.0
        impossible_travel = False
        if prev_txn and prev_txn.get("latitude") and prev_txn.get("longitude") and lat and lng:
            dist_km = self.calculate_haversine_distance(prev_txn["latitude"], prev_txn["longitude"], lat, lng)
            prev_time = _parse_dt(prev_txn.get("timestamp"))
            time_diff_hours = max((curr_time - prev_time).total_seconds() / 3600.0, 0.001)
            speed_kmh = dist_km / time_diff_hours
            if speed_kmh > 800.0 and dist_km > 300.0:  # Faster than commercial jet flight with high distance
                impossible_travel = True

        # Device features
        known_devices = {t.get("device_id") for t in cust_history}
        is_new_device = device_id not in known_devices if known_devices else False

        return {
            "amount": amount,
            "amount_ratio_to_avg": round(amount / avg_amount if avg_amount > 0 else 1.0, 2),
            "amount_zscore": round((amount - avg_amount) / std_amount if std_amount > 0 else 0.0, 2),
            "user_avg_amount": round(avg_amount, 2),
            "user_std_amount": round(std_amount, 2),
            "txns_last_5_min": txns_last_5m,
            "txns_last_1_hour": txns_last_1h,
            "txns_last_24_hours": txns_last_24h,
            "amount_last_1_hour": round(amount_last_1h, 2),
            "distance_from_previous_km": dist_km,
            "impossible_travel": impossible_travel,
            "is_new_device": is_new_device,
            "merchant_category": current_txn.get("merchant_category"),
            "payment_method": current_txn.get("payment_method")
        }

feature_pipeline = FeatureEngineeringPipeline()
