import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse, PlainTextResponse
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import require_admin
from models import Attack, Sensor, User
from schemas import SensorBootstrapOut, SensorOut, SensorTokenOut, SensorTokenRequest, ClientTokenOut
from security import SECRET_KEY, ALGORITHM, get_current_user

router = APIRouter(prefix="/api/sensor", tags=["sensor"])

BACKEND_URL = os.environ.get("BACKEND_URL", "https://honeypotsec.duckdns.org")

# ─── Honeypots disponibles por plan ───────────────────────────
PLAN_SERVICES = {
    "freemium":    [],
    "basico":      ["cowrie", "dionaea"],
    "profesional": ["cowrie", "dionaea", "honeytrap", "conpot"],
    "empresarial": ["cowrie", "dionaea", "honeytrap", "conpot", "glastopf", "honeyd"],
}

# ─── Definición de cada servicio honeypot ─────────────────────
VOLUME_NAMES = {
    "cowrie":    "cowrie_logs",
    "dionaea":   "dionaea_logs",
    "honeytrap": "honeytrap_logs",
    "conpot":    "conpot_logs",
    "glastopf":  "glastopf_logs",
    "honeyd":    "honeyd_logs",
}

# Cada bloque de servicio ya lleva indentación de 2 espacios (nivel services)
SERVICE_BLOCKS = {
    "cowrie": """\
  cowrie:
    image: cowrie/cowrie:latest
    container_name: hs_cowrie
    ports:
      - "${PRIVATE_IP}:2222:2222"
      - "${PRIVATE_IP}:2323:2323"
    volumes:
      - cowrie_logs:/cowrie/cowrie-git/var/log/cowrie
    restart: unless-stopped
""",
    "dionaea": """\
  dionaea:
    image: dinotools/dionaea:latest
    container_name: hs_dionaea
    ports:
      - "${PRIVATE_IP}:21:21"
      - "${PRIVATE_IP}:445:445"
      - "${PRIVATE_IP}:3306:3306"
    volumes:
      - dionaea_logs:/opt/dionaea/var/log/dionaea
    restart: unless-stopped
""",
    "honeytrap": """\
  honeytrap:
    build:
      context: ./agent
      dockerfile: portmon.Dockerfile
    container_name: hs_honeytrap
    environment:
      LISTEN_PORTS: "25,110,143,587"
      LOG_FILE: /app/logs/honeytrap.json
    ports:
      - "${PRIVATE_IP}:25:25"
      - "${PRIVATE_IP}:110:110"
      - "${PRIVATE_IP}:143:143"
      - "${PRIVATE_IP}:587:587"
    volumes:
      - honeytrap_logs:/app/logs
    restart: unless-stopped
""",
    "conpot": """\
  conpot:
    image: honeynet/conpot:latest
    container_name: hs_conpot
    ports:
      - "${PRIVATE_IP}:102:102"
      - "${PRIVATE_IP}:502:502"
    volumes:
      - conpot_logs:/var/log/conpot
    restart: unless-stopped
""",
    "glastopf": """\
  glastopf:
    build:
      context: ./agent
      dockerfile: webhoneypot.Dockerfile
    container_name: hs_glastopf
    ports:
      - "${WEB_BIND_IP}:8080:80"
    volumes:
      - glastopf_logs:/app/logs
    restart: unless-stopped
""",
    "honeyd": """\
  honeyd:
    build:
      context: ./agent
      dockerfile: portmon.Dockerfile
    container_name: hs_honeyd
    environment:
      LISTEN_PORTS: "23,3389,5900,1433,6379"
      LOG_FILE: /app/logs/honeyd.log
    ports:
      - "${PRIVATE_IP}:23:23"
      - "${PRIVATE_IP}:3389:3389"
      - "${PRIVATE_IP}:5900:5900"
      - "${PRIVATE_IP}:1433:1433"
      - "${PRIVATE_IP}:6379:6379"
    volumes:
      - honeyd_logs:/app/logs
    restart: unless-stopped
""",
}


def _build_compose(plan: str, tenant_id: int, ingest_token: str) -> str:
    services = PLAN_SERVICES.get(plan, PLAN_SERVICES["basico"])

    vol_mounts  = "\n".join(f"      - {VOLUME_NAMES[s]}:/logs/{s}:ro" for s in services)
    vol_depends = "\n".join(f"      - {s}" for s in services)
    vol_decl    = "\n".join(f"  {VOLUME_NAMES[s]}:" for s in services)

    honeypot_blocks = "".join(SERVICE_BLOCKS[s] for s in services)

    agent_block = f"""\
  hs-agent:
    build: ./agent
    container_name: hs_agent
    environment:
      INGEST_URL: {BACKEND_URL}/api/sensor/ingest/{tenant_id}
      INGEST_TOKEN: {ingest_token}
      BACKEND_URL: {BACKEND_URL}
      PLAN: {plan}
    volumes:
{vol_mounts}
    restart: unless-stopped
    depends_on:
{vol_depends}
"""

    return (
        f"# HoneypotSEC Sensor — Plan: {plan}\n"
        f"# Generado automáticamente. No editar manualmente.\n"
        f"services:\n"
        f"{honeypot_blocks}"
        f"{agent_block}"
        f"volumes:\n"
        f"{vol_decl}\n"
    )


