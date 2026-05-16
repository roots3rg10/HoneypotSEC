#!/usr/bin/env python3
"""
HoneypotSEC — Port Monitor
Escucha en múltiples puertos TCP, registra intentos de conexión y captura banners.
"""
import asyncio
import json
import logging
import os
from datetime import datetime, timezone

LOG_DIR  = "/app/logs"
LOG_FILE = os.environ.get("LOG_FILE", f"{LOG_DIR}/portmon.log")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format="%(message)s")

PORTS = [int(p) for p in os.environ.get("LISTEN_PORTS", "23,25,110,143").split(",")]

BANNERS = {
    23:   b"Login: ",
    25:   b"220 mail.local ESMTP Postfix (Ubuntu)\r\n",
    110:  b"+OK POP3 server ready\r\n",
    143:  b"* OK [CAPABILITY IMAP4rev1] IMAP4rev1 server ready\r\n",
    587:  b"220 mail.local ESMTP\r\n",
    3389: b"\x03\x00\x00\x13\x0e\xd0\x00\x00\x124\x00\x02\x00\x08\x00\x00\x00",
    5900: b"RFB 003.008\n",
    1433: b"\x04\x01\x00\x2b\x00\x00\x01\x00",
    6379: b"-ERR unknown command\r\n",
}

async def handle_client(reader, writer, port):
    peer = writer.get_extra_info("peername") or ("unknown", 0)
    now  = datetime.now(timezone.utc)
    event = {
        "date":             now.isoformat(),
        "source_ip":        peer[0],
        "source_port":      peer[1],
        "destination_port": port,
        "type":             "TCP",
    }
    try:
        banner = BANNERS.get(port, b"")
        if banner:
            writer.write(banner)
            await writer.drain()
        data = await asyncio.wait_for(reader.read(512), timeout=8)
        if data:
            event["payload"] = data.decode("utf-8", errors="replace").strip()[:256]
    except (asyncio.TimeoutError, ConnectionResetError):
        pass
    except Exception as e:
        event["error"] = str(e)
    finally:
        logging.info(json.dumps(event))
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass

async def main():
    servers = []
    for port in PORTS:
        try:
            srv = await asyncio.start_server(
                lambda r, w, p=port: handle_client(r, w, p),
                "0.0.0.0", port,
                reuse_address=True,
            )
            servers.append(srv)
            logging.info(json.dumps({"msg": f"Listening on port {port}"}))
        except Exception as e:
            logging.warning(json.dumps({"msg": f"Cannot bind {port}: {e}"}))

    if not servers:
        return
    await asyncio.gather(*[s.serve_forever() for s in servers])

if __name__ == "__main__":
    asyncio.run(main())
