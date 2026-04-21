"""Parser para logs de texto de Dionaea (dinotools/dionaea)."""
import re
from datetime import datetime
from parsers.base import AttackEvent

# Formato: [DDMMYYYY HH:MM:SS] module file:line-level: message
# Línea de conexión aceptada:
#   [17042026 14:45:23] connection .../connection.c:900-info: connection 0x... tcp accepted from 1.2.3.4:12345 to 0.0.0.0:445
ACCEPT_RE = re.compile(
    r"\[(?P<date>\d{8}) (?P<time>\d{2}:\d{2}:\d{2})\].*?"
    r"(?P<proto>tcp|udp) accepted from "
    r"(?P<src_ip>\d{1,3}(?:\.\d{1,3}){3}):(?P<src_port>\d+)"
    r" to [^:]+:(?P<dst_port>\d+)"
)

PORT_SERVICE = {
    21:   "FTP",
    42:   "WINS",
    69:   "TFTP",
    80:   "HTTP",
    443:  "HTTPS",
    445:  "SMB",
    1433: "MSSQL",
    1723: "PPTP",
    1883: "MQTT",
    3306: "MySQL",
}

SKIP_RE = re.compile(r"-debug:|-message:|new module|Import module|ihandler")

def parse_line(line: str) -> AttackEvent | None:
    line = line.strip()
    if not line or SKIP_RE.search(line):
        return None

    m = ACCEPT_RE.search(line)
    if not m:
        return None

    date_str = m.group("date")  # DDMMYYYY
    time_str = m.group("time")
    try:
        ts = datetime.strptime(f"{date_str} {time_str}", "%d%m%Y %H:%M:%S")
    except ValueError:
        return None

    src_ip   = m.group("src_ip")
    src_port = int(m.group("src_port"))
    dst_port = int(m.group("dst_port"))
    protocol = m.group("proto").upper()
    service  = PORT_SERVICE.get(dst_port, f"puerto {dst_port}")

    return AttackEvent(
        honeypot    = "dionaea",
        source_ip   = src_ip,
        timestamp   = ts,
        source_port = src_port,
        dest_port   = dst_port,
        protocol    = protocol,
        attack_type = f"Intento de conexión {service}",
        raw_data    = {"raw": line},
    )
