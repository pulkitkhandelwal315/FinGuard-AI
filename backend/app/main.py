import asyncio
import random
import json
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from contextlib import asynccontextmanager
from app.api.endpoints import transactions, fraud, alerts, analytics, investigations, assistant, models, auth, entities, assistant_actions
from app.db.seeder import seed_database_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Relational Database & Auto-Seed on Startup
    seed_database_if_empty()
    yield

app = FastAPI(
    title="FinGuard AI Engine & API Gateway",
    description="Full-stack AI-Powered Financial Monitoring, Fraud Detection & Risk Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(fraud.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(investigations.router)
app.include_router(assistant.router)
app.include_router(assistant_actions.router)
app.include_router(models.router)
app.include_router(entities.router)

class ConnectionManager:
    """Manages active WebSocket connections for live transaction & alert streaming."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for conn in dead_connections:
            self.disconnect(conn)

ws_manager = ConnectionManager()

@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "FinGuard AI Fraud Engine Gateway",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.websocket("/ws/transactions")
async def websocket_transactions(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Emit live streaming transactions every 3 seconds for demo presentation
            await asyncio.sleep(3)
            txn_id = f"TXN-{random.randint(82000, 89999)}"
            amount = float(random.randint(450, 85000))
            is_high_risk = amount > 35000 and random.random() > 0.4
            risk_score = round(random.uniform(0.78, 0.96), 2) if is_high_risk else round(random.uniform(0.02, 0.22), 2)
            risk_level = "HIGH" if is_high_risk else "LOW"

            event_data = {
                "event_type": "TRANSACTION_RECEIVED",
                "transaction_id": txn_id,
                "timestamp": datetime.now().isoformat(),
                "amount": amount,
                "merchant": random.choice(["Swiggy Food", "XYZ Electronics", "Apex Crypto", "Amazon India", "MakeMyTrip"]),
                "payment_method": random.choice(["UPI", "Credit Card", "Bank Transfer"]),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "flagged": is_high_risk
            }
            await ws_manager.broadcast(event_data)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
