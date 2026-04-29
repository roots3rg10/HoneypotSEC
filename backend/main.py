from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routers import attacks, stats, education, news
import asyncio
import json

app = FastAPI(title="Honeypot Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(attacks.router)
app.include_router(stats.router)
app.include_router(education.router)
app.include_router(news.router)

# ─── WebSocket para ataques en tiempo real ────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        for ws in list(self.active):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.active.remove(ws)

manager = ConnectionManager()

@app.websocket("/ws/attacks")
async def ws_attacks(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
