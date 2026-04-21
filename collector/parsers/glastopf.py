"""Parser para logs de Glastopf (web honeypot)."""
import json
from datetime import datetime
from parsers.base import AttackEvent

def parse_line(line: str) -> AttackEvent | None:
    try:
        data = json.loads(line.strip())
    except json.JSONDecodeError:
        return None

    src_ip = data.get("src_host", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("time", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.utcnow()

    pattern = data.get("pattern", "unknown")
    attack_map = {
        "sqli":       "SQL Injection",
        "rfi":        "Remote File Inclusion",
        "lfi":        "Local File Inclusion",
        "xss":        "Cross-Site Scripting (XSS)",
        "phpcode":    "PHP Code Injection",
        "unknown":    "Ataque web",
    }
    attack_type = attack_map.get(pattern, f"Web: {pattern}")

    return AttackEvent(
        honeypot    = "glastopf",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = data.get("src_port"),
        dest_port   = 80,
        protocol    = "HTTP",
        attack_type = attack_type,
        payload     = data.get("request_url"),
        raw_data    = data,
    )
