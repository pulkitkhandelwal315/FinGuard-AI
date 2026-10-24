from app.db.database import get_db

SCHEMA_SQL = """
-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    risk_score REAL DEFAULT 0.05,
    risk_level TEXT DEFAULT 'LOW',
    total_transactions INTEGER DEFAULT 0,
    total_volume_inr REAL DEFAULT 0.0,
    fraud_alert_count INTEGER DEFAULT 0,
    linked_devices TEXT, -- JSON array
    known_locations TEXT, -- JSON array
    created_at TEXT NOT NULL
);

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    merchant_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    risk_score REAL DEFAULT 0.1,
    risk_level TEXT DEFAULT 'LOW',
    total_volume_inr REAL DEFAULT 0.0,
    transaction_count INTEGER DEFAULT 0,
    fraud_rate REAL DEFAULT 0.0,
    chargeback_rate REAL DEFAULT 0.0,
    top_location TEXT
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    device_type TEXT DEFAULT 'Mobile',
    os_browser TEXT DEFAULT 'Android / Chrome',
    risk_score REAL DEFAULT 0.05,
    risk_level TEXT DEFAULT 'LOW',
    linked_accounts TEXT, -- JSON array
    known_ips TEXT, -- JSON array
    velocity_score REAL DEFAULT 0.0,
    first_seen TEXT,
    last_seen TEXT
);

-- Transactions Table with Foreign Keys & Indexes
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    merchant TEXT NOT NULL,
    merchant_id TEXT,
    merchant_category TEXT DEFAULT 'Shopping',
    payment_method TEXT DEFAULT 'UPI',
    location TEXT DEFAULT 'Mumbai, India',
    latitude REAL DEFAULT 19.0760,
    longitude REAL DEFAULT 72.8777,
    account_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    ip_address TEXT,
    upi_id TEXT,
    transaction_type TEXT DEFAULT 'PAYMENT',
    status TEXT DEFAULT 'COMPLETED',
    fraud_probability REAL DEFAULT 0.05,
    anomaly_score REAL DEFAULT 0.05,
    risk_score REAL DEFAULT 0.05,
    risk_level TEXT DEFAULT 'LOW',
    rule_score REAL DEFAULT 0.0,
    flagged INTEGER DEFAULT 0,
    fraud_typology TEXT DEFAULT 'Normal Authorized Payment',
    shap_explanation TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants (merchant_id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions (customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions (risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions (timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions (merchant_id);

-- Alerts Table with Foreign Key & SLA Deadline
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    merchant TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'UNRESOLVED', -- UNRESOLVED, RESOLVED, UNDER_INVESTIGATION
    sla_deadline TEXT NOT NULL,
    resolved_by TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);

-- Investigation Cases Table
CREATE TABLE IF NOT EXISTS investigation_cases (
    case_id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    merchant TEXT NOT NULL,
    risk_score REAL NOT NULL,
    status TEXT DEFAULT 'OPEN', -- OPEN, UNDER_INVESTIGATION, CLOSED_FRAUD, CLOSED_LEGITIMATE, ESCALATED
    priority TEXT DEFAULT 'HIGH',
    assigned_analyst TEXT DEFAULT 'Unassigned',
    sla_deadline TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON investigation_cases (status);

-- Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES investigation_cases (case_id) ON DELETE CASCADE
);

-- Rules Table with Versioning & Status
CREATE TABLE IF NOT EXISTS rules (
    rule_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    condition TEXT NOT NULL,
    threshold REAL NOT NULL,
    severity TEXT NOT NULL,
    action TEXT DEFAULT 'FLAG', -- FLAG, BLOCK, REVIEW
    is_active INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    created_by TEXT DEFAULT 'Admin',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Tamper-Evident Cryptographic Audit Logs Table (Append-Only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    prev_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp);
"""

def init_db():
    """Initializes the database tables and indexes."""
    with get_db() as conn:
        conn.executescript(SCHEMA_SQL)
