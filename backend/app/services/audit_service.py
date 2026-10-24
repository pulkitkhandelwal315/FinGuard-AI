import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.db.database import get_db

GENESIS_PREV_HASH = "0" * 64

class CryptographicAuditService:
    """Tamper-evident, append-only cryptographic audit logger with SHA-256 hash chaining."""

    def _compute_hash(self, prev_hash: str, timestamp: str, actor: str, role: str, action: str, target: str, details: str) -> str:
        payload = f"{prev_hash}|{timestamp}|{actor}|{role}|{action}|{target}|{details}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def get_latest_hash(self, conn) -> str:
        cursor = conn.cursor()
        cursor.execute("SELECT current_hash FROM audit_logs ORDER BY rowid DESC LIMIT 1;")
        row = cursor.fetchone()
        return row["current_hash"] if row else GENESIS_PREV_HASH

    def log_action(
        self,
        actor: str,
        role: str,
        action: str,
        target: str,
        details: str,
        ip_address: Optional[str] = "127.0.0.1",
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        """Appends an immutable audit log entry chained cryptographically to the preceding entry."""
        ts = timestamp or datetime.now(timezone.utc).isoformat()
        log_id = f"AUD-{uuid.uuid4().hex[:10].upper()}"

        with get_db() as conn:
            prev_hash = self.get_latest_hash(conn)
            current_hash = self._compute_hash(prev_hash, ts, actor, role, action, target, details)

            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO audit_logs (id, timestamp, actor, role, action, target, details, ip_address, prev_hash, current_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (log_id, ts, actor, role, action, target, details, ip_address, prev_hash, current_hash)
            )

        return {
            "id": log_id,
            "timestamp": ts,
            "actor": actor,
            "role": role,
            "action": action,
            "target": target,
            "details": details,
            "ip_address": ip_address,
            "prev_hash": prev_hash,
            "current_hash": current_hash
        }

    def get_all_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT ?;", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Traverses the entire cryptographic audit trail from genesis to latest block to ensure zero tampering."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_logs ORDER BY rowid ASC;")
            records = cursor.fetchall()

        if not records:
            return {
                "is_valid": True,
                "total_blocks": 0,
                "status": "CHAIN_EMPTY",
                "message": "Audit chain initialized and empty."
            }

        expected_prev_hash = GENESIS_PREV_HASH
        for idx, rec in enumerate(records):
            actual_prev = rec["prev_hash"]
            if actual_prev != expected_prev_hash:
                return {
                    "is_valid": False,
                    "total_blocks": len(records),
                    "broken_at_block": idx + 1,
                    "record_id": rec["id"],
                    "status": "TAMPER_DETECTED",
                    "error": f"Previous hash mismatch at block {idx+1}. Expected {expected_prev_hash}, got {actual_prev}."
                }

            recalculated_hash = self._compute_hash(
                actual_prev,
                rec["timestamp"],
                rec["actor"],
                rec["role"],
                rec["action"],
                rec["target"],
                rec["details"]
            )
            if recalculated_hash != rec["current_hash"]:
                return {
                    "is_valid": False,
                    "total_blocks": len(records),
                    "broken_at_block": idx + 1,
                    "record_id": rec["id"],
                    "status": "TAMPER_DETECTED",
                    "error": f"Hash content mismatch at block {idx+1}. Recalculated {recalculated_hash}, found {rec['current_hash']}."
                }

            expected_prev_hash = rec["current_hash"]

        return {
            "is_valid": True,
            "total_blocks": len(records),
            "status": "VERIFIED_TAMPER_FREE",
            "message": f"Cryptographic audit chain intact. Verified {len(records)} blocks with SHA-256.",
            "latest_hash": expected_prev_hash
        }

audit_service = CryptographicAuditService()