def _create_install_token(client_id: int, plan: str) -> str:
    payload = {
        "type": "sensor_install",
        "sub":  str(client_id),
        "plan": plan,
        "exp":  datetime.now(timezone.utc) + timedelta(hours=72),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _create_ingest_token(tenant_id: int, sensor_id: int) -> str:
    payload = {
        "type":      "sensor_ingest",
        "tenant_id": tenant_id,
        "sensor_id": sensor_id,
        # Sin expiración fija — el token es válido mientras el sensor esté activo
        "iat":       datetime.now(timezone.utc).timestamp(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─── Endpoints ────────────────────────────────────────────────

@router.post("/generate-token", response_model=SensorTokenOut)
async def generate_install_token(
    body: SensorTokenRequest,
    db:   AsyncSession = Depends(get_db),
    _:    User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.id == body.client_id, User.role == "client")
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    token = _create_install_token(client.id, client.plan or "basico")
    cmd   = f"curl -sL {BACKEND_URL}/install | sudo bash -s -- --token {token}"

    client.sensor_install_token    = token
    client.sensor_token_created_at = datetime.now(timezone.utc)
    await db.commit()

    return SensorTokenOut(
        install_token=token,
        expires_in="72 horas",
        install_cmd=cmd,
    )


@router.get("/client-token/{client_id}", response_model=ClientTokenOut)
async def get_client_token(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _:  User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.id == client_id, User.role == "client")
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    if not client.sensor_install_token or not client.sensor_token_created_at:
        return ClientTokenOut(has_token=False)

    expires_at = client.sensor_token_created_at + timedelta(hours=72)
    is_expired = datetime.now(timezone.utc) > expires_at
    cmd        = f"curl -sL {BACKEND_URL}/install | sudo bash -s -- --token {client.sensor_install_token}"

    return ClientTokenOut(
        has_token=True,
        install_token=client.sensor_install_token,
        install_cmd=cmd,
        created_at=client.sensor_token_created_at,
        expires_at=expires_at,
        is_expired=is_expired,
    )


@router.get("/my-token", response_model=ClientTokenOut)
async def get_my_token(
    db:           AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Solo para clientes")

    if not current_user.sensor_install_token or not current_user.sensor_token_created_at:
        return ClientTokenOut(has_token=False)

    expires_at = current_user.sensor_token_created_at + timedelta(hours=72)
    is_expired = datetime.now(timezone.utc) > expires_at
    cmd        = f"curl -sL {BACKEND_URL}/api/sensor/install | sudo bash -s -- --token {current_user.sensor_install_token}"

    return ClientTokenOut(
        has_token     = True,
        install_token = current_user.sensor_install_token,
        install_cmd   = cmd,
        created_at    = current_user.sensor_token_created_at,
        expires_at    = expires_at,
        is_expired    = is_expired,
    )


@router.delete("/client-token/{client_id}", status_code=204)
async def revoke_client_token(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _:  User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.id == client_id, User.role == "client")
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    client.sensor_install_token    = None
    client.sensor_token_created_at = None
    await db.commit()


@router.get("/install", response_class=PlainTextResponse)
async def get_install_script():
    # /app/sensor/install.sh — montado como volumen en Docker
    script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sensor", "install.sh")
    try:
        with open(script_path) as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Script no disponible")


@router.get("/bootstrap", response_model=SensorBootstrapOut)
async def bootstrap(
    token:    str = Query(...),
    hostname: str = Query(default="unknown"),
    ip:       str = Query(default="unknown"),
    db:       AsyncSession = Depends(get_db),
):
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise invalid

    if payload.get("type") != "sensor_install":
        raise invalid

    tenant_id = int(payload["sub"])
    plan      = payload.get("plan", "basico")

    result = await db.execute(select(User).where(User.id == tenant_id))
    client = result.scalar_one_or_none()
    if not client or client.role != "client":
        raise invalid

    # Upsert: si ya existe un sensor con ese hostname para este tenant, reutilizarlo
    existing = (await db.execute(
        select(Sensor).where(Sensor.tenant_id == tenant_id, Sensor.hostname == hostname[:255])
    )).scalar_one_or_none()

    if existing:
        existing.ip_address = ip[:45]
        existing.plan       = plan
        existing.status     = "active"
        sensor = existing
    else:
        sensor = Sensor(
            tenant_id  = tenant_id,
            hostname   = hostname[:255],
            ip_address = ip[:45],
            plan       = plan,
            status     = "active",
        )
        db.add(sensor)

    await db.commit()
    await db.refresh(sensor)

    ingest_token = _create_ingest_token(tenant_id, sensor.id)
    compose      = _build_compose(plan, tenant_id, ingest_token)

    return SensorBootstrapOut(
        tenant_id    = tenant_id,
        plan         = plan,
        sensor_id    = sensor.id,
        ingest_token = ingest_token,
        compose      = compose,
    )


def _is_public_ip(ip: str) -> bool:
    """Devuelve True si la IP no es privada ni de Docker."""
    if not ip:
        return False
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    try:
        a, b = int(parts[0]), int(parts[1])
        if a == 10: return False
        if a == 172 and 16 <= b <= 31: return False
        if a == 192 and b == 168: return False
        return True
    except ValueError:
        return False


@router.api_route("/heartbeat", methods=["GET", "POST"])
async def heartbeat(
    request: Request,
    token:   str          = Query(...),
    db:      AsyncSession = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"verify_exp": False})
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    if payload.get("type") != "sensor_ingest":
        raise HTTPException(status_code=401, detail="Token inválido")

    sensor_id = payload.get("sensor_id")
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalar_one_or_none()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")

    sensor.last_seen = datetime.now(timezone.utc)

    # Actualizar IP pública desde cabecera que pone nginx
    client_ip = (
        request.headers.get("X-Real-IP") or
        (request.headers.get("X-Forwarded-For") or "").split(",")[0].strip() or
        (request.client.host if request.client else None)
    )
    if client_ip and _is_public_ip(client_ip):
        sensor.ip_address = client_ip[:45]

    await db.commit()
    return {"status": "ok"}


@router.get("/list", response_model=list[SensorOut])
async def list_sensors(
    db: AsyncSession = Depends(get_db),
    _:  User = Depends(require_admin),
):
    result = await db.execute(select(Sensor).order_by(Sensor.installed_at.desc()))
    return result.scalars().all()


@router.get("/list/mine", response_model=list[SensorOut])
async def list_my_sensors(
    tenant_id:    Optional[int] = None,
    db:           AsyncSession  = Depends(get_db),
    current_user: User          = Depends(get_current_user),
):
    if current_user.role in ("admin", "employee") and tenant_id is not None:
        effective_id = tenant_id
    else:
        effective_id = current_user.id

    result = await db.execute(
        select(Sensor).where(Sensor.tenant_id == effective_id)
        .order_by(Sensor.installed_at.desc())
    )
    return result.scalars().all()


# ── Servir ficheros del agente ────────────────────────────────

_AGENT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sensor", "agent")


@router.get("/agent/{filename}", response_class=PlainTextResponse)
async def get_agent_file(filename: str):
    allowed = {
        "agent.py", "requirements.txt", "Dockerfile",
        "webhoneypot.py", "webhoneypot.Dockerfile",
        "portmon.py",    "portmon.Dockerfile",
        "cowrie.cfg",
    }
    if filename not in allowed:
        raise HTTPException(status_code=404)
    path = os.path.join(_AGENT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"{filename} no encontrado")
    with open(path) as f:
        return f.read()


# ── Ingest: recibir eventos de sensores remotos ───────────────

class IngestEvent(BaseModel):
    honeypot:    str
    source_ip:   str
    timestamp:   Optional[str] = None
    source_port: Optional[int] = None
    dest_port:   Optional[int] = None
    protocol:    Optional[str] = None
    attack_type: Optional[str] = None
    username:    Optional[str] = None
    password:    Optional[str] = None
    payload:     Optional[str] = None
    session_id:  Optional[str] = None
    raw_data:    Optional[Any] = None


_geo_cache: dict[str, dict] = {}


async def _geolocate(ip: str) -> dict:
    if ip in _geo_cache:
        return _geo_cache[ip]
    try:
        async with httpx.AsyncClient(timeout=4) as client:
            r = await client.get(
                f"http://ip-api.com/json/{ip}?fields=country,countryCode,city,lat,lon"
            )
            data = r.json() if r.is_success else {}
    except Exception:
        data = {}
    _geo_cache[ip] = data
    return data


@router.post("/ingest/{tenant_id}", status_code=202)
async def ingest_event(
    tenant_id: int,
    event:     IngestEvent,
    request:   Request,
    db:        AsyncSession = Depends(get_db),
):
    # Validar token Bearer
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = auth.removeprefix("Bearer ").strip()

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"verify_exp": False})
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    if payload.get("type") != "sensor_ingest" or payload.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Actualizar last_seen del sensor
    sensor_id = payload.get("sensor_id")
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalar_one_or_none()
    if sensor:
        sensor.last_seen = datetime.now(timezone.utc)

    # Geolocalizar
    geo = await _geolocate(event.source_ip)

    # Parsear timestamp
    ts = datetime.now(timezone.utc)
    if event.timestamp:
        try:
            ts = datetime.fromisoformat(event.timestamp)
        except Exception:
            pass

    attack = Attack(
        timestamp    = ts,
        honeypot     = event.honeypot,
        source_ip    = event.source_ip,
        source_port  = event.source_port,
        dest_port    = event.dest_port,
        protocol     = event.protocol,
        country      = geo.get("country"),
        country_code = geo.get("countryCode"),
        city         = geo.get("city"),
        latitude     = geo.get("lat"),
        longitude    = geo.get("lon"),
        attack_type  = event.attack_type,
        username     = event.username,
        password     = event.password,
        payload      = event.payload,
        session_id   = event.session_id,
        raw_data     = event.raw_data,
        sensor_id    = sensor_id,
    )
    db.add(attack)
    await db.commit()
    return {"status": "accepted"}
