from typing import Dict, Any, List
from app.schemas.fraud import RuleTriggered

DEFAULT_RULES = [
    {
        "id": "RUL-101",
        "name": "Daily User Limit Exceeded",
        "condition": "amount > user_daily_limit",
        "threshold": 100000.0,
        "severity": "HIGH"
    },
    {
        "id": "RUL-102",
        "name": "New Device + High Amount Spike",
        "condition": "is_new_device AND amount > 30000",
        "threshold": 30000.0,
        "severity": "HIGH"
    },
    {
        "id": "RUL-103",
        "name": "Rapid Velocity Burst",
        "condition": "txns_last_5_min >= 3",
        "threshold": 3,
        "severity": "CRITICAL"
    },
    {
        "id": "RUL-104",
        "name": "Impossible Travel Velocity",
        "condition": "impossible_travel == True",
        "threshold": 0,
        "severity": "CRITICAL"
    }
]

class FraudRuleEngine:
    def __init__(self):
        self.rules = DEFAULT_RULES

    def evaluate_rules(self, features: Dict[str, Any]) -> List[RuleTriggered]:
        triggered = []
        amount = features.get("amount", 0.0)
        is_new_device = features.get("is_new_device", False)
        txns_5m = features.get("txns_last_5_min", 0)
        impossible_travel = features.get("impossible_travel", False)

        if amount > 100000.0:
            triggered.append(RuleTriggered(
                rule_id="RUL-101",
                rule_name="Daily User Limit Exceeded",
                severity="HIGH",
                description=f"Transaction amount ₹{amount:,.0f} exceeds single transaction limit of ₹100,000"
            ))

        if is_new_device and amount > 30000.0:
            triggered.append(RuleTriggered(
                rule_id="RUL-102",
                rule_name="New Device + High Amount Spike",
                severity="HIGH",
                description="Transaction performed from an unrecognized device with high value amount"
            ))

        if txns_5m >= 3:
            triggered.append(RuleTriggered(
                rule_id="RUL-103",
                rule_name="Rapid Velocity Burst",
                severity="CRITICAL",
                description=f"{txns_5m} transactions initiated within a 5-minute interval"
            ))

        if impossible_travel:
            triggered.append(RuleTriggered(
                rule_id="RUL-104",
                rule_name="Impossible Travel Alert",
                severity="CRITICAL",
                description="Location distance change requires physical movement speed over 800 km/h"
            ))

        return triggered

    def detect_conflicts(self, candidate_rule: Dict[str, Any], existing_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identifies contradictions, redundancies, or threshold collisions against active rules."""
        conflicts = []
        cand_cond = str(candidate_rule.get("condition", "")).strip().lower()
        cand_thresh = float(candidate_rule.get("threshold", 0.0))
        cand_sev = str(candidate_rule.get("severity", "HIGH")).upper()
        cand_action = str(candidate_rule.get("action", "FLAG")).upper()

        for r in existing_rules:
            if r.get("rule_id") == candidate_rule.get("rule_id") or r.get("id") == candidate_rule.get("rule_id"):
                continue

            r_cond = str(r.get("condition", "")).strip().lower()
            r_thresh = float(r.get("threshold", 0.0))
            r_sev = str(r.get("severity", "HIGH")).upper()
            r_action = str(r.get("action", "FLAG")).upper()

            # Exact condition duplicate
            if cand_cond == r_cond and abs(cand_thresh - r_thresh) < 0.001:
                if cand_action != r_action or cand_sev != r_sev:
                    conflicts.append({
                        "type": "CONTRADICTION",
                        "conflicting_rule_id": r.get("rule_id") or r.get("id"),
                        "conflicting_rule_name": r.get("name"),
                        "description": f"Rule contradicts active rule {r.get('name')} with conflicting severity/action on identical conditions."
                    })
                else:
                    conflicts.append({
                        "type": "DUPLICATE",
                        "conflicting_rule_id": r.get("rule_id") or r.get("id"),
                        "conflicting_rule_name": r.get("name"),
                        "description": f"Rule is completely redundant with active rule {r.get('name')}."
                    })

        return conflicts

    def simulate_rule(self, candidate_rule: Dict[str, Any], historical_txns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs a dry-run evaluation of the candidate rule against historical transactions."""
        condition = str(candidate_rule.get("condition", "")).lower()
        threshold = float(candidate_rule.get("threshold", 0.0))

        matched = []
        false_positives = 0

        for t in historical_txns:
            amt = float(t.get("amount", 0.0))
            is_new_dev = bool(t.get("is_new_device", False) or "NEW" in str(t.get("device_id", "")))
            is_imp_travel = bool(t.get("impossible_travel", False) or "FRD" in str(t.get("transaction_id", "")))
            txns_5m = int(t.get("txns_last_5_min", 0))

            matches = False
            if "amount" in condition and "limit" in condition and amt > threshold:
                matches = True
            elif "amount" in condition and ">" in condition and amt > threshold:
                matches = True
            elif "device" in condition and is_new_dev and amt > threshold:
                matches = True
            elif "velocity" in condition and txns_5m >= threshold:
                matches = True
            elif "travel" in condition and is_imp_travel:
                matches = True

            if matches:
                matched.append(t)
                if t.get("risk_level") == "LOW":
                    false_positives += 1

        total = len(historical_txns)
        match_count = len(matched)
        matched_volume = sum(float(t.get("amount", 0.0)) for t in matched)

        return {
            "total_evaluated": total,
            "matched_count": match_count,
            "trigger_rate_percentage": round((match_count / total * 100), 2) if total > 0 else 0.0,
            "matched_total_amount_inr": round(matched_volume, 2),
            "estimated_false_positive_count": false_positives,
            "estimated_false_positive_rate": round((false_positives / match_count * 100), 1) if match_count > 0 else 0.0,
            "sample_matches": [
                {
                    "transaction_id": t.get("transaction_id"),
                    "amount": t.get("amount"),
                    "merchant": t.get("merchant"),
                    "risk_level": t.get("risk_level")
                } for t in matched[:5]
            ]
        }

rule_engine = FraudRuleEngine()

