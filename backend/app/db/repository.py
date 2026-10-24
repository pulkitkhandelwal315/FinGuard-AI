import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple
from app.db.database import get_db
from app.services.audit_service import audit_service

class FinGuardRepository:
    """Relational data repository maintaining referential integrity across all entities."""

    # ------------------ Customers ------------------
    def get_customers(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customers ORDER BY risk_score DESC;")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["linked_devices"] = json.loads(d["linked_devices"]) if d["linked_devices"] else []
                d["known_locations"] = json.loads(d["known_locations"]) if d["known_locations"] else []
                results.append(d)
            return results

    def get_customer(self, customer_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customers WHERE UPPER(customer_id) = ?;", (customer_id.upper(),))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["linked_devices"] = json.loads(d["linked_devices"]) if d["linked_devices"] else []
            d["known_locations"] = json.loads(d["known_locations"]) if d["known_locations"] else []
            return d

    # ------------------ Merchants ------------------
    def get_merchants(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchants ORDER BY risk_score DESC;")
            results = []
            for r in cursor.fetchall():
                d = dict(r)
                d["id"] = d.get("merchant_id")
                results.append(d)
            return results

    def get_merchant(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchants WHERE UPPER(merchant_id) = ?;", (merchant_id.upper(),))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["id"] = d.get("merchant_id")
            return d

    # ------------------ Devices ------------------
    def get_devices(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM devices ORDER BY risk_score DESC;")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["linked_accounts"] = json.loads(d["linked_accounts"]) if d["linked_accounts"] else []
                d["known_ips"] = json.loads(d["known_ips"]) if d["known_ips"] else []
                results.append(d)
            return results

    def get_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM devices WHERE UPPER(device_id) = ?;", (device_id.upper(),))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["linked_accounts"] = json.loads(d["linked_accounts"]) if d["linked_accounts"] else []
            d["known_ips"] = json.loads(d["known_ips"]) if d["known_ips"] else []
            return d

    # ------------------ Transactions ------------------
    def get_transactions(
        self,
        page: int = 1,
        limit: int = 25,
        search: Optional[str] = None,
        risk_level: Optional[str] = None,
        category: Optional[str] = None,
        payment_method: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        with get_db() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM transactions WHERE 1=1"
            params = []

            if search:
                s = f"%{search.strip()}%"
                query += " AND (transaction_id LIKE ? OR merchant LIKE ? OR customer_id LIKE ? OR location LIKE ?)"
                params.extend([s, s, s, s])

            if risk_level and risk_level != "ALL":
                query += " AND risk_level = ?"
                params.append(risk_level.upper())

            if category and category != "ALL":
                query += " AND merchant_category = ?"
                params.append(category)

            if payment_method and payment_method != "ALL":
                query += " AND payment_method = ?"
                params.append(payment_method)

            # Count total
            count_query = query.replace("SELECT *", "SELECT COUNT(*)")
            cursor.execute(count_query, params)
            total = cursor.fetchone()[0]

            # Paginate
            query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?;"
            params.extend([limit, (page - 1) * limit])
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows], total

    def get_transaction(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions WHERE UPPER(transaction_id) = ?;", (transaction_id.upper(),))
            row = cursor.fetchone()
            return dict(row) if row else None

    def insert_transaction(self, t: Dict[str, Any]):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO transactions (
                    id, transaction_id, timestamp, amount, currency, merchant, merchant_id,
                    merchant_category, payment_method, location, latitude, longitude,
                    account_id, customer_id, device_id, ip_address, upi_id, transaction_type,
                    status, fraud_probability, anomaly_score, risk_score, risk_level,
                    rule_score, flagged, fraud_typology, shap_explanation, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    t["id"], t["transaction_id"], t["timestamp"], t["amount"], t.get("currency", "INR"),
                    t["merchant"], t.get("merchant_id"), t.get("merchant_category", "Shopping"),
                    t.get("payment_method", "UPI"), t.get("location", "Mumbai, India"),
                    t.get("latitude", 19.0760), t.get("longitude", 72.8777),
                    t["account_id"], t["customer_id"], t["device_id"],
                    t.get("ip_address"), t.get("upi_id"), t.get("transaction_type", "PAYMENT"),
                    t.get("status", "COMPLETED"), t.get("fraud_probability", 0.05),
                    t.get("anomaly_score", 0.05), t.get("risk_score", 0.05),
                    t.get("risk_level", "LOW"), t.get("rule_score", 0.0),
                    1 if t.get("flagged") else 0, t.get("fraud_typology", "Normal Authorized Payment"),
                    t.get("shap_explanation", ""), t.get("created_at", datetime.now(timezone.utc).isoformat())
                )
            )

    # ------------------ Atomic Block Transaction ------------------
    def block_transaction(self, transaction_id: str, actor: str = "Admin", role: str = "ADMIN") -> Dict[str, Any]:
        """Atomically blocks a transaction, resolves alerts, updates customer risk profile, and writes chained audit block."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions WHERE UPPER(transaction_id) = ?;", (transaction_id.upper(),))
            txn = cursor.fetchone()
            if not txn:
                raise ValueError(f"Transaction {transaction_id} not found.")

            # Idempotency Guard: Prevent duplicate state mutations and redundant audit log blocks
            if txn["status"] == "BLOCKED":
                return {
                    "success": True,
                    "transaction_id": txn["transaction_id"],
                    "status": "BLOCKED",
                    "idempotent": True,
                    "message": f"Transaction {txn['transaction_id']} is already blocked. Idempotent request resolved without duplicate mutation."
                }

            # 1. Update Transaction Status
            cursor.execute(
                "UPDATE transactions SET status = 'BLOCKED', risk_level = 'CRITICAL', flagged = 1 WHERE transaction_id = ?;",
                (txn["transaction_id"],)
            )

            # 2. Update linked alert if exists
            cursor.execute(
                "UPDATE alerts SET status = 'RESOLVED', resolved_by = ? WHERE transaction_id = ?;",
                (f"{actor} ({role})", txn["transaction_id"])
            )

            # 3. Increment customer fraud count
            cursor.execute(
                "UPDATE customers SET fraud_alert_count = fraud_alert_count + 1 WHERE customer_id = ?;",
                (txn["customer_id"],)
            )

            # 4. Check or update investigation case
            cursor.execute(
                "UPDATE investigation_cases SET status = 'CLOSED_FRAUD', updated_at = ? WHERE transaction_id = ?;",
                (datetime.now(timezone.utc).isoformat(), txn["transaction_id"])
            )

        # 5. Append Cryptographic Audit Log
        audit_entry = audit_service.log_action(
            actor=actor,
            role=role,
            action="BLOCK_TRANSACTION",
            target=txn["transaction_id"],
            details=f"Blocked transaction ₹{txn['amount']:,.2f} at {txn['merchant']} due to fraud risk."
        )

        return {
            "success": True,
            "transaction_id": txn["transaction_id"],
            "status": "BLOCKED",
            "audit_log": audit_entry
        }

    # ------------------ Alerts ------------------
    def get_alerts(self, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            if severity and severity != "ALL":
                cursor.execute("SELECT * FROM alerts WHERE UPPER(severity) = ? ORDER BY created_at DESC LIMIT 100;", (severity.upper(),))
            else:
                cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100;")
            return [dict(r) for r in cursor.fetchall()]

    def update_alert_status(self, alert_id: str, new_status: str, actor: str = "Admin", role: str = "ADMIN") -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alerts WHERE UPPER(id) = ?;", (alert_id.upper(),))
            alert = cursor.fetchone()
            if not alert:
                return None

            cursor.execute(
                "UPDATE alerts SET status = ?, resolved_by = ? WHERE id = ?;",
                (new_status, f"{actor} ({role})", alert["id"])
            )

        audit_service.log_action(
            actor=actor,
            role=role,
            action="UPDATE_ALERT_STATUS",
            target=alert["id"],
            details=f"Alert {alert['id']} changed from {alert['status']} to {new_status}."
        )

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alerts WHERE id = ?;", (alert["id"],))
            return dict(cursor.fetchone())

    # ------------------ Investigation Cases ------------------
    def get_cases(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            if status and status != "ALL":
                cursor.execute("SELECT * FROM investigation_cases WHERE UPPER(status) = ? ORDER BY updated_at DESC;", (status.upper(),))
            else:
                cursor.execute("SELECT * FROM investigation_cases ORDER BY updated_at DESC;")
            cases = [dict(r) for r in cursor.fetchall()]

            for c in cases:
                cursor.execute("SELECT * FROM case_notes WHERE case_id = ? ORDER BY timestamp ASC;", (c["case_id"],))
                c["notes"] = [dict(n) for n in cursor.fetchall()]
            return cases

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM investigation_cases WHERE UPPER(case_id) = ?;", (case_id.upper(),))
            row = cursor.fetchone()
            if not row:
                return None
            case = dict(row)
            cursor.execute("SELECT * FROM case_notes WHERE case_id = ? ORDER BY timestamp ASC;", (case["case_id"],))
            case["notes"] = [dict(n) for n in cursor.fetchall()]
            return case

    def update_case(self, case_id: str, payload: Dict[str, Any], actor: str = "Admin", role: str = "ADMIN") -> Optional[Dict[str, Any]]:
        case = self.get_case(case_id)
        if not case:
            return None

        new_status = payload.get("status", case["status"])
        new_priority = payload.get("priority", case["priority"])
        new_note = payload.get("note")

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE investigation_cases SET status = ?, priority = ?, updated_at = ? WHERE case_id = ?;",
                (new_status, new_priority, datetime.now(timezone.utc).isoformat(), case["case_id"])
            )

            if new_note:
                note_id = f"N-{uuid.uuid4().hex[:6].upper()}"
                cursor.execute(
                    "INSERT INTO case_notes (id, case_id, author, text, timestamp) VALUES (?, ?, ?, ?, ?);",
                    (note_id, case["case_id"], f"{actor} ({role})", new_note, datetime.now(timezone.utc).isoformat())
                )

        audit_service.log_action(
            actor=actor,
            role=role,
            action="UPDATE_INVESTIGATION_CASE",
            target=case["case_id"],
            details=f"Case status: {new_status}, priority: {new_priority}. Note added: {bool(new_note)}"
        )

        return self.get_case(case_id)

    # ------------------ Rules ------------------
    def get_rules(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rules WHERE is_active = 1 ORDER BY version DESC, rule_id ASC;")
            results = []
            for r in cursor.fetchall():
                d = dict(r)
                d["id"] = d.get("rule_id")
                results.append(d)
            return results

    def get_all_rule_versions(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rules ORDER BY rule_id ASC, version DESC;")
            results = []
            for r in cursor.fetchall():
                d = dict(r)
                d["id"] = d.get("rule_id")
                results.append(d)
            return results

    def upsert_rule(self, rule_data: Dict[str, Any], actor: str = "Admin", role: str = "ADMIN") -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("SELECT MAX(version) FROM rules WHERE rule_id = ?;", (rule_data["rule_id"],))
            row = cursor.fetchone()
            next_version = (row[0] or 0) + 1

            cursor.execute(
                """
                INSERT OR REPLACE INTO rules (
                    rule_id, name, condition, threshold, severity, action, is_active, version, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    rule_data["rule_id"], rule_data["name"], rule_data["condition"],
                    float(rule_data.get("threshold", 0.0)), rule_data.get("severity", "HIGH"),
                    rule_data.get("action", "FLAG"), 1, next_version, actor, now, now
                )
            )

        audit_service.log_action(
            actor=actor,
            role=role,
            action="UPSERT_FRAUD_RULE",
            target=rule_data["rule_id"],
            details=f"Created/updated rule {rule_data['rule_id']} v{next_version} ({rule_data['name']})."
        )

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rules WHERE rule_id = ? AND version = ?;", (rule_data["rule_id"], next_version))
            return dict(cursor.fetchone())

repo = FinGuardRepository()
