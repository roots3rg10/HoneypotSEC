import os
import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from database import get_db, engine
from models import Base, User
from routers import attacks, stats, education, news, quiz
from routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear admin inicial si no existe ningún usuario admin
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async for db in get_db():
        result = await db.execute(select(User).where(User.role == "admin").limit(1))
        if result.scalar_one_or_none() is None:
            from security import hash_password
            admin = User(
                username        = os.environ.get("ADMIN_USERNAME", "admin"),
                email           = os.environ.get("ADMIN_EMAIL", "admin@localhost"),
                hashed_password = hash_password(os.environ["ADMIN_PASSWORD"]),
                role            = "admin",
                is_active       = True,
            )
            db.add(admin)
            await db.commit()
        break

    yield


app = FastAPI(title="Honeypot Platform API", version="1.0.0", lifespan=lifespan)

allowed_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "https://localhost").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attacks.router)
app.include_router(stats.router)
app.include_router(education.router)
app.include_router(quiz.router)
app.include_router(news.router)


# ─── WebSocket para ataques en tiempo real ────────────────────
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
