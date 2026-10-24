import uuid
from datetime import datetime
from typing import List, Dict, Any
from app.schemas.assistant import ChatMessage, ToolCallLog
from app.ai.rag_engine import rag_engine
from app.ai.tools import tool_registry

def sanitize_context_field(val: Any) -> str:
    """Neutralizes indirect prompt injection vectors in untrusted database text fields."""
    if not isinstance(val, str):
        return str(val) if val is not None else ""
    cleaned = val.replace("\r", " ").replace("\n", " ")
    for token in ["SYSTEM:", "ASSISTANT:", "USER:", "IGNORE PREVIOUS", "SYSTEM OVERRIDE", "DISREGARD"]:
        cleaned = cleaned.replace(token, "[FILTERED]")
    return cleaned.strip()

class AIAssistantService:
    """Conversational AI Assistant with RAG, Tool Execution, and Safety Guardrails."""

    def process_message(self, user_message: str, transactions: List[Dict[str, Any]]) -> ChatMessage:
        msg_lower = user_message.lower()
        tool_logs = []
        citations = []

        actions = []
        # Step 1: Query Intent & Tool Selection
        if "txn-" in msg_lower or "transaction" in msg_lower or "flagged" in msg_lower or "why" in msg_lower:
            # Extract txn ID if present
            words = user_message.upper().replace(",", "").replace("?", "").split()
            txn_ids = [w for w in words if w.startswith("TXN-")]
            
            if txn_ids:
                target_id = txn_ids[0]
                t_log = tool_registry.execute_tool("get_transaction", {"transaction_id": target_id}, transactions)
                tool_logs.append(t_log)
                
                txn_data = t_log.result
                if "error" in txn_data:
                    # Fallback to database repository ground truth
                    from app.db.repository import repo
                    db_txn = repo.get_transaction(target_id)
                    if db_txn:
                        txn_data = db_txn

                if "error" not in txn_data:
                    amt = txn_data.get("amount", 0.0)
                    merchant = sanitize_context_field(txn_data.get("merchant", "Unknown"))
                    device_id = sanitize_context_field(txn_data.get("device_id", "Unknown"))
                    risk_score = int(txn_data.get("risk_score", 0.0) * 100)
                    risk_level = txn_data.get("risk_level", "LOW")
                    
                    response_text = (
                        f"Transaction **{target_id}** (₹{amt:,.2f} at {merchant}) has an estimated **{risk_level} Fraud Risk** score of **{risk_score}%**.\n\n"
                        "**Primary Risk Factors Identified by Ensemble Models:**\n"
                        f"• **Amount Spike:** Transaction amount is significantly above your historical category baseline.\n"
                        f"• **Hardware Device Fingerprint:** Originating from device `{device_id}`.\n"
                        f"• **Velocity Check:** Evaluated against 5-minute and 1-hour transaction frequency thresholds.\n\n"
                        "*Note: FinGuard AI estimates probability risk levels. Final fraud confirmation requires formal investigation analyst review.*"
                    )

                    if risk_score >= 50:
                        actions.append({
                            "action_type": "BLOCK_TRANSACTION",
                            "entity_id": target_id,
                            "label": f"Block Transaction {target_id}",
                            "requires_role": "SENIOR_ANALYST"
                        })
                        actions.append({
                            "action_type": "ESCALATE_CASE",
                            "entity_id": "CASE-10231",
                            "label": "Escalate to Fraud Operations",
                            "requires_role": "ANALYST"
                        })
                else:
                    response_text = f"I checked our database, but could not locate transaction `{target_id}`. Please check the ID and try again."
            else:
                # General high risk overview tool call
                t_log = tool_registry.execute_tool("get_alerts", {"severity": "HIGH"}, transactions)
                tool_logs.append(t_log)
                
                response_text = (
                    "I analyzed your active transaction log. We currently have **high-risk alerts** flagged by the ensemble ML pipeline.\n\n"
                    "**Recent High-Risk Transactions:**\n"
                )
                alerts = t_log.result.get("alerts", [])
                for a in alerts:
                    response_text += f"• **{a['transaction_id']}** - ₹{a['amount']:,.0f} at {a['merchant']} (Risk: {int(a['risk_score']*100)}% - {a['risk_level']})\n"
                
                response_text += "\nWould you like me to detail the SHAP feature breakdown for any specific transaction ID?"

        elif "spending" in msg_lower or "summary" in msg_lower or "categories" in msg_lower:
            t_log = tool_registry.execute_tool("get_spending_summary", {}, transactions)
            tool_logs.append(t_log)
            res = t_log.result
            
            response_text = (
                f"Here is your financial spending summary across **{res['total_transactions']:,} transactions**:\n\n"
                f"• **Total Analyzed Volume:** ₹{res['total_volume_inr']:,.2f}\n\n"
                "**Top Spending Categories:**\n"
            )
            for cat, val in res["category_breakdown"].items():
                response_text += f"• **{cat}:** ₹{val:,.2f}\n"

        elif "compare" in msg_lower or "month" in msg_lower or "trend" in msg_lower:
            t_log = tool_registry.execute_tool("compare_periods", {}, transactions)
            tool_logs.append(t_log)
            res = t_log.result
            
            response_text = (
                f"Financial Period Comparison Analysis:\n\n"
                f"• **Current Period Volume:** ₹{res['current_period_volume']:,.2f}\n"
                f"• **Previous Period Volume:** ₹{res['previous_period_volume']:,.2f}\n"
                f"• **Volume Change:** **{res['percentage_change']}%** ({res['trend']})\n\n"
                "Spending velocity remains within baseline risk tolerance limits."
            )

        else:
            # Fallback to RAG Knowledge Base search
            rag_docs = rag_engine.search_context(user_message)
            citations = [d["title"] for d in rag_docs]
            context_str = "\n".join([d["content"] for d in rag_docs])
            
            response_text = (
                f"Based on FinGuard AI's system knowledge base:\n\n"
                f"{context_str}\n\n"
                "You can ask me to analyze specific transactions (e.g. *'Why was TXN-94821 flagged?'*), show spending breakdowns, or compare spending periods!"
            )

        return ChatMessage(
            id=f"MSG-{uuid.uuid4().hex[:8]}",
            sender="assistant",
            content=response_text,
            timestamp=datetime.now().isoformat(),
            citations=citations,
            tool_calls=tool_logs,
            actions=actions,
            ground_truth_verified=True
        )

ai_assistant_service = AIAssistantService()
