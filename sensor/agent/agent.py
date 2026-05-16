"""
HoneypotSEC — Remote Sensor Agent
Watches honeypot log files and forwards events to the backend ingest API.
"""
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from threading import Thread

import requests
from watchdog.events import FileSystemEventHandler
from watchdog.observers.polling import PollingObserver

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [agent] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger(__name__)

INGEST_URL   = os.environ["INGEST_URL"]    # https://host/api/ingest/{tenant_id}
INGEST_TOKEN = os.environ["INGEST_TOKEN"]
SENSOR_ID    = os.environ.get("SENSOR_ID", "")
BACKEND_URL  = os.environ.get("BACKEND_URL", "")
PLAN         = os.environ.get("PLAN", "basico")

HEARTBEAT_INTERVAL = 60  # seconds

# ── Parsers ──────────────────────────────────────────────────

def _ts(raw: str) -> str:
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


def parse_cowrie(line: str) -> dict | None:
    try:
        d = json.loads(line)
    except Exception:
        return None
    src = d.get("src_ip") or d.get("peerIP", "")
    if not src:
        return None
    etype = d.get("eventid", "")
    atype_map = {
        "cowrie.login.failed":          "SSH Brute Force",
        "cowrie.login.success":         "SSH Login exitoso",
        "cowrie.command.input":         "Ejecución de comandos",
        "cowrie.session.file_download": "Descarga de archivo",
        "cowrie.client.version":        "Reconocimiento SSH",
        "cowrie.session.connect":       "Conexión SSH",
    }
    return {
        "honeypot":    "cowrie",
        "source_ip":   src,
        "timestamp":   _ts(d.get("timestamp", "")),
        "source_port": d.get("src_port"),
        "dest_port":   22,
        "protocol":    "SSH",
        "attack_type": atype_map.get(etype, etype),
        "username":    d.get("username"),
        "password":    d.get("password"),
        "payload":     d.get("input"),
        "session_id":  d.get("session"),
        "raw_data":    d,
    }


_DIONAEA_RE = re.compile(
    r"\[(?P<date>\d{8}) (?P<time>\d{2}:\d{2}:\d{2})\].*?"
    r"(?P<proto>tcp|udp) accepted from "
    r"(?P<src_ip>\d{1,3}(?:\.\d{1,3}){3}):(?P<src_port>\d+)"
    r" to [^:]+:(?P<dst_port>\d+)"
)
_DIONAEA_SKIP = re.compile(r"-debug:|-message:|new module|Import module|ihandler")
_PORT_SVC = {21: "FTP", 445: "SMB", 1433: "MSSQL", 3306: "MySQL",
             80: "HTTP", 443: "HTTPS", 69: "TFTP", 1883: "MQTT"}


def parse_dionaea(line: str) -> dict | None:
    line = line.strip()
    if not line or _DIONAEA_SKIP.search(line):
        return None
    m = _DIONAEA_RE.search(line)
    if not m:
        return None
    dst = int(m.group("dst_port"))
    try:
        ts = datetime.strptime(
            f"{m.group('date')} {m.group('time')}", "%d%m%Y %H:%M:%S"
        ).replace(tzinfo=timezone.utc).isoformat()
    except ValueError:
        ts = datetime.now(timezone.utc).isoformat()
    return {
        "honeypot":    "dionaea",
        "source_ip":   m.group("src_ip"),
        "timestamp":   ts,
        "source_port": int(m.group("src_port")),
        "dest_port":   dst,
        "protocol":    m.group("proto").upper(),
        "attack_type": f"Intento de conexión {_PORT_SVC.get(dst, f'puerto {dst}')}",
        "raw_data":    {"raw": line},
    }


def parse_honeytrap(line: str) -> dict | None:
    try:
        d = json.loads(line)
    except Exception:
        return None
    src = d.get("source_ip") or d.get("src", "")
    if not src:
        return None
    return {
        "honeypot":    "honeytrap",
        "source_ip":   src,
        "timestamp":   _ts(d.get("date", "")),
        "source_port": d.get("source_port"),
        "dest_port":   d.get("destination_port") or d.get("port"),
        "protocol":    d.get("type", "TCP"),
        "attack_type": "Escaneo / sondeo de puerto",
        "payload":     d.get("payload"),
        "raw_data":    d,
    }


def parse_conpot(line: str) -> dict | None:
    line = line.strip()
    if not line:
        return None
    try:
        d = json.loads(line)
        src = d.get("remote", "").split(":")[0]
        return {
            "honeypot":    "conpot",
            "source_ip":   src,
            "timestamp":   _ts(d.get("timestamp", "")),
            "protocol":    d.get("public_port_name", "ICS"),
            "attack_type": "Ataque ICS/SCADA",
            "raw_data":    d,
        }
    except Exception:
        pass
    m = re.search(r"(\d{1,3}(?:\.\d{1,3}){3})", line)
    if not m:
        return None
    return {
        "honeypot":    "conpot",
        "source_ip":   m.group(1),
        "timestamp":   datetime.now(timezone.utc).isoformat(),
        "protocol":    "ICS",
        "attack_type": "Ataque ICS/SCADA",
        "raw_data":    {"raw": line},
    }


