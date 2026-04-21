"""
Virtual network honeypot (Honeyd replacement).
Simula múltiples servicios de red y registra todas las conexiones.
"""
import asyncio
import json
import logging
import os
from datetime import datetime, timezone

LOG_FILE = "/var/log/honeyd/honeyd.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(message)s",
)


def log_event(src_ip, src_port, dst_port, protocol, data=""):
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "honeypot": "honeyd",
        "source_ip": src_ip,
        "source_port": src_port,
        "dest_port": dst_port,
        "protocol": protocol,
        "payload": data[:2048],
    }
    logging.info(json.dumps(event))


class HoneydProtocol(asyncio.Protocol):
    def __init__(self, port, banner=b""):
        self.port = port
        self.banner = banner
        self.transport = None

    def connection_made(self, transport):
        self.transport = transport
        peer = transport.get_extra_info("peername") or ("unknown", 0)
        self.src_ip, self.src_port = peer[0], peer[1]
        if self.banner:
            transport.write(self.banner)

    def data_received(self, data):
        log_event(self.src_ip, self.src_port, self.port, "tcp", data.decode(errors="replace"))
        self.transport.close()

    def connection_lost(self, exc):
        pass


SERVICES = [
    (23,  b"Ubuntu 20.04 LTS login: ",    "telnet"),
    (25,  b"220 mail.example.com ESMTP\r\n", "smtp"),
    (80,  b"HTTP/1.1 200 OK\r\nServer: Apache/2.4.41\r\nContent-Length: 0\r\n\r\n", "http"),
]


async def main():
    loop = asyncio.get_event_loop()
    servers = []
    for port, banner, proto in SERVICES:
        server = await loop.create_server(
            lambda b=banner, p=port: HoneydProtocol(p, b),
            "0.0.0.0",
            port,
        )
        servers.append(server)
        print(f"Listening on port {port} ({proto})")

    await asyncio.gather(*(s.serve_forever() for s in servers))


if __name__ == "__main__":
    asyncio.run(main())
