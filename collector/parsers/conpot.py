"""Parser para logs JSON de Conpot (ICS/SCADA honeypot)."""
import json
from datetime import datetime
from parsers.base import AttackEvent

PORT_PROTOCOL = {
    102:   "Siemens S7",
    502:   "Modbus",
    44818: "EtherNet/IP",
    80:    "HTTP/ICS",
    161:   "SNMP",
}

def parse_line(line: str) -> AttackEvent | None:
    try:
        data = json.loads(line.strip())
    except json.JSONDecodeError:
        return None

    src_ip = data.get("remote") or data.get("src_ip", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("timestamp", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.utcnow()

    dest_port  = data.get("port") or data.get("dst_port")
    protocol   = PORT_PROTOCOL.get(dest_port, data.get("protocol", "ICS"))

    return AttackEvent(
        honeypot    = "conpot",
        source_ip   = src_ip,
        timestamp   = ts,
        dest_port   = dest_port,
        protocol    = protocol,
        attack_type = f"Ataque ICS/SCADA ({protocol})",
        payload     = json.dumps(data.get("request")) if data.get("request") else None,
        raw_data    = data,
    )
