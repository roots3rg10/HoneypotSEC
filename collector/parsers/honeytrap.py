"""Parser para logs JSON de Honeytrap."""
import json
from datetime import datetime
from parsers.base import AttackEvent

def parse_line(line: str) -> AttackEvent | None:
    try:
        data = json.loads(line.strip())
    except json.JSONDecodeError:
        return None

    src_ip = data.get("source_ip") or data.get("src", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("date", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.utcnow()

    return AttackEvent(
        honeypot    = "honeytrap",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = data.get("source_port"),
        dest_port   = data.get("destination_port") or data.get("port"),
        protocol    = data.get("type", "TCP"),
        attack_type = "Escaneo / sondeo de puerto",
        payload     = data.get("payload"),
        raw_data    = data,
    )
