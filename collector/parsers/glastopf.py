"""Parser para logs de Glastopf (reimplementación Python 3 Flask)."""
import json
from datetime import datetime, timezone
from parsers.base import AttackEvent

def parse_line(line: str) -> AttackEvent | None:
    # Ignorar líneas que no son JSON (ej: mensajes de Flask/Werkzeug)
    line = line.strip()
    if not line.startswith("{"):
        return None

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        return None

    src_ip = data.get("source_ip", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("timestamp", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.now(timezone.utc)

    method  = data.get("method", "GET")
    path    = data.get("path", "/")
    payload = data.get("payload") or data.get("query") or None

    return AttackEvent(
        honeypot    = "glastopf",
        source_ip   = src_ip,
        timestamp   = ts,
        dest_port   = 80,
        protocol    = "HTTP",
        attack_type = f"Petición web {method}",
        payload     = f"{method} {path}" + (f"?{data['query']}" if data.get("query") else ""),
        raw_data    = data,
    )
