from typing import Dict, Any, List, Optional
from app.schemas.assistant import ToolCallLog

class ToolRegistry:
    """Controlled backend tools for AI Assistant."""

    def execute_tool(self, tool_name: str, args: Dict[str, Any], transactions: List[Dict[str, Any]]) -> ToolCallLog:
        result = None
        
        if tool_name == "get_transaction":
            txn_id = args.get("transaction_id", "").upper()
            found = [t for t in transactions if t["transaction_id"] == txn_id]
            result = found[0] if found else {"error": f"Transaction {txn_id} not found."}

        elif tool_name == "get_spending_summary":
            total_spent = sum(t["amount"] for t in transactions)
            categories = {}
            for t in transactions:
                cat = t["merchant_category"]
                categories[cat] = categories.get(cat, 0.0) + t["amount"]
            result = {
                "total_transactions": len(transactions),
                "total_volume_inr": round(total_spent, 2),
                "category_breakdown": {k: round(v, 2) for k, v in categories.items()}
            }

        elif tool_name == "get_risk_score":
            txn_id = args.get("transaction_id", "").upper()
            found = [t for t in transactions if t["transaction_id"] == txn_id]
            if found:
                t = found[0]
                result = {
                    "transaction_id": t["transaction_id"],
                    "risk_score": t.get("risk_score", 0.0),
                    "risk_level": t.get("risk_level", "LOW"),
                    "fraud_probability": t.get("fraud_probability", 0.0),
                    "anomaly_score": t.get("anomaly_score", 0.0)
                }
            else:
                result = {"error": f"Transaction {txn_id} not found."}

        elif tool_name == "get_alerts":
            severity = args.get("severity", "ALL").upper()
            high_risk = [t for t in transactions if t.get("risk_level") in ["HIGH", "CRITICAL"]]
            if severity != "ALL":
                high_risk = [t for t in high_risk if t.get("risk_level") == severity]
            result = {
                "alert_count": len(high_risk),
                "alerts": [
                    {
                        "transaction_id": t["transaction_id"],
                        "amount": t["amount"],
                        "merchant": t["merchant"],
                        "risk_level": t["risk_level"],
                        "risk_score": t["risk_score"]
                    } for t in high_risk[:5]
                ]
            }

        elif tool_name == "compare_periods":
            # Comparison metrics
            mid = len(transactions) // 2
            period1 = transactions[mid:]
            period2 = transactions[:mid]
            vol1 = sum(t["amount"] for t in period1)
            vol2 = sum(t["amount"] for t in period2)
            pct_change = round(((vol2 - vol1) / vol1) * 100, 1) if vol1 > 0 else 0.0
            result = {
                "previous_period_volume": round(vol1, 2),
                "current_period_volume": round(vol2, 2),
                "percentage_change": pct_change,
                "trend": "INCREASED" if pct_change > 0 else "DECREASED"
            }
        else:
            result = {"error": f"Unknown tool name: {tool_name}"}

        return ToolCallLog(tool_name=tool_name, arguments=args, result=result)

tool_registry = ToolRegistry()
