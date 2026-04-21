"""
Parser para logs JSON de Cowrie (SSH/Telnet honeypot).
Cowrie escribe un evento JSON por línea en cowrie.json.
"""
import json
from datetime import datetime
from parsers.base import AttackEvent

def parse_line(line: str) -> AttackEvent | None:
    try:
        data = json.loads(line.strip())
    except json.JSONDecodeError:
        return None

    event_id = data.get("eventid", "")
    src_ip   = data.get("src_ip") or data.get("peerIP", "")
    if not src_ip:
        return None

    ts_raw = data.get("timestamp", "")
    try:
        ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
    except Exception:
        ts = datetime.utcnow()

    # Tipo de ataque según el evento de Cowrie
    attack_type_map = {
        "cowrie.login.failed":    "SSH Brute Force",
        "cowrie.login.success":   "SSH Login exitoso",
        "cowrie.command.input":   "Ejecución de comandos",
        "cowrie.session.file_download": "Descarga de archivo",
        "cowrie.client.version":  "Reconocimiento SSH",
        "cowrie.session.connect": "Conexión SSH",
    }
    attack_type = attack_type_map.get(event_id, event_id)

    return AttackEvent(
        honeypot    = "cowrie",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = data.get("src_port"),
        dest_port   = 22,
        protocol    = "SSH",
        attack_type = attack_type,
        username    = data.get("username"),
        password    = data.get("password"),
        payload     = data.get("input"),
        session_id  = data.get("session"),
        raw_data    = data,
    )
