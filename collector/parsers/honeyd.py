"""
Parser para logs de Honeyd.
Honeyd escribe en formato syslog:
  2024-01-15 10:23:45 tcp(6) - 1.2.3.4 45678 192.168.1.1 22: 1 S
"""
import re
from datetime import datetime
from parsers.base import AttackEvent

LOG_RE = re.compile(
    r"(?P<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+"
    r"(?P<proto>\w+)\(\d+\)\s+\S+\s+"
    r"(?P<src_ip>[\d.]+)\s+(?P<src_port>\d+)\s+"
    r"(?P<dst_ip>[\d.]+)\s+(?P<dst_port>\d+)"
)

def parse_line(line: str) -> AttackEvent | None:
    m = LOG_RE.search(line)
    if not m:
        return None

    try:
        ts = datetime.strptime(m.group("ts"), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        ts = datetime.utcnow()

    return AttackEvent(
        honeypot    = "honeyd",
        source_ip   = m.group("src_ip"),
        timestamp   = ts,
        source_port = int(m.group("src_port")),
        dest_port   = int(m.group("dst_port")),
        protocol    = m.group("proto").upper(),
        attack_type = "Sondeo de red",
        raw_data    = {"raw": line.strip()},
    )
