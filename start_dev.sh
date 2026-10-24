#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if backend is already running on port 8000
if ! lsof -i :8000 >/dev/null 2>&1; then
  echo "Starting FinGuard AI backend on http://127.0.0.1:8000..."
  python3 -m uvicorn app.main:app --app-dir "$ROOT_DIR/backend" --port 8000 --host 127.0.0.1 &
  BACKEND_PID=$!
  trap 'kill $BACKEND_PID 2>/dev/null' EXIT INT TERM
  # Wait briefly for backend to bind
  sleep 1.5
else
  echo "FinGuard AI backend is already active on port 8000."
fi

echo "Starting Vite frontend dev server on http://localhost:3000..."
npm --prefix "$ROOT_DIR/frontend" run dev
