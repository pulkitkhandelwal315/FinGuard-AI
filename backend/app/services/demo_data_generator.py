import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

CITIES = [
    {"name": "Delhi", "lat": 28.6139, "lng": 77.2090, "country": "India", "fraud_level": "HIGH"},
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777, "country": "India", "fraud_level": "MEDIUM"},
    {"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "country": "India", "fraud_level": "LOW"},
    {"name": "London", "lat": 51.5074, "lng": -0.1278, "country": "UK", "fraud_level": "HIGH"},
    {"name": "Dubai", "lat": 25.2048, "lng": 55.2708, "country": "UAE", "fraud_level": "HIGH"},
]

MERCHANTS_DATA = [
    {"id": "MRC-101", "name": "XYZ Electronics", "category": "Shopping", "risk_score": 0.78, "fraud_rate": 4.8, "chargeback": 2.1},
    {"id": "MRC-102", "name": "Apex Crypto Exchange", "category": "Financial Services", "risk_score": 0.91, "fraud_rate": 8.5, "chargeback": 4.2},
    {"id": "MRC-103", "name": "Swiggy Food", "category": "Food", "risk_score": 0.05, "fraud_rate": 0.4, "chargeback": 0.1},
    {"id": "MRC-104", "name": "Amazon India", "category": "Shopping", "risk_score": 0.12, "fraud_rate": 0.8, "chargeback": 0.3},
    {"id": "MRC-105", "name": "MakeMyTrip Hotel", "category": "Travel", "risk_score": 0.45, "fraud_rate": 2.4, "chargeback": 1.1},
    {"id": "MRC-106", "name": "Global Tech Luxury Store", "category": "Luxury", "risk_score": 0.82, "fraud_rate": 5.9, "chargeback": 3.0},
]

TYPOLOGIES = [
    "Account Takeover",
    "Impossible Travel Velocity",
    "Rapid Velocity Burst",
    "Card Testing Attack",
    "Synthetic Identity Fraud",
    "High Amount Crypto Drain"
]

