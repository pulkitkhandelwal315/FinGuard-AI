import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app, ws_manager

client = TestClient(app)

class TestWebSocketStreaming:
    def test_websocket_connection_and_broadcast(self):
        with client.websocket_connect("/ws/transactions") as websocket:
            # Broadcast a custom test event through the ConnectionManager
            test_event = {
                "event_type": "TRANSACTION_RECEIVED",
                "transaction_id": "TXN-E2E-TEST-001",
                "timestamp": "2026-08-24T14:00:00Z",
                "amount": 55000.0,
                "merchant": "Apex Crypto",
                "payment_method": "Credit Card",
                "risk_score": 0.89,
                "risk_level": "HIGH",
                "flagged": True
            }
            # Run broadcast synchronously using asyncio
            asyncio.run(ws_manager.broadcast(test_event))
            data = websocket.receive_json()
            assert data["event_type"] == "TRANSACTION_RECEIVED"
            assert data["transaction_id"] == "TXN-E2E-TEST-001"
            assert data["amount"] == 55000.0
            assert data["risk_score"] == 0.89
            assert data["risk_level"] == "HIGH"
            assert data["flagged"] is True

    def test_websocket_manager_lifecycle(self):
        initial_count = len(ws_manager.active_connections)
        with client.websocket_connect("/ws/transactions") as websocket:
            assert len(ws_manager.active_connections) == initial_count + 1
        assert len(ws_manager.active_connections) == initial_count

class TestEndToEndLifecycle:
    def test_complete_fraud_detection_and_investigation_lifecycle(self):
        """
        Tests the end-to-end flow:
        1. Ingest suspicious transaction payload
        2. Feature extraction & multi-model scoring (XGBoost, Isolation Forest, LSTM, Rules)
        3. Risk aggregation and SHAP feature explanation
        4. Investigation case updates with analyst notes and status transition
        5. Verify analytics KPI integrity
        """
        # Step 1: Ingest suspicious transaction
        txn_payload = {
            "transaction_id": "TXN-LIFECYCLE-88",
            "customer_id": "CUST-1042",
            "amount": 92000.0,
            "merchant": "Apex Crypto Exchange",
            "merchant_category": "Financial Services",
            "device_id": "DEV-UNKNOWN-99",
            "location": "Dubai, UAE",
            "payment_method": "Bank Transfer",
            "timestamp": "2026-08-24T15:30:00Z"
        }
        analyze_res = client.post("/api/fraud/analyze", json=txn_payload)
        assert analyze_res.status_code == 200
        analysis = analyze_res.json()

        # Step 2: Validate multi-model scoring outputs
        assert analysis["final_risk_score"] > 0.40
        assert analysis["risk_level"] in ["MEDIUM", "HIGH", "CRITICAL"]
        assert analysis["xgboost_score"] > 0.0
        assert analysis["isolation_forest_score"] > 0.0
        assert analysis["lstm_sequence_score"] > 0.0

        # Step 3: Validate SHAP contributions
        contributions = analysis["feature_contributions"]
        assert len(contributions) > 0
        top_contrib = contributions[0]
        assert "feature_name" in top_contrib
        assert "impact_percentage" in top_contrib
        assert top_contrib["impact_percentage"] > 0

        # Step 4: Open and update an investigation case
        case_id = "CASE-10231"
        case_res = client.get(f"/api/investigations/{case_id}")
        assert case_res.status_code == 200
        assert case_res.json()["case"]["case_id"] == case_id

        # Update case status to UNDER_INVESTIGATION then RESOLVED
        update_payload = {
            "status": "RESOLVED",
            "priority": "HIGH",
            "note": "E2E automated validation: Confirmed device anomaly verified with customer."
        }
        patch_res = client.patch(f"/api/investigations/{case_id}", json=update_payload)
        assert patch_res.status_code == 200
        assert patch_res.json()["case"]["status"] == "RESOLVED"
        assert any("E2E automated validation" in n["text"] for n in patch_res.json()["case"]["notes"])

        # Step 5: Check analytics overview consistency
        analytics_res = client.get("/api/analytics/overview")
        assert analytics_res.status_code == 200
        overview = analytics_res.json()
        assert overview["total_transactions"] > 0
        assert overview["fraud_risk_rate"] >= 0.0
        assert "kpi_cards" in overview
