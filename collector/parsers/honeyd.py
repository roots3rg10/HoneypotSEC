"""Parser para logs de Honeyd (reimplementación Python 3 asyncio)."""
import json
from datetime import datetime, timezone
from parsers.base import AttackEvent

def parse_line(line: str) -> AttackEvent | None:
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

    dest_port = data.get("dest_port")
    protocol  = data.get("protocol", "tcp").upper()

    port_names = {23: "Telnet", 25: "SMTP", 80: "HTTP"}
    service    = port_names.get(dest_port, f"puerto {dest_port}")

    return AttackEvent(
        honeypot    = "honeyd",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = data.get("source_port"),
        dest_port   = dest_port,
        protocol    = protocol,
        attack_type = f"Sondeo de red ({service})",
        payload     = data.get("payload") or None,
        raw_data    = data,
    )
