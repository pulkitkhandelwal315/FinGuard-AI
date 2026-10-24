import json
import csv
import os
import uuid
from datetime import datetime, timedelta, timezone
from app.db.database import get_db
from app.db.schema import init_db
from app.services.demo_data_generator import central_data, MERCHANTS_DATA, demo_generator
from app.services.audit_service import audit_service
from app.ml.rule_engine import DEFAULT_RULES

def seed_database_if_empty(force: bool = False):
    init_db()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM customers;")
        count = cursor.fetchone()[0]
        if count > 0 and not force:
            return  # Already seeded

    # Generate baseline entities
    generated = central_data.generate_all(100)
    customers = generated["customers"]
    merchants = generated["merchants"]
    devices = generated["devices"]

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Seed Customers
        for c in customers:
            cursor.execute(
                """
                INSERT OR REPLACE INTO customers (
                    customer_id, name, email, phone, risk_score, risk_level,
                    total_transactions, total_volume_inr, fraud_alert_count,
                    linked_devices, known_locations, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    c["customer_id"], c["name"], c["email"], c["phone"],
                    c["risk_score"], c["risk_level"], c["total_transactions"],
                    c["total_volume_inr"], c["fraud_alert_count"],
                    json.dumps(c.get("linked_devices", [])),
                    json.dumps(c.get("known_locations", [])),
                    c.get("created_at", datetime.now(timezone.utc).isoformat())
                )
            )

        # 2. Seed Merchants
        for m in merchants:
            cursor.execute(
                """
                INSERT OR REPLACE INTO merchants (
                    merchant_id, name, category, risk_score, risk_level,
                    total_volume_inr, transaction_count, fraud_rate, chargeback_rate, top_location
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    m["id"], m["name"], m["category"], m["risk_score"],
                    "HIGH" if m["risk_score"] > 0.75 else ("MEDIUM" if m["risk_score"] > 0.40 else "LOW"),
                    m.get("total_volume", 250000.0), m.get("transaction_count", 450),
                    m.get("fraud_rate", 1.2), m.get("chargeback", 0.5),
                    m.get("top_location", "Mumbai, India")
                )
            )

        # 3. Seed Devices
        for d in devices:
            cursor.execute(
                """
                INSERT OR REPLACE INTO devices (
                    device_id, device_type, os_browser, risk_score, risk_level,
                    linked_accounts, known_ips, velocity_score, first_seen, last_seen
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    d["device_id"], d["device_type"], d["os_browser"],
                    d["risk_score"], d["risk_level"],
                    json.dumps(d.get("linked_accounts", [])),
                    json.dumps(d.get("known_ips", [])),
                    d.get("velocity_score", 0.0),
                    d.get("first_seen", datetime.now(timezone.utc).isoformat()),
                    d.get("last_seen", datetime.now(timezone.utc).isoformat())
                )
            )

        # 4. Seed Default Rules
        now = datetime.now(timezone.utc).isoformat()
        for r in DEFAULT_RULES:
            cursor.execute(
                """
                INSERT OR REPLACE INTO rules (
                    rule_id, name, condition, threshold, severity, action, is_active, version, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    r["id"], r["name"], r["condition"], float(r.get("threshold", 0.0)),
                    r.get("severity", "HIGH"), "FLAG", 1, 1, "System Admin", now, now
                )
            )

    # 5. Seed Transactions from real CSVs and demo generator
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
    upi_path = os.path.join(data_dir, "real_upi_banking_transactions.csv")
    fraud_path = os.path.join(data_dir, "fraud_attack_scenarios.csv")

    real_txns = []
    for fpath in [upi_path, fraud_path]:
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                real_txns.extend(list(reader))

    synthetic_txns = demo_generator.generate_transactions(300)

    with get_db() as conn:
        cursor = conn.cursor()

        # Insert real transactions
        for idx, row in enumerate(real_txns):
            amt = float(row.get("amount", 1000.0))
            is_fraud = "FRD" in row.get("transaction_id", "")
            risk_score = 0.92 if is_fraud else round(min(amt / 100000.0 + 0.05, 0.35), 2)
            risk_level = "CRITICAL" if is_fraud else ("MEDIUM" if risk_score > 0.30 else "LOW")
            cust_id = str(row.get("customer_id", "CUST-1001"))
            dev_id = str(row.get("device_id", "DEV-101"))
            ts = row.get("timestamp", datetime.now(timezone.utc).isoformat())

            # Ensure customer and device exist for foreign key integrity
            cursor.execute(
                """
                INSERT OR IGNORE INTO customers (customer_id, name, email, phone, risk_score, risk_level, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?);
                """,
                (cust_id, f"Customer {cust_id}", f"{cust_id.lower()}@example.com", "+91 98765 00000", risk_score, risk_level, ts)
            )

            cursor.execute(
                """
                INSERT OR IGNORE INTO devices (device_id, device_type, os_browser, risk_score, risk_level, first_seen, last_seen)
                VALUES (?, 'Mobile Device', 'Android Fingerprint', ?, ?, ?, ?);
                """,
                (dev_id, risk_score, risk_level, ts, ts)
            )

            cursor.execute(
                """
                INSERT OR IGNORE INTO transactions (
                    id, transaction_id, timestamp, amount, currency, merchant, merchant_id,
                    merchant_category, payment_method, location, latitude, longitude,
                    account_id, customer_id, device_id, ip_address, upi_id, transaction_type,
                    status, fraud_probability, anomaly_score, risk_score, risk_level,
                    rule_score, flagged, fraud_typology, shap_explanation, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    f"id_real_{idx+1}", row["transaction_id"], ts, amt, "INR",
                    row["merchant"], "MRC-101", row.get("merchant_category", "Shopping"),
                    row.get("payment_method", "UPI"), row.get("location", "Mumbai, India"),
                    float(row.get("latitude", 19.0760)), float(row.get("longitude", 72.8777)),
                    f"ACC-{5000 + (idx % 20)}", cust_id,
                    dev_id, row.get("ip_address", "192.168.1.1"),
                    row.get("upi_id", "user@okhdfcbank"), "PAYMENT",
                    "FLAGGED" if is_fraud else "COMPLETED",
                    risk_score, risk_score, risk_score, risk_level,
                    0.45 if is_fraud else 0.0, 1 if is_fraud else 0,
                    "High Risk Scenario" if is_fraud else "Normal Authorized Payment",
                    "Real transaction verified through ensemble ML.", ts
                )
            )

        # Insert synthetic transactions
        for t in synthetic_txns:
            cust_id = t["customer_id"]
            dev_id = t["device_id"]
            ts = t["timestamp"]

            cursor.execute(
                """
                INSERT OR IGNORE INTO customers (customer_id, name, email, phone, risk_score, risk_level, created_at)
                VALUES (?, ?, ?, ?, 0.1, 'LOW', ?);
                """,
                (cust_id, f"Customer {cust_id}", f"{cust_id.lower()}@example.com", "+91 98765 00000", ts)
            )

            cursor.execute(
                """
                INSERT OR IGNORE INTO devices (device_id, device_type, os_browser, risk_score, risk_level, first_seen, last_seen)
                VALUES (?, 'Mobile Device', 'Android Fingerprint', 0.1, 'LOW', ?, ?);
                """,
                (dev_id, ts, ts)
            )

            cursor.execute(
                """
                INSERT OR IGNORE INTO transactions (
                    id, transaction_id, timestamp, amount, currency, merchant, merchant_id,
                    merchant_category, payment_method, location, latitude, longitude,
                    account_id, customer_id, device_id, ip_address, upi_id, transaction_type,
                    status, fraud_probability, anomaly_score, risk_score, risk_level,
                    rule_score, flagged, fraud_typology, shap_explanation, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    t["id"], t["transaction_id"], ts, t["amount"], t.get("currency", "INR"),
                    t["merchant"], t.get("merchant_id", "MRC-101"), t.get("merchant_category", "Shopping"),
                    t.get("payment_method", "UPI"), t.get("location", "Delhi, India"),
                    t.get("latitude", 28.6139), t.get("longitude", 77.2090),
                    t["account_id"], cust_id, dev_id,
                    t.get("ip_address"), t.get("upi_id"), t.get("transaction_type", "PAYMENT"),
                    t.get("status", "COMPLETED"), t.get("fraud_probability", 0.05),
                    t.get("anomaly_score", 0.05), t.get("risk_score", 0.05),
                    t.get("risk_level", "LOW"), t.get("rule_score", 0.0),
                    1 if t.get("flagged") else 0, t.get("fraud_typology", "Normal Authorized Payment"),
                    t.get("shap_explanation", ""), t.get("created_at", datetime.now(timezone.utc).isoformat())
                )
            )

        # 6. Seed Alerts with SLA Deadlines
        cursor.execute("SELECT * FROM transactions WHERE risk_level IN ('HIGH', 'CRITICAL') LIMIT 30;")
        high_risk_txns = cursor.fetchall()

        for idx, t in enumerate(high_risk_txns):
            alert_id = f"ALT-{5000 + idx}"
            sev = t["risk_level"]
            sla_mins = 30 if sev == "CRITICAL" else 120
            sla_deadline = (datetime.now(timezone.utc) + timedelta(minutes=sla_mins)).isoformat() + "Z"

            cursor.execute(
                """
                INSERT OR IGNORE INTO alerts (
                    id, transaction_id, account_id, customer_id, amount, merchant,
                    severity, title, description, status, sla_deadline, resolved_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    alert_id, t["transaction_id"], t["account_id"], t["customer_id"],
                    t["amount"], t["merchant"], sev,
                    f"{sev} Risk Flagged on {t['merchant']}",
                    f"Transaction of ₹{t['amount']:,.0f} flagged with risk score of {int(t['risk_score']*100)}%",
                    "UNRESOLVED" if idx % 3 != 0 else "RESOLVED",
                    sla_deadline, "Senior Analyst Admin" if idx % 3 == 0 else None,
                    t["timestamp"]
                )
            )

        # 7. Seed Initial Investigation Cases with Case Notes & SLA Deadlines
        case_records = [
            {
                "case_id": "CASE-10231",
                "transaction_id": "TXN-FRD-9001" if any("FRD" in r["transaction_id"] for r in real_txns) else "TXN-94821",
                "customer_id": "CUST-1042",
                "amount": 94500.0,
                "merchant": "Apex Crypto Exchange",
                "risk_score": 0.94,
                "status": "UNDER_INVESTIGATION",
                "priority": "CRITICAL",
                "assigned_analyst": "Admin",
                "sla_mins": 30,
                "notes": [
                    ("Admin (SENIOR_ANALYST)", "Customer flagged for impossible travel from Bengaluru to Dubai in 20 minutes."),
                    ("Analyst (ANALYST)", "Secondary OTP log requested from telecom gateway.")
                ]
            },
            {
                "case_id": "CASE-10232",
                "transaction_id": "TXN-FRD-9003" if any("FRD" in r["transaction_id"] for r in real_txns) else "TXN-82147",
                "customer_id": "CUST-1088",
                "amount": 92000.0,
                "merchant": "Global Tech Luxury Store",
                "risk_score": 0.91,
                "status": "OPEN",
                "priority": "HIGH",
                "assigned_analyst": "Unassigned",
                "sla_mins": 120,
                "notes": []
            }
        ]

        for c in case_records:
            sla_dl = (datetime.now(timezone.utc) + timedelta(minutes=c["sla_mins"])).isoformat() + "Z"
            cursor.execute(
                """
                INSERT OR IGNORE INTO investigation_cases (
                    case_id, transaction_id, customer_id, amount, merchant,
                    risk_score, status, priority, assigned_analyst, sla_deadline, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    c["case_id"], c["transaction_id"], c["customer_id"],
                    c["amount"], c["merchant"], c["risk_score"],
                    c["status"], c["priority"], c["assigned_analyst"],
                    sla_dl, now, now
                )
            )

            for author, text in c["notes"]:
                cursor.execute(
                    "INSERT INTO case_notes (id, case_id, author, text, timestamp) VALUES (?, ?, ?, ?, ?);",
                    (f"N-{uuid.uuid4().hex[:6].upper()}", c["case_id"], author, text, now)
                )

    # 8. Record Genesis System Audit Log
    audit_service.log_action(
        actor="System",
        role="SYSTEM",
        action="DATABASE_INITIALIZATION",
        target="SQLite_Schema",
        details="Relational database initialized and seeded with customers, merchants, devices, rules, and benchmark transactions."
    )
