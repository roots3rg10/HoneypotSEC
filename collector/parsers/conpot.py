"""Parser para logs de texto de Conpot (ICS/SCADA honeypot v0.6)."""
import re
from datetime import datetime
from parsers.base import AttackEvent

# Ejemplos de líneas de ataque en conpot.log:
#   2026-04-17 14:38:39,082 Modbus request from 1.2.3.4:5678
#   2026-04-17 14:38:39,082 S7comm request from 1.2.3.4:5678
#   2026-04-17 14:38:39,082 1.2.3.4 connected to Modbus server
LOG_RE = re.compile(
    r"(?P<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\d+\s+"
    r".*?"
    r"(?P<ip>\d{1,3}(?:\.\d{1,3}){3})"
    r"(?::(?P<port>\d+))?"
)

PROTOCOL_MAP = {
    "modbus":   ("Modbus",      502),
    "s7comm":   ("Siemens S7",  102),
    "enip":     ("EtherNet/IP", 44818),
    "http":     ("HTTP/ICS",    80),
    "ftp":      ("FTP/ICS",     21),
    "snmp":     ("SNMP",        161),
    "bacnet":   ("BACnet",      47808),
    "ipmi":     ("IPMI",        623),
}

# Líneas de inicio que no son ataques — las ignoramos
SKIP_PATTERNS = re.compile(
    r"Starting Conpot|Using template|configuration found|"
    r"Initializing|Please wait|Fetched|Found and enabled|"
    r"initialized|started on|responding to|Class\s+\d|"
    r"Serving File System|Creating persistent|No proxy"
)

def parse_line(line: str) -> AttackEvent | None:
    line = line.strip()
    if not line or SKIP_PATTERNS.search(line):
        return None

    m = LOG_RE.match(line)
    if not m:
        return None

    src_ip = m.group("ip")
    # Ignorar IPs internas de la propia máquina
    if src_ip.startswith("127.") or src_ip.startswith("0."):
        return None

    try:
        ts = datetime.strptime(m.group("ts"), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None

    line_lower = line.lower()
    protocol, dest_port = "ICS", None
    for keyword, (proto, port) in PROTOCOL_MAP.items():
        if keyword in line_lower:
            protocol, dest_port = proto, port
            break

    return AttackEvent(
        honeypot    = "conpot",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = int(m.group("port")) if m.group("port") else None,
        dest_port   = dest_port,
        protocol    = protocol,
        attack_type = f"Ataque ICS/SCADA ({protocol})",
        raw_data    = {"raw": line},
    )
