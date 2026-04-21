"""
Web honeypot (Glastopf replacement).
Captura y registra todas las peticiones HTTP entrantes en formato JSON.
"""
import json
import logging
import os
from datetime import datetime, timezone
from flask import Flask, request

LOG_FILE = "/opt/glastopf/log/glastopf.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(message)s",
)

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"])
@app.route("/<path:path>",          methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"])
def catch_all(path):
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "honeypot": "glastopf",
        "source_ip": request.remote_addr,
        "method": request.method,
        "path": "/" + path,
        "query": request.query_string.decode(errors="replace"),
        "user_agent": request.headers.get("User-Agent", ""),
        "content_type": request.headers.get("Content-Type", ""),
        "payload": request.get_data(as_text=True)[:4096],
    }
    logging.info(json.dumps(event))
    return (
        "<html><body><h1>404 Not Found</h1></body></html>",
        404,
        {"Content-Type": "text/html", "Server": "Apache/2.4.41 (Ubuntu)"},
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
