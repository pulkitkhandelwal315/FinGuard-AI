#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}================================================================${NC}"
echo -e "${CYAN}             FinGuard AI — Multi-Level Test Suite               ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Level 1: Unit Tests
echo -e "\n${YELLOW}[LEVEL 1] Running Unit Tests (ML Models, Rules, Feature Engineering, AI Service)...${NC}"
pytest "$ROOT_DIR/backend/tests/test_unit_ml.py" "$ROOT_DIR/backend/tests/test_unit_services_ai.py" -q

# Level 2: Integration Tests
echo -e "\n${YELLOW}[LEVEL 2] Running API & Integration Tests (Auth, Transactions, Fraud, Alerts, Analytics, MLOps, Entities)...${NC}"
pytest "$ROOT_DIR/backend/tests/test_integration_endpoints.py" -q

# Level 3: End-to-End System Tests
echo -e "\n${YELLOW}[LEVEL 3] Running End-to-End & System Tests (WebSocket Streaming & Transaction Lifecycle)...${NC}"
pytest "$ROOT_DIR/backend/tests/test_e2e_system.py" -q

# Level 4: Edge Cases, Security & Benchmarks
echo -e "\n${YELLOW}[LEVEL 4] Running Edge Cases, Security & Latency Benchmark Tests...${NC}"
pytest "$ROOT_DIR/backend/tests/test_edge_cases_security.py" -q

# Level 5: Frontend Unit & Build Tests
echo -e "\n${YELLOW}[LEVEL 5] Running Frontend Unit Tests, TypeScript Check & Vite Build...${NC}"
npm --prefix "$ROOT_DIR/frontend" test

# Level 6: Enterprise Architecture, Relational Integrity & Cryptographic Tamper Tests
echo -e "\n${YELLOW}[LEVEL 6] Running Enterprise Architecture, Foreign Keys, RBAC & Tamper-Proof Audit Tests...${NC}"
pytest "$ROOT_DIR/backend/tests/test_enterprise_architecture.py" -q

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ✓ ALL 6 TESTING LEVELS PASSED SUCCESSFULLY FOR FINGUARD AI!    ${NC}"
echo -e "${GREEN}================================================================${NC}"
