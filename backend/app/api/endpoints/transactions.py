import io
import csv
import json
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any, Tuple
from app.services.demo_data_generator import demo_generator
from app.services.feature_engineering import feature_pipeline
from app.ml.xgboost_classifier import xgboost_model
from app.ml.isolation_forest import isolation_forest_model
from app.ml.lstm_behavioral import lstm_model
from app.ml.rule_engine import rule_engine
from app.ml.risk_aggregator import risk_aggregator
from app.ml.shap_explainer import shap_explainer

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

# In-memory store for fast demo execution preloaded with 10,000 transactions
TRANSACTION_STORE = demo_generator.generate_transactions(10000)

@router.get("")
def get_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None
):
    filtered = TRANSACTION_STORE
    
    if search:
        s = search.lower()
        filtered = [
            t for t in filtered if
            s in t["transaction_id"].lower() or
            s in t["merchant"].lower() or
            s in t["customer_id"].lower() or
            s in t["location"].lower()
        ]
        
    if risk_level and risk_level != "ALL":
        filtered = [t for t in filtered if t.get("risk_level") == risk_level.upper()]
        
    if category and category != "ALL":
        filtered = [t for t in filtered if t.get("merchant_category") == category]
        
    if payment_method and payment_method != "ALL":
        filtered = [t for t in filtered if t.get("payment_method") == payment_method]

    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return {
        "total": len(filtered),
        "page": page,
        "limit": limit,
        "total_pages": (len(filtered) + limit - 1) // limit,
        "transactions": paginated
    }

@router.get("/download-sample")
def download_sample_csv():
    """Provides a sample CSV template with real-world Indian UPI transactions."""
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data"))
    sample_path = os.path.join(data_dir, "real_upi_banking_transactions.csv")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample dataset not found.")

    return FileResponse(
        path=sample_path,
        media_type="text/csv",
        filename="finguard_sample_transactions.csv"
    )

@router.get("/{txn_id}")
def get_transaction_detail(txn_id: str):
    found = [t for t in TRANSACTION_STORE if t["transaction_id"].upper() == txn_id.upper()]
    if not found:
        raise HTTPException(status_code=404, detail=f"Transaction {txn_id} not found.")
    
    t = found[0]
    
    # Feature extraction & SHAP explanation on demand
    features = feature_pipeline.extract_features(t, TRANSACTION_STORE[:100])
    contributions, explanation = shap_explainer.explain(features, t.get("risk_score", 0.05))
    rules_triggered = rule_engine.evaluate_rules(features)

    return {
        "transaction": t,
        "features": features,
        "shap_contributions": contributions,
        "explanation": explanation,
        "triggered_rules": rules_triggered
    }

@router.post("/reload-demo")
def reload_demo_dataset():
    global TRANSACTION_STORE
    TRANSACTION_STORE = demo_generator.generate_transactions(10000)
    return {
        "status": "success",
        "message": "Loaded 10,000 synthetic transaction records pre-populated with fraud scenarios.",
        "count": len(TRANSACTION_STORE)
    }

