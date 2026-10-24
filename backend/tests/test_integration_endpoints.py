import pytest
import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAuthEndpoints:
    def test_login_admin(self):
        res = client.post("/api/auth/login", json={"email": "admin@finguard.ai", "password": "password123"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "ADMIN"
        assert data["user"]["name"] == "Pulkit Khandelwal"

    def test_login_custom_user(self):
        res = client.post("/api/auth/login", json={"email": "analyst@bank.com", "password": "securepass", "role": "ANALYST"})
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["role"] == "ANALYST"
        assert data["user"]["name"] == "Analyst"

    def test_signup(self):
        res = client.post("/api/auth/signup", json={"name": "Sarah Connor", "email": "sarah@cyberdyne.com", "password": "secret", "role": "USER"})
        assert res.status_code == 200
        data = res.json()
        assert data["message"] == "User account created successfully."
        assert data["user"]["email"] == "sarah@cyberdyne.com"

    def test_get_current_user(self):
        res = client.get("/api/auth/me?role=AUDITOR")
        assert res.status_code == 200
        assert res.json()["user"]["role"] == "AUDITOR"

class TestTransactionsEndpoints:
    def test_get_transactions_pagination(self):
        res = client.get("/api/transactions?page=2&limit=15")
        assert res.status_code == 200
        data = res.json()
        assert data["page"] == 2
        assert data["limit"] == 15
        assert len(data["transactions"]) == 15
        assert data["total"] >= 100

    def test_filter_by_risk_level(self):
        res = client.get("/api/transactions?risk_level=HIGH&limit=10")
        assert res.status_code == 200
        data = res.json()
        for txn in data["transactions"]:
            assert txn["risk_level"] == "HIGH"

    def test_filter_by_payment_method(self):
        res = client.get("/api/transactions?payment_method=UPI&limit=10")
        assert res.status_code == 200
        for txn in res.json()["transactions"]:
            assert txn["payment_method"] == "UPI"

    def test_search_transactions(self):
        res = client.get("/api/transactions?search=Crypto&limit=10")
        assert res.status_code == 200
        data = res.json()
        assert len(data["transactions"]) > 0

    def test_get_transaction_detail(self):
        list_res = client.get("/api/transactions?limit=1")
        txn_id = list_res.json()["transactions"][0]["transaction_id"]
        res = client.get(f"/api/transactions/{txn_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["transaction"]["transaction_id"] == txn_id
        assert "features" in data
        assert "shap_contributions" in data
        assert "explanation" in data
        assert "triggered_rules" in data

    def test_reload_demo_dataset(self):
        res = client.post("/api/transactions/reload-demo")
        assert res.status_code == 200
        assert res.json()["status"] == "success"
        assert res.json()["count"] == 10000

    def test_upload_transactions_file(self):
        csv_content = b"transaction_id,amount,merchant\nTXN-901,1500,Swiggy\n"
        file = {"file": ("transactions.csv", io.BytesIO(csv_content), "text/csv")}
        res = client.post("/api/transactions/upload", files=file)
        assert res.status_code == 200
        data = res.json()
        assert "Successfully processed" in data["message"]
        assert "report" in data
        assert data["report"]["valid_count"] == 1

    def test_load_benchmark_dataset(self):
        res = client.post("/api/transactions/load-benchmark")
        assert res.status_code == 200
        data = res.json()
        assert "Successfully loaded" in data["message"]
        assert data["count"] > 0
        assert "transactions" in data

    def test_download_sample_csv(self):
        res = client.get("/api/transactions/download-sample")
        assert res.status_code == 200
        assert "text/csv" in res.headers.get("content-type", "")
        assert len(res.content) > 100

class TestFraudEndpoints:
    def test_get_high_risk_queue(self):
        res = client.get("/api/fraud/high-risk?limit=5")
        assert res.status_code == 200
        data = res.json()
        assert "total_high_risk" in data
        assert len(data["high_risk_transactions"]) <= 5
        for t in data["high_risk_transactions"]:
            assert t["risk_level"] in ["HIGH", "CRITICAL"]

    def test_get_rules(self):
        res = client.get("/api/fraud/rules")
        assert res.status_code == 200
        rules = res.json()["rules"]
        assert len(rules) >= 4
        rule_ids = [r["id"] for r in rules]
        assert "RUL-101" in rule_ids
        assert "RUL-104" in rule_ids

    def test_analyze_transaction_endpoint(self):
        payload = {
            "transaction_id": "TXN-TEST-999",
            "amount": 78000.0,
            "merchant": "Apex Crypto Exchange",
            "merchant_category": "Financial Services",
            "device_id": "DEV-NEW-888",
            "location": "Dubai, UAE",
            "payment_method": "Credit Card"
        }
        res = client.post("/api/fraud/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["transaction_id"] == "TXN-TEST-999"
        assert "final_risk_score" in data
        assert "risk_level" in data
        assert "xgboost_score" in data
        assert "isolation_forest_score" in data
        assert "lstm_sequence_score" in data
        assert "feature_contributions" in data
        assert "explanation_text" in data

class TestAlertsEndpoints:
    def test_get_alerts(self):
        res = client.get("/api/alerts")
        assert res.status_code == 200
        data = res.json()
        assert "total_alerts" in data
        assert "critical_count" in data
        assert "high_count" in data
        assert len(data["alerts"]) > 0

    def test_get_alerts_filtered(self):
        res = client.get("/api/alerts?severity=CRITICAL")
        assert res.status_code == 200
        for alert in res.json()["alerts"]:
            assert alert["severity"] == "CRITICAL"

    def test_update_alert_status(self):
        res = client.patch("/api/alerts/ALT-5001", json={"status": "RESOLVED"})
        assert res.status_code == 200
        assert res.json()["alert_id"] == "ALT-5001"
        assert res.json()["status"] == "RESOLVED"

class TestInvestigationsEndpoints:
    def test_get_investigations(self):
        res = client.get("/api/investigations")
        assert res.status_code == 200
        data = res.json()
        assert "total_cases" in data
        assert len(data["cases"]) > 0

    def test_get_investigation_detail_and_network_graph(self):
        res = client.get("/api/investigations/CASE-10231")
        assert res.status_code == 200
        data = res.json()
        assert data["case"]["case_id"] == "CASE-10231"
        assert "network_graph" in data
        graph = data["network_graph"]
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) > 0
        assert len(graph["edges"]) > 0

    def test_update_investigation_case(self):
        payload = {
            "status": "ESCALATED",
            "priority": "CRITICAL",
            "note": "Flagged to Anti-Money Laundering unit for secondary validation."
        }
        res = client.patch("/api/investigations/CASE-10231", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["case"]["status"] == "ESCALATED"
        assert data["case"]["priority"] == "CRITICAL"
        assert any("Anti-Money Laundering" in n["text"] for n in data["case"]["notes"])

class TestAnalyticsEndpoints:
    def test_get_analytics_overview(self):
        res = client.get("/api/analytics/overview")
        assert res.status_code == 200
        data = res.json()
        assert "total_volume_inr" in data
        assert "total_transactions" in data
        assert "fraud_risk_rate" in data
        assert "kpi_cards" in data

    def test_get_spending_analytics(self):
        res = client.get("/api/analytics/spending")
        assert res.status_code == 200
        data = res.json()
        assert "category_spending" in data
        assert "monthly_spending" in data
        assert "payment_methods" in data
        assert "top_merchants" in data

class TestMLOpsEndpoints:
    def test_get_mlops_metrics(self):
        res = client.get("/api/models/metrics")
        assert res.status_code == 200
        data = res.json()
        assert "active_models" in data
        assert len(data["active_models"]) >= 3
        assert "thresholds" in data
        assert "comparison_matrix" in data
        assert "confusion_matrix" in data

    def test_update_thresholds(self):
        res = client.post("/api/models/thresholds", json={"high_risk_max": 0.82, "medium_risk_max": 0.58})
        assert res.status_code == 200
        thresholds = res.json()["thresholds"]
        assert thresholds["high_risk_max"] == 0.82
        assert thresholds["medium_risk_max"] == 0.58

class TestEntitiesEndpoints:
    def test_get_customers_and_detail(self):
        res = client.get("/api/entities/customers")
        assert res.status_code == 200
        customers = res.json()["customers"]
        assert len(customers) > 0

        cust_id = customers[0]["customer_id"]
        detail_res = client.get(f"/api/entities/customers/{cust_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["customer"]["customer_id"] == cust_id
        assert "recent_transactions" in detail_res.json()

    def test_get_merchants_and_detail(self):
        res = client.get("/api/entities/merchants")
        assert res.status_code == 200
        merchants = res.json()["merchants"]
        assert len(merchants) > 0

        m_id = merchants[0]["id"]
        detail_res = client.get(f"/api/entities/merchants/{m_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["merchant"]["id"] == m_id

    def test_get_devices_and_detail(self):
        res = client.get("/api/entities/devices")
        assert res.status_code == 200
        devices = res.json()["devices"]
        assert len(devices) > 0

        d_id = devices[0]["device_id"]
        detail_res = client.get(f"/api/entities/devices/{d_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["device"]["device_id"] == d_id

    def test_get_audit_logs(self):
        res = client.get("/api/entities/audit-logs")
        assert res.status_code == 200
        assert "audit_logs" in res.json()
        assert len(res.json()["audit_logs"]) > 0

class TestAssistantEndpoints:
    def test_chat_assistant(self):
        res = client.post("/api/assistant/chat", json={"message": "Give me a spending summary"})
        assert res.status_code == 200
        data = res.json()
        assert "response" in data
        assert data["response"]["sender"] == "assistant"
        assert len(data["response"]["content"]) > 0

    def test_chat_history(self):
        res = client.get("/api/assistant/history")
        assert res.status_code == 200
        assert "history" in res.json()
        assert len(res.json()["history"]) > 0
