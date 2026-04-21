"""
Colector de logs de honeypots.
Monitoriza ficheros de log con watchdog y persiste eventos en PostgreSQL.
También enriquece cada IP con geolocalización via ip-api.com.
"""
import os
import time
import json
import logging
import requests
import psycopg2
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from parsers import cowrie, dionaea, honeytrap, glastopf, conpot, honeyd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [collector] %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://honeypot_user:honeypot_pass@db:5432/honeypot_db")

# Mapa honeypot → (ruta del log, módulo parser)
SOURCES = {
    "cowrie":    ("/logs/cowrie/cowrie.json",       cowrie),
    "dionaea":   ("/logs/dionaea/dionaea.log",       dionaea),
    "honeytrap": ("/logs/honeytrap/honeytrap.json",  honeytrap),
    "glastopf":  ("/logs/glastopf/glastopf.log",    glastopf),
    "conpot":    ("/logs/conpot/conpot.log",         conpot),
    "honeyd":    ("/logs/honeyd/honeyd.log",         honeyd),
}

# Caché de geoip para no repetir peticiones
_geo_cache: dict[str, dict] = {}

def geolocate(ip: str) -> dict:
    if ip in _geo_cache:
        return _geo_cache[ip]
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}?fields=country,countryCode,city,lat,lon",
                         timeout=3)
        data = r.json() if r.ok else {}
    except Exception:
        data = {}
    _geo_cache[ip] = data
    return data

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def insert_event(conn, event):
    geo = geolocate(event.source_ip)
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO attacks
              (timestamp, honeypot, source_ip, source_port, dest_port, protocol,
               country, country_code, city, latitude, longitude,
               attack_type, username, password, payload, session_id, raw_data)
            VALUES
              (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            event.timestamp, event.honeypot, event.source_ip,
            event.source_port, event.dest_port, event.protocol,
            geo.get("country"), geo.get("countryCode"), geo.get("city"),
            geo.get("lat"), geo.get("lon"),
            event.attack_type, event.username, event.password,
            event.payload, event.session_id,
            json.dumps(event.raw_data) if event.raw_data else None,
        ))
    conn.commit()

class LogHandler(FileSystemEventHandler):
    def __init__(self, parser_module, file_path: str, conn):
        self.parser  = parser_module
        self.path    = file_path
        self.conn    = conn
        self._offset = 0  # leer desde el principio al arrancar

    def _get_size(self) -> int:
        try:
            return os.path.getsize(self.path)
        except FileNotFoundError:
            return 0

    def on_modified(self, event):
        if event.src_path != self.path:
            return
        try:
            with open(self.path, "r", errors="replace") as f:
                f.seek(self._offset)
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    parsed = self.parser.parse_line(line)
                    if parsed:
                        try:
                            insert_event(self.conn, parsed)
                            log.info(f"[{parsed.honeypot}] {parsed.attack_type} from {parsed.source_ip}")
                        except Exception as e:
                            log.error(f"DB error: {e}")
                            self.conn = get_conn()
                self._offset = f.tell()
        except FileNotFoundError:
            pass

def main():
    log.info("Collector iniciando, esperando a que la BD esté lista...")
    conn = None
    for _ in range(20):
        try:
            conn = get_conn()
            log.info("Conectado a PostgreSQL")
            break
        except Exception as e:
            log.warning(f"BD no disponible aún: {e}")
            time.sleep(5)

    if conn is None:
        log.error("No se pudo conectar a la BD. Saliendo.")
        return

    observer = Observer()
    for name, (path, parser) in SOURCES.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        handler = LogHandler(parser, path, conn)
        observer.schedule(handler, os.path.dirname(path), recursive=False)
        log.info(f"Monitorizando {name}: {path}")

    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()
