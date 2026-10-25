"""
Global test configuration for FinGuard AI backend.

Creates an isolated temporary SQLite database for each test session,
initializes the full schema, and patches DB_PATH so all app modules
(database, repository, audit_service, seeder) use the test DB instead
of the production finguard.db.

This fixes CI failures where tables don't exist because there is no
pre-existing .db file in a clean checkout.
"""
import os
import pytest

@pytest.fixture(scope="session", autouse=True)
def init_test_db(tmp_path_factory):
    """Create a temporary test database and initialize the schema before any tests run."""
    # 1. Create a temp DB path
    db_path = str(tmp_path_factory.mktemp("data") / "test_finguard.db")

    # 2. Set the env var BEFORE any app module reads it
    os.environ["FINGUARD_DB_PATH"] = db_path

    # 3. Patch the already-imported DB_PATH in the database module
    import app.db.database as db_module
    db_module.DB_PATH = db_path

    # 4. Initialize the full schema (CREATE TABLE IF NOT EXISTS ...)
    from app.db.schema import init_db
    init_db()

    yield db_path

    # Cleanup: the tmp_path_factory handles deletion automatically
