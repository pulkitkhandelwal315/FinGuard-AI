import pytest
from app.services.demo_data_generator import demo_generator, central_data, CentralDataEngine
from app.ai.rag_engine import rag_engine, RAGEngine
from app.ai.tools import tool_registry, ToolRegistry
from app.ai.assistant import ai_assistant_service, AIAssistantService

class TestDemoDataGenerator:
    def test_generate_transactions_count(self):
        txns = demo_generator.generate_transactions(50)
        assert len(txns) == 50
        sample = txns[0]
        assert "transaction_id" in sample
        assert "amount" in sample
        assert "merchant" in sample
        assert "risk_score" in sample
        assert "risk_level" in sample
        assert "customer_id" in sample
        assert "device_id" in sample
        assert "timestamp" in sample
        assert sample["amount"] > 0

    def test_central_data_engine_generate_all(self):
        engine = CentralDataEngine()
        data = engine.generate_all(100)
        assert "transactions" in data
        assert "customers" in data
        assert "merchants" in data
        assert "devices" in data
        assert "audit_logs" in data
        assert len(data["customers"]) > 0
        assert len(data["merchants"]) > 0
        assert len(data["devices"]) > 0
        assert len(data["audit_logs"]) > 0

class TestRAGEngine:
    def test_search_context_relevant_query(self):
        results = rag_engine.search_context("thresholds risk scoring policy")
        assert len(results) > 0
        assert any("DOC-101" == r["id"] for r in results)

    def test_search_context_model_architecture(self):
        results = rag_engine.search_context("xgboost isolation forest lstm ensemble architecture")
        assert len(results) > 0
        assert any("DOC-102" == r["id"] for r in results)

    def test_search_context_fallback(self):
        # Query with random obscure words should fallback to default document
        results = rag_engine.search_context("xyzabc123nonexistentnonsense")
        assert len(results) >= 1

class TestToolRegistry:
    @pytest.fixture
    def sample_transactions(self):
        return [
            {
                "transaction_id": "TXN-101",
                "amount": 5000.0,
                "merchant": "Swiggy Food",
                "merchant_category": "Food",
                "risk_score": 0.12,
                "risk_level": "LOW",
                "fraud_probability": 0.10,
                "anomaly_score": 0.15
            },
            {
                "transaction_id": "TXN-102",
                "amount": 75000.0,
                "merchant": "Apex Crypto",
                "merchant_category": "Financial Services",
                "risk_score": 0.92,
                "risk_level": "CRITICAL",
                "fraud_probability": 0.90,
                "anomaly_score": 0.95
            }
        ]

    def test_execute_get_transaction(self, sample_transactions):
        log = tool_registry.execute_tool("get_transaction", {"transaction_id": "TXN-101"}, sample_transactions)
        assert log.tool_name == "get_transaction"
        assert log.result["transaction_id"] == "TXN-101"
        assert log.result["amount"] == 5000.0

    def test_execute_get_transaction_not_found(self, sample_transactions):
        log = tool_registry.execute_tool("get_transaction", {"transaction_id": "TXN-999"}, sample_transactions)
        assert "error" in log.result

    def test_execute_get_spending_summary(self, sample_transactions):
        log = tool_registry.execute_tool("get_spending_summary", {}, sample_transactions)
        assert log.result["total_transactions"] == 2
        assert log.result["total_volume_inr"] == 80000.0
        assert "Food" in log.result["category_breakdown"]
        assert "Financial Services" in log.result["category_breakdown"]

    def test_execute_get_risk_score(self, sample_transactions):
        log = tool_registry.execute_tool("get_risk_score", {"transaction_id": "TXN-102"}, sample_transactions)
        assert log.result["risk_score"] == 0.92
        assert log.result["risk_level"] == "CRITICAL"

    def test_execute_get_alerts(self, sample_transactions):
        log = tool_registry.execute_tool("get_alerts", {"severity": "CRITICAL"}, sample_transactions)
        assert log.result["alert_count"] == 1
        assert log.result["alerts"][0]["transaction_id"] == "TXN-102"

    def test_execute_compare_periods(self, sample_transactions):
        log = tool_registry.execute_tool("compare_periods", {}, sample_transactions)
        assert "previous_period_volume" in log.result
        assert "current_period_volume" in log.result
        assert "percentage_change" in log.result

    def test_execute_unknown_tool(self, sample_transactions):
        log = tool_registry.execute_tool("nonexistent_tool", {}, sample_transactions)
        assert "error" in log.result

class TestAIAssistantService:
    @pytest.fixture
    def sample_transactions(self):
        return [
            {
                "transaction_id": "TXN-94821",
                "amount": 48250.0,
                "merchant": "XYZ Electronics",
                "device_id": "DEV-NEW-9841",
                "risk_score": 0.87,
                "risk_level": "HIGH",
                "merchant_category": "Shopping"
            }
        ]

    def test_process_message_with_txn_id(self, sample_transactions):
        msg = ai_assistant_service.process_message("Why was TXN-94821 flagged?", sample_transactions)
        assert msg.sender == "assistant"
        assert "TXN-94821" in msg.content
        assert "87%" in msg.content or "HIGH" in msg.content
        assert len(msg.tool_calls) > 0

    def test_process_message_spending_query(self, sample_transactions):
        msg = ai_assistant_service.process_message("Show my spending categories", sample_transactions)
        assert msg.sender == "assistant"
        assert "spending summary" in msg.content.lower()
        assert len(msg.tool_calls) > 0

    def test_process_message_comparison_query(self, sample_transactions):
        msg = ai_assistant_service.process_message("Compare monthly trends and volume", sample_transactions)
        assert msg.sender == "assistant"
        assert "comparison" in msg.content.lower()

    def test_process_message_rag_fallback(self, sample_transactions):
        msg = ai_assistant_service.process_message("Explain the security policies of FinGuard AI", sample_transactions)
        assert msg.sender == "assistant"
        assert len(msg.citations) > 0
        assert "FinGuard" in msg.content
