import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "FinGuard" in data["system"]

def test_get_transactions():
    response = client.get("/api/transactions?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert len(data["transactions"]) == 10
    assert data["total"] >= 10

def test_get_transaction_detail():
    response = client.get("/api/transactions?limit=1")
    assert response.status_code == 200
    txns = response.json()["transactions"]
    if txns:
        txn_id = txns[0]["transaction_id"]
        detail_res = client.get(f"/api/transactions/{txn_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert "transaction" in detail
        assert "features" in detail
        assert "shap_contributions" in detail

def test_fraud_endpoints():
    response = client.get("/api/fraud/high-risk")
    assert response.status_code == 200
    assert "high_risk_transactions" in response.json()

    rules_res = client.get("/api/fraud/rules")
    assert rules_res.status_code == 200
    assert "rules" in rules_res.json()

def test_analytics_endpoints():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    assert "total_volume_inr" in response.json()
    assert "kpi_cards" in response.json()

    spending_res = client.get("/api/analytics/spending")
    assert spending_res.status_code == 200
    assert "category_spending" in spending_res.json()

def test_entities_endpoints():
    cust_res = client.get("/api/entities/customers")
    assert cust_res.status_code == 200
    assert "customers" in cust_res.json()

    merch_res = client.get("/api/entities/merchants")
    assert merch_res.status_code == 200
    assert "merchants" in merch_res.json()