def process_and_score_dataset(rows: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    global TRANSACTION_STORE
    valid_txns = []
    errors = []
    seen_ids = set()
    duplicate_count = 0
    fraud_count = 0

    for idx, row in enumerate(rows):
        row_num = idx + 1
        # Extract and normalize fields
        raw_amt = row.get("amount") or row.get("Amount") or row.get("transaction_amount") or row.get("amt")
        if raw_amt is None:
            errors.append({"row": row_num, "reason": "Missing transaction amount"})
            continue
        try:
            amount = float(str(raw_amt).replace(",", "").replace("₹", "").strip())
        except (ValueError, TypeError):
            errors.append({"row": row_num, "reason": f"Invalid amount format: {raw_amt}"})
            continue

        if amount < 0:
            errors.append({"row": row_num, "reason": f"Negative transaction amount ({amount})"})
            continue

        txn_id = str(row.get("transaction_id") or row.get("Transaction ID") or row.get("id") or f"TXN-UPL-{uuid.uuid4().hex[:6].upper()}").strip()
        if txn_id in seen_ids:
            duplicate_count += 1
            continue
        seen_ids.add(txn_id)

        merchant = str(row.get("merchant") or row.get("Merchant") or "Merchant Store").strip()
        category = str(row.get("merchant_category") or row.get("category") or row.get("Category") or "Shopping").strip()
        customer_id = str(row.get("customer_id") or row.get("Customer ID") or "CUST-1042").strip()
        device_id = str(row.get("device_id") or row.get("Device ID") or "DEV-101").strip()
        location = str(row.get("location") or row.get("Location") or "Bengaluru, India").strip()
        payment_method = str(row.get("payment_method") or row.get("Payment Method") or "UPI").strip()
        currency = str(row.get("currency") or "INR").strip()
        timestamp = str(row.get("timestamp") or row.get("Date") or datetime.now().isoformat()).strip()

        lat = float(row["latitude"]) if "latitude" in row and row["latitude"] else 12.9716
        lng = float(row["longitude"]) if "longitude" in row and row["longitude"] else 77.5946

        txn_record = {
            "id": f"upl_{uuid.uuid4().hex[:8]}",
            "transaction_id": txn_id,
            "timestamp": timestamp,
            "amount": amount,
            "currency": currency,
            "merchant": merchant,
            "merchant_category": category,
            "payment_method": payment_method,
            "location": location,
            "latitude": lat,
            "longitude": lng,
            "account_id": f"ACC-{5000 + (idx % 20)}",
            "customer_id": customer_id,
            "device_id": device_id,
            "ip_address": str(row.get("ip_address") or f"192.168.1.{(idx * 7) % 250 + 1}"),
            "upi_id": str(row.get("upi_id") or f"{customer_id.lower()}@okhdfcbank"),
            "transaction_type": "PAYMENT",
            "status": "COMPLETED",
            "created_at": timestamp
        }

        # Run Real ML Feature Extraction & Scoring Pipeline
        features = feature_pipeline.extract_features(txn_record, TRANSACTION_STORE[:100])
        xgb_score = xgboost_model.predict_proba(features)
        iso_score = isolation_forest_model.predict_anomaly_score(features)
        lstm_score = lstm_model.predict_sequence_risk(features, [1000.0, 1500.0, 2000.0])
        rules_triggered = rule_engine.evaluate_rules(features)

        final_score, risk_level, rule_score = risk_aggregator.aggregate(xgb_score, iso_score, lstm_score, rules_triggered)
        contributions, explanation = shap_explainer.explain(features, final_score)

        is_flagged = risk_level in ["HIGH", "CRITICAL"]
        if is_flagged:
            fraud_count += 1

        txn_record["risk_score"] = final_score
        txn_record["risk_level"] = risk_level
        txn_record["fraud_probability"] = xgb_score
        txn_record["anomaly_score"] = iso_score
        txn_record["rule_score"] = rule_score
        txn_record["flagged"] = is_flagged
        txn_record["status"] = "FLAGGED" if is_flagged else "COMPLETED"
        txn_record["fraud_typology"] = (
            rules_triggered[0].rule_name if rules_triggered 
            else ("High Risk Anomaly" if is_flagged else "Normal Authorized Payment")
        )
        txn_record["shap_explanation"] = explanation

        # Persist into Relational Database with Foreign Key Guarantees
        from app.db.repository import repo
        from app.db.database import get_db
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR IGNORE INTO customers (customer_id, name, email, phone, risk_score, risk_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
                (customer_id, f"Customer {customer_id}", f"{customer_id.lower()}@example.com", "+91 98765 00000", final_score, risk_level, timestamp)
            )
            cursor.execute(
                "INSERT OR IGNORE INTO devices (device_id, device_type, os_browser, risk_score, risk_level, first_seen, last_seen) VALUES (?, 'Mobile Device', 'Android Fingerprint', ?, ?, ?, ?);",
                (device_id, final_score, risk_level, timestamp, timestamp)
            )
        repo.insert_transaction(txn_record)

        valid_txns.append(txn_record)

    # Prepend valid transactions to the live in-memory transaction store
    if valid_txns:
        TRANSACTION_STORE = valid_txns + TRANSACTION_STORE
        from app.services.audit_service import audit_service
        audit_service.log_action(
            actor="Analyst",
            role="ANALYST",
            action="INGEST_TRANSACTIONS",
            target=f"Batch_{len(valid_txns)}",
            details=f"Ingested {len(valid_txns)} transactions (flagged {fraud_count} high-risk)."
        )

    report = {
        "total_rows": len(rows),
        "valid_count": len(valid_txns),
        "invalid_count": len(errors),
        "duplicate_count": duplicate_count,
        "fraud_flagged_count": fraud_count,
        "fraud_rate_percentage": round((fraud_count / len(valid_txns) * 100), 1) if valid_txns else 0.0,
        "errors": errors[:10]
    }
    return valid_txns, report

@router.post("/upload")
async def upload_transactions(file: UploadFile = File(...)):
    filename = file.filename.lower() if file.filename else "unknown"
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".json")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV, XLSX, or JSON.")

    content = await file.read()
    raw_rows = []

    if filename.endswith(".json"):
        try:
            parsed = json.loads(content.decode("utf-8"))
            raw_rows = parsed if isinstance(parsed, list) else [parsed]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse JSON file: {str(e)}")
    else:
        try:
            text = content.decode("utf-8-sig", errors="replace")
            reader = csv.DictReader(io.StringIO(text))
            raw_rows = [row for row in reader if any(row.values())]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    valid_txns, report = process_and_score_dataset(raw_rows)

    return {
        "message": f"Successfully processed {report['valid_count']} transactions from {file.filename}",
        "report": report,
        "processed_transactions": report["valid_count"],
        "transactions": valid_txns[:50]
    }

@router.post("/load-benchmark")
def load_benchmark_dataset():
    """Loads realistic Indian UPI and Fraud Attack benchmark datasets into the live system."""
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data"))
    upi_path = os.path.join(data_dir, "real_upi_banking_transactions.csv")
    fraud_path = os.path.join(data_dir, "fraud_attack_scenarios.csv")

    raw_rows = []
    for filepath in [upi_path, fraud_path]:
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                raw_rows.extend([row for row in reader if any(row.values())])

    if not raw_rows:
        raise HTTPException(status_code=404, detail="Benchmark datasets not found in data directory.")

    valid_txns, report = process_and_score_dataset(raw_rows)

    return {
        "message": f"Successfully loaded real financial benchmark datasets ({len(valid_txns)} transactions)",
        "report": report,
        "count": len(valid_txns),
        "transactions": valid_txns
    }
