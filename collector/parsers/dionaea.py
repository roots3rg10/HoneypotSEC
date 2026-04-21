"""
Parser para logs JSON de Dionaea.
Dionaea escribe logs en formato JSON Lines.
"""
import json
from datetime import datetime
from parsers.base import AttackEvent

PORT_PROTOCOL = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    69: "TFTP", 80: "HTTP", 443: "HTTPS", 445: "SMB",
    1433: "MSSQL", 1723: "PPTP", 1883: "MQTT", 3306: "MySQL",
}

def parse_line(line: str) -> AttackEvent | None:
    try:
        data = json.loads(line.strip())
    except json.JSONDecodeError:
        return None

    src_ip = data.get("src_ip") or data.get("remote_host", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("timestamp", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.utcnow()

    dest_port  = data.get("dst_port") or data.get("local_port")
    protocol   = PORT_PROTOCOL.get(dest_port, data.get("protocol", "unknown"))
    event_type = data.get("event_type", "")

    attack_type_map = {
        "connection":   f"Conexión {protocol}",
        "download":     "Descarga de malware",
        "credentials":  "Credenciales capturadas",
        "login":        "Intento de login",
    }
    attack_type = attack_type_map.get(event_type, f"Dionaea {event_type}")

    return AttackEvent(
        honeypot    = "dionaea",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = data.get("src_port") or data.get("remote_port"),
        dest_port   = dest_port,
        protocol    = protocol,
        attack_type = attack_type,
        username    = data.get("username"),
        password    = data.get("password"),
        payload     = data.get("payload"),
        raw_data    = data,
    )