def parse_glastopf(line: str) -> dict | None:
    line = line.strip()
    if not line:
        return None
    try:
        d = json.loads(line)
        src = d.get("src_ip") or d.get("source_ip", "")
        if not src or src == "unknown":
            return None
        return {
            "honeypot":    "glastopf",
            "source_ip":   src,
            "timestamp":   _ts(d.get("timestamp", d.get("date", ""))),
            "source_port": d.get("src_port"),
            "dest_port":   d.get("dest_port", 80),
            "protocol":    "HTTP",
            "attack_type": f"Ataque Web — {d.get('method','GET')} {d.get('path','')}".strip(" —"),
            "payload":     d.get("payload"),
            "raw_data":    d,
        }
    except Exception:
        pass
    m = re.search(r"(\d{1,3}(?:\.\d{1,3}){3})", line)
    if not m:
        return None
    return {
        "honeypot":    "glastopf",
        "source_ip":   m.group(1),
        "timestamp":   datetime.now(timezone.utc).isoformat(),
        "protocol":    "HTTP",
        "attack_type": "Ataque Web",
        "raw_data":    {"raw": line},
    }


_PORT_NAMES = {
    23: "Telnet", 25: "SMTP", 110: "POP3", 143: "IMAP", 587: "SMTP",
    3389: "RDP", 5900: "VNC", 1433: "MSSQL", 6379: "Redis", 5432: "PostgreSQL",
}


def parse_honeyd(line: str) -> dict | None:
    line = line.strip()
    if not line:
        return None
    try:
        d = json.loads(line)
        src = d.get("source_ip") or d.get("src_ip", "")
        if not src or src == "unknown":
            return None
        port = d.get("destination_port") or d.get("dest_port")
        svc  = _PORT_NAMES.get(port, f"puerto {port}") if port else "TCP"
        return {
            "honeypot":    "honeyd",
            "source_ip":   src,
            "timestamp":   _ts(d.get("date", d.get("timestamp", ""))),
            "source_port": d.get("source_port"),
            "dest_port":   port,
            "protocol":    d.get("type", "TCP"),
            "attack_type": f"Intento de conexión {svc}",
            "payload":     d.get("payload"),
            "raw_data":    d,
        }
    except Exception:
        pass
    m = re.search(
        r"(?P<proto>tcp|udp|icmp).*?from (?P<src>\d{1,3}(?:\.\d{1,3}){3})",
        line, re.IGNORECASE,
    )
    if not m:
        return None
    return {
        "honeypot":    "honeyd",
        "source_ip":   m.group("src"),
        "timestamp":   datetime.now(timezone.utc).isoformat(),
        "protocol":    m.group("proto").upper(),
        "attack_type": "Escaneo de red",
        "raw_data":    {"raw": line},
    }


SOURCES = {
    "cowrie":    ("/logs/cowrie/cowrie.json",      parse_cowrie),
    "dionaea":   ("/logs/dionaea/dionaea.log",      parse_dionaea),
    "honeytrap": ("/logs/honeytrap/honeytrap.json", parse_honeytrap),
    "conpot":    ("/logs/conpot/conpot.log",        parse_conpot),
    "glastopf":  ("/logs/glastopf/glastopf.log",   parse_glastopf),
    "honeyd":    ("/logs/honeyd/honeyd.log",        parse_honeyd),
}

# ── HTTP helpers ─────────────────────────────────────────────

SESSION = requests.Session()
SESSION.headers.update({"Authorization": f"Bearer {INGEST_TOKEN}"})


def send_event(event: dict) -> bool:
    try:
        r = SESSION.post(INGEST_URL, json=event, timeout=10)
        return r.status_code < 300
    except Exception as e:
        log.warning(f"send failed: {e}")
        return False


def heartbeat_loop():
    url = f"{BACKEND_URL}/api/sensor/heartbeat?token={INGEST_TOKEN}"
    while True:
        try:
            requests.get(url, timeout=10)
            log.debug("heartbeat ok")
        except Exception as e:
            log.warning(f"heartbeat error: {e}")
        time.sleep(HEARTBEAT_INTERVAL)


# ── File watcher ─────────────────────────────────────────────

class LogHandler(FileSystemEventHandler):
    def __init__(self, path: str, parser):
        self.path    = path
        self.parser  = parser
        self._offset = 0

    def on_modified(self, event):
        if event.src_path != self.path:
            return
        try:
            with open(self.path, "r", errors="replace") as f:
                f.seek(self._offset)
                for line in f:
                    if not line.strip():
                        continue
                    ev = self.parser(line)
                    if ev:
                        ok = send_event(ev)
                        status = "sent" if ok else "failed"
                        log.info(f"[{ev['honeypot']}] {ev.get('attack_type','')} "
                                 f"from {ev['source_ip']} → {status}")
                self._offset = f.tell()
        except FileNotFoundError:
            pass


def main():
    log.info(f"HoneypotSEC Agent starting — plan={PLAN} sensor={SENSOR_ID}")

    Thread(target=heartbeat_loop, daemon=True).start()

    observer = PollingObserver(timeout=5)
    for name, (path, parser) in SOURCES.items():
        directory = os.path.dirname(path)
        os.makedirs(directory, exist_ok=True)   # crear dir si el volumen está vacío
        handler = LogHandler(path, parser)
        observer.schedule(handler, directory, recursive=False)
        log.info(f"Watching {name}: {path}")

    observer.start()
    log.info("Agent running — waiting for events...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
