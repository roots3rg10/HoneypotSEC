import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import require_admin
from models import Sensor, User
from schemas import SensorBootstrapOut, SensorOut, SensorTokenOut, SensorTokenRequest
from security import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/sensor", tags=["sensor"])

BACKEND_URL = os.environ.get("BACKEND_URL", "https://honeypotsec.duckdns.org")

# ─── Honeypots disponibles por plan ───────────────────────────
PLAN_SERVICES = {
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
      - "2222:2222"
      - "2323:2323"
    volumes:
      - cowrie_logs:/home/cowrie/var/log/cowrie
    restart: unless-stopped
""",
    "dionaea": """\
  dionaea:
    image: dinotools/dionaea:latest
    container_name: hs_dionaea
    ports:
      - "21:21"
      - "445:445"
      - "3306:3306"
    volumes:
      - dionaea_logs:/opt/dionaea/var/log/dionaea
    restart: unless-stopped
""",
    "honeytrap": """\
  honeytrap:
    image: honeytrap/honeytrap:latest
    container_name: hs_honeytrap
    volumes:
      - honeytrap_logs:/data
    restart: unless-stopped
""",
    "conpot": """\
  conpot:
    image: honeynet/conpot:latest
    container_name: hs_conpot
    ports:
      - "102:102"
      - "502:502"
    volumes:
      - conpot_logs:/var/log/conpot
    restart: unless-stopped
""",
    "glastopf": """\
  glastopf:
    image: mushorg/glastopf:latest
    container_name: hs_glastopf
    ports:
      - "8080:80"
    volumes:
      - glastopf_logs:/opt/glastopf/log
    restart: unless-stopped
""",
    "honeyd": """\
  honeyd:
    image: honeyd/honeyd:latest
    container_name: hs_honeyd
    volumes:
      - honeyd_logs:/var/log/honeyd
    cap_add:
      - NET_ADMIN
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
    image: honeypotsec/agent:latest
    container_name: hs_agent
    environment:
      INGEST_URL: {BACKEND_URL}/api/ingest/{tenant_id}
      INGEST_TOKEN: {ingest_token}
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
    cmd   = f"curl -s {BACKEND_URL}/install | sudo bash -s -- --token {token}"

    return SensorTokenOut(
        install_token=token,
        expires_in="72 horas",
        install_cmd=cmd,
    )


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

    # Registrar sensor en BD
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


@router.post("/heartbeat")
async def heartbeat(
    token: str = Query(...),
    db:    AsyncSession = Depends(get_db),
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
    token: str = Query(...),
    db:    AsyncSession = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"verify_exp": False})
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    tenant_id = payload.get("tenant_id")
    result = await db.execute(
        select(Sensor).where(Sensor.tenant_id == tenant_id)
        .order_by(Sensor.installed_at.desc())
    )
    return result.scalars().all()