class CentralDataEngine:
    def __init__(self):
        random.seed(42)

    def generate_all(self, count: int = 10000) -> Dict[str, Any]:
        transactions = []
        base_time = datetime.now() - timedelta(days=30)
        
        # Pre-seed Customers
        customers = [
            {
                "customer_id": f"CUST-{1000 + i}",
                "name": f"Customer {i+1}",
                "email": f"cust{i+1}@example.com",
                "phone": f"+91 98765 {10000+i}",
                "risk_score": round(random.uniform(0.05, 0.88), 2),
                "risk_level": "HIGH" if i in [2, 5, 8] else "LOW",
                "total_transactions": random.randint(15, 250),
                "total_volume_inr": round(random.uniform(15000, 480000), 2),
                "fraud_alert_count": random.randint(0, 5),
                "linked_devices": [f"DEV-{100 + i}", f"DEV-NEW-{9000 + i}"],
                "known_locations": ["Delhi, India", "Mumbai, India"],
                "created_at": (datetime.now() - timedelta(days=180)).isoformat()
            } for i in range(50)
        ]

        # Pre-seed Devices
        devices = [
            {
                "device_id": f"DEV-{100 + i}",
                "device_type": "Mobile (iOS/Android)",
                "os_browser": "Chrome 122 / iOS 17.4",
                "risk_score": round(random.uniform(0.02, 0.95), 2),
                "risk_level": "HIGH" if i % 6 == 0 else "LOW",
                "linked_accounts": [f"ACC-{5000 + i}", f"ACC-{5000 + ((i+1)%50)}"],
                "known_ips": [f"192.168.1.{i+1}", f"185.220.101.{i+1}"],
                "velocity_score": round(random.uniform(1.0, 8.5), 1),
                "first_seen": (datetime.now() - timedelta(days=90)).isoformat(),
                "last_seen": datetime.now().isoformat()
            } for i in range(40)
        ]

        # Pre-seed Transactions
        fraud_indices = set(random.sample(range(10, count), int(count * 0.025)))

        for i in range(1, count + 1):
            txn_id = f"TXN-{10000 + i}"
            time_offset = timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            timestamp = (base_time + time_offset).isoformat()
            cust = random.choice(customers)
            merchant = random.choice(MERCHANTS_DATA)
            city = random.choice(CITIES)

            is_fraud = i in fraud_indices or i == 1
            if is_fraud:
                amount = float(random.randint(37500, 125000))
                typology = random.choice(TYPOLOGIES)
                risk_score = round(random.uniform(0.78, 0.96), 2)
                risk_level = "CRITICAL" if risk_score > 0.85 else "HIGH"
                status_flag = "FLAGGED"
                device_id = f"DEV-NEW-{random.randint(9000, 9999)}"
            else:
                amount = float(random.randint(150, 12800))
                typology = "Normal Authorized Payment"
                risk_score = round(random.uniform(0.01, 0.22), 2)
                risk_level = "MEDIUM" if risk_score > 0.30 else "LOW"
                status_flag = "NORMAL"
                device_id = cust["linked_devices"][0]

            transactions.append({
                "id": f"id_{i}",
                "transaction_id": txn_id,
                "timestamp": timestamp,
                "amount": amount,
                "currency": "INR",
                "merchant": merchant["name"],
                "merchant_id": merchant["id"],
                "merchant_category": merchant["category"],
                "payment_method": random.choice(["UPI", "Credit Card", "Bank Transfer"]),
                "location": f"{city['name']}, {city['country']}",
                "latitude": city["lat"],
                "longitude": city["lng"],
                "country": city["country"],
                "account_id": f"ACC-{5000 + (i % 50)}",
                "customer_id": cust["customer_id"],
                "device_id": device_id,
                "ip_address": f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                "transaction_type": "PAYMENT",
                "status": "COMPLETED",
                "fraud_probability": risk_score,
                "anomaly_score": round(risk_score * 0.92, 2),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "status_flag": status_flag,
                "fraud_typology": typology,
                "created_at": timestamp
            })

        transactions.sort(key=lambda x: x["timestamp"], reverse=True)

        # Audit Logs
        audit_logs = [
            {"id": "AUD-1001", "timestamp": "14:32:00", "actor": "Admin", "role": "ADMIN", "action": "RULE_CHANGED", "target": "RUL-103", "details": "Updated velocity threshold to 3 txns/5min", "ip_address": "10.0.0.1"},
            {"id": "AUD-1002", "timestamp": "14:28:15", "actor": "Admin", "role": "ADMIN", "action": "CASE_ASSIGNED", "target": "CASE-10231", "details": "Assigned high-risk case to Analyst Admin", "ip_address": "10.0.0.1"},
            {"id": "AUD-1003", "timestamp": "14:19:40", "actor": "System Engine", "role": "SYSTEM", "action": "TRANSACTION_BLOCKED", "target": "TXN-94821", "details": "Automated block triggered by rule RUL-102", "ip_address": "127.0.0.1"},
            {"id": "AUD-1004", "timestamp": "14:11:05", "actor": "Admin", "role": "ADMIN", "action": "THRESHOLD_UPDATED", "target": "High Risk Cutoff", "details": "Updated threshold score to 0.80", "ip_address": "10.0.0.1"},
            {"id": "AUD-1005", "timestamp": "13:58:22", "actor": "Analyst Admin", "role": "FRAUD_ANALYST", "action": "ALERT_RESOLVED", "target": "ALT-5004", "details": "Marked alert as Legitimate transaction", "ip_address": "10.0.0.4"}
        ]

        return {
            "transactions": transactions,
            "customers": customers,
            "merchants": MERCHANTS_DATA,
            "devices": devices,
            "audit_logs": audit_logs
        }

    def generate_transactions(self, count: int = 10000) -> List[Dict[str, Any]]:
        return self.generate_all(count)["transactions"]

central_data = CentralDataEngine()
demo_generator = central_data

