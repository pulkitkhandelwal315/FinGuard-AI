import pytest
import sqlite3
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, DB_PATH
from app.db.seeder import seed_database_if_empty
from app.db.repository import repo
from app.services.audit_service import audit_service
from app.auth.rbac import UserRole, mask_email, mask_phone

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM audit_logs;")
        cursor.execute("DELETE FROM case_notes;")
    seed_database_if_empty(force=True)

class TestRelationalIntegrityAndSeeder:
    def test_database_tables_and_foreign_keys(self):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [r[0] for r in cursor.fetchall()]
            assert "customers" in tables
            assert "merchants" in tables
            assert "devices" in tables
            assert "transactions" in tables
            assert "alerts" in tables
            assert "investigation_cases" in tables
            assert "case_notes" in tables
            assert "rules" in tables
            assert "audit_logs" in tables

    def test_seeder_populates_relational_entities(self):
        customers = repo.get_customers()
        assert len(customers) >= 50
        merchants = repo.get_merchants()
        assert len(merchants) >= 6
        devices = repo.get_devices()
        assert len(devices) >= 50
        txns, total = repo.get_transactions(page=1, limit=10)
        assert total >= 300

class TestRBACAndPIIMasking:
    def test_analyst_forbidden_from_editing_rules(self):
        headers = {"X-User-Role": "ANALYST", "X-User-Name": "Junior Analyst"}
        payload = {
            "rule_id": "RUL-TEST-99",
            "name": "Unauthorized Rule",
            "condition": "amount > 10000",
            "threshold": 10000.0,
            "severity": "HIGH"
        }
        res = client.post("/api/fraud/rules", json=payload, headers=headers)
        assert res.status_code == 403
        assert "Forbidden" in res.json()["detail"]

    def test_admin_allowed_to_edit_rules(self):
        headers = {"X-User-Role": "ADMIN", "X-User-Name": "Admin User"}
        payload = {
            "rule_id": "RUL-TEST-99",
            "name": "Admin Authorized Rule",
            "condition": "amount > 80000",
            "threshold": 80000.0,
            "severity": "HIGH",
            "action": "BLOCK"
        }
        res = client.post("/api/fraud/rules", json=payload, headers=headers)
        assert res.status_code == 200
        assert "successfully activated" in res.json()["message"]

    def test_auditor_forbidden_from_blocking_transaction(self):
        headers = {"X-User-Role": "AUDITOR", "X-User-Name": "Compliance Auditor"}
        res = client.post("/api/fraud/block-transaction", json={"transaction_id": "TXN-UPI-2001"}, headers=headers)
        assert res.status_code == 403

    def test_senior_analyst_can_block_transaction(self):
        headers = {"X-User-Role": "SENIOR_ANALYST", "X-User-Name": "Senior Officer"}
        res = client.post("/api/fraud/block-transaction", json={"transaction_id": "TXN-UPI-2002"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "BLOCKED"

    def test_block_transaction_idempotency(self):
        headers = {"X-User-Role": "SENIOR_ANALYST", "X-User-Name": "Senior Officer"}
        # Initial block
        res1 = client.post("/api/fraud/block-transaction", json={"transaction_id": "TXN-UPI-2005"}, headers=headers)
        assert res1.status_code == 200
        assert res1.json()["status"] == "BLOCKED"

        # Check audit log count
        audit_res1 = client.get("/api/entities/audit-logs")
        count_before = audit_res1.json()["total"]

        # Duplicate retry block
        res2 = client.post("/api/fraud/block-transaction", json={"transaction_id": "TXN-UPI-2005"}, headers=headers)
        assert res2.status_code == 200
        assert res2.json()["status"] == "BLOCKED"
        assert res2.json().get("idempotent") is True

        # Verify no duplicate audit log was appended
        audit_res2 = client.get("/api/entities/audit-logs")
        assert audit_res2.json()["total"] == count_before

    def test_pii_masking_for_analysts_and_auditors(self):
        headers = {"X-User-Role": "ANALYST"}
        res = client.get("/api/entities/customers/CUST-1001", headers=headers)
        assert res.status_code == 200
        data = res.json()["customer"]
        assert "***" in data["email"]
        assert "***" in data["phone"]
        assert data.get("pii_masked") is True

    def test_unmasked_pii_for_admin(self):
        headers = {"X-User-Role": "ADMIN"}
        res = client.get("/api/entities/customers/CUST-1001", headers=headers)
        assert res.status_code == 200
        data = res.json()["customer"]
        assert "@" in data["email"]
        assert "pii_masked" not in data

class TestCryptographicAuditLogging:
    def test_audit_chain_verification_on_valid_ledger(self):
        res = client.get("/api/entities/audit-logs/verify")
        assert res.status_code == 200
        data = res.json()
        assert data["is_valid"] is True
        assert data["status"] == "VERIFIED_TAMPER_FREE"
        assert data["total_blocks"] > 0

    def test_tamper_detection_on_mutated_record(self):
        # Insert a valid action first
        audit_service.log_action("Admin", "ADMIN", "TEST_ACTION", "TARGET_1", "Legitimate action")
        assert audit_service.verify_chain_integrity()["is_valid"] is True

        # Directly tamper with SQLite audit_logs table to simulate unauthorized modification
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE audit_logs SET details = 'TAMPERED_DETAILS' WHERE rowid = (SELECT MAX(rowid) FROM audit_logs);")

        # Verify integrity checker detects the tamper
        tamper_check = audit_service.verify_chain_integrity()
        assert tamper_check["is_valid"] is False
        assert tamper_check["status"] == "TAMPER_DETECTED"
        assert "Hash content mismatch" in tamper_check["error"]

class TestCrossEntityConsistency:
    def test_blocking_transaction_cascades_across_entities(self):
        txn_id = "TXN-UPI-2003"
        txn = repo.get_transaction(txn_id)
        cust_id = txn["customer_id"]
        initial_cust = repo.get_customer(cust_id)
        initial_fraud_count = initial_cust["fraud_alert_count"]

        # Block transaction via repository
        block_res = repo.block_transaction(txn_id, actor="Senior Analyst Dave", role="SENIOR_ANALYST")
        assert block_res["status"] == "BLOCKED"

        # 1. Verify Transaction is BLOCKED & CRITICAL
        updated_txn = repo.get_transaction(txn_id)
        assert updated_txn["status"] == "BLOCKED"
        assert updated_txn["risk_level"] == "CRITICAL"

        # 2. Verify Customer fraud alert count incremented
        updated_cust = repo.get_customer(cust_id)
        assert updated_cust["fraud_alert_count"] == initial_fraud_count + 1

        # 3. Verify chained audit log was created
        audit_res = client.get("/api/entities/audit-logs")
        logs = audit_res.json()["audit_logs"]
        latest_log = logs[0]
        assert latest_log["action"] == "BLOCK_TRANSACTION"
        assert latest_log["target"] == txn_id
        assert audit_service.verify_chain_integrity()["is_valid"] is True

class TestRuleSimulationAndConflicts:
    def test_rule_conflict_detection(self):
        contradictory_rule = {
            "rule_id": "RUL-CONFLICT-TEST",
            "name": "Contradictory Limit",
            "condition": "amount > user_daily_limit",
            "threshold": 100000.0,
            "severity": "LOW",
            "action": "ALLOW"
        }
        res = client.post("/api/fraud/rules/conflicts", json=contradictory_rule)
        assert res.status_code == 200
        data = res.json()
        assert data["has_conflicts"] is True
        assert data["conflict_count"] >= 1
        assert any(c["type"] == "CONTRADICTION" for c in data["conflicts"])

    def test_rule_dry_run_simulation(self):
        candidate = {
            "rule_id": "RUL-SIM-TEST",
            "name": "High Value Transactions",
            "condition": "amount > 50000",
            "threshold": 50000.0,
            "severity": "HIGH"
        }
        res = client.post("/api/fraud/rules/simulate", json=candidate)
        assert res.status_code == 200
        sim = res.json()["simulation"]
        assert sim["total_evaluated"] >= 100
        assert sim["matched_count"] > 0
        assert sim["matched_total_amount_inr"] > 0
        assert "trigger_rate_percentage" in sim
        assert "estimated_false_positive_rate" in sim

class TestAIAssistantActionExecutionGateway:
    def test_assistant_hallucinated_transaction_rejection(self):
        headers = {"X-User-Role": "ADMIN"}
        payload = {
            "action_type": "BLOCK_TRANSACTION",
            "entity_id": "TXN-HALLUCINATED-GHOST-9999",
            "reason": "AI proposed blocking fake ID"
        }
        res = client.post("/api/assistant/execute-action", json=payload, headers=headers)
        assert res.status_code == 404
        assert "Hallucination Guardrail Triggered" in res.json()["detail"]

    def test_assistant_verified_action_execution(self):
        headers = {"X-User-Role": "SENIOR_ANALYST", "X-User-Name": "Lead Investigator"}
        payload = {
            "action_type": "BLOCK_TRANSACTION",
            "entity_id": "TXN-UPI-2004",
            "reason": "Confirmed card testing attack pattern"
        }
        res = client.post("/api/assistant/execute-action", json=payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["verified"] is True
        assert data["success"] is True
        assert data["entity_id"] == "TXN-UPI-2004"
