#!/usr/bin/env python3
"""
HoneypotSEC — Web Honeypot
Emula un servidor Apache/PHP, registra todas las peticiones HTTP.
"""
import http.server
import json
import logging
import os
import socketserver
from datetime import datetime, timezone

LOG_DIR  = "/app/logs"
LOG_FILE = f"{LOG_DIR}/glastopf.log"
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format="%(message)s")

FAKE_PAGES = {
    "/":           (200, b"<html><body><h1>Welcome</h1><p>It works!</p></body></html>"),
    "/wp-login.php": (200, b"<html><body><form method='post'><input name='log'/><input name='pwd' type='password'/><input type='submit' value='Log In'/></form></body></html>"),
    "/admin":      (302, b""),
    "/phpmyadmin": (200, b"<html><body><h1>phpMyAdmin</h1></body></html>"),
}

FAKE_HEADERS = {
    "Server": "Apache/2.4.41 (Ubuntu)",
    "X-Powered-By": "PHP/7.4.3",
}

class HoneypotHandler(http.server.BaseHTTPRequestHandler):
    def _handle(self):
        length  = int(self.headers.get("Content-Length", 0))
        payload = self.rfile.read(length).decode("utf-8", errors="replace") if length else ""

        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "src_ip":    self.client_address[0],
            "src_port":  self.client_address[1],
            "method":    self.command,
            "path":      self.path,
            "ua":        self.headers.get("User-Agent", ""),
            "payload":   payload[:512] if payload else None,
        }
        logging.info(json.dumps(event))

        status, body = FAKE_PAGES.get(self.path, (404, b"<html><body><h1>404 Not Found</h1></body></html>"))
        if status == 302:
            self.send_response(302)
            self.send_header("Location", "/admin/login")
            self.end_headers()
            return

        self.send_response(status)
        for k, v in FAKE_HEADERS.items():
            self.send_header(k, v)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):     self._handle()
    def do_POST(self):    self._handle()
    def do_HEAD(self):    self._handle()
    def do_PUT(self):     self._handle()
    def do_DELETE(self):  self._handle()
    def do_OPTIONS(self): self._handle()
    def log_message(self, *args): pass

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", 80), HoneypotHandler) as httpd:
        httpd.serve_forever()
