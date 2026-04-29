import json
import re
from datetime import datetime, timezone
from urllib.parse import unquote
from parsers.base import AttackEvent

ATTACK_PATTERNS = [
    (re.compile(r"(\bselect\b|\bunion\b|\bdrop\b|\binsert\b|\bor\s+1=1\b|'--|%27)", re.I), "SQL Injection"),
    (re.compile(r"\.\./|\.\.\\|%2e%2e%2f|etc/passwd|etc/shadow|proc/self", re.I),         "Path Traversal"),
    (re.compile(r"<script|javascript:|onerror=|onload=|alert\(|%3cscript", re.I),          "XSS"),
    (re.compile(r"(https?|ftp)://[^/]+/.*\.(php|asp|sh|py)", re.I),                       "Remote File Inclusion"),
    (re.compile(r"\.(php|asp|aspx|jsp|cgi)\?.*=.*(http|ftp|//)", re.I),                   "Remote File Inclusion"),
    (re.compile(r"wp-login|wp-admin|xmlrpc\.php|wp-config", re.I),                        "WordPress Scan"),
    (re.compile(r"/admin|/administrator|/manager|/panel|/console|/phpmyadmin", re.I),      "Admin Panel Scan"),
    (re.compile(r"\.(env|git|svn|htaccess|htpasswd|bak|backup|sql|conf|cfg|ini)$", re.I), "Config File Scan"),
    (re.compile(r"(wget|curl|python|nikto|sqlmap|nmap|masscan|zgrab)", re.I),              "Scanner/Bot"),
    (re.compile(r"/shell|/cmd|/exec|system\(|passthru\(|eval\(|base64_decode", re.I),     "Remote Code Execution"),
]

def classify(path: str, query: str, payload: str) -> str:
    parts = [path]
    if query:
        parts.append(f"?{query}")
    if payload:
        parts.append(f" {payload}")
    text = unquote("".join(parts)).strip().lower()
    for pattern, label in ATTACK_PATTERNS:
        if pattern.search(text):
            return label
    return "Petición web genérica"

def parse_line(line: str) -> AttackEvent | None:
    # Ignorar líneas que no son JSON (ej: mensajes de Flask/Werkzeug)
    line = line.strip()
    if not line.startswith("{"):
        return None

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        return None

    src_ip = data.get("source_ip", "")
    if not src_ip:
        return None

    try:
        ts = datetime.fromisoformat(data.get("timestamp", "").replace("Z", "+00:00"))
    except Exception:
        ts = datetime.now(timezone.utc)

    method  = data.get("method", "GET")
    path    = data.get("path", "/")
    payload = data.get("payload") or data.get("query") or None

    return AttackEvent(
        honeypot    = "glastopf",
        source_ip   = src_ip,
        timestamp   = ts,
        dest_port   = 80,
        protocol    = "HTTP",
        attack_type = classify(path, data.get("query", ""), data.get("payload", "")),
        payload     = f"{method} {path}" + (f"?{data['query']}" if data.get("query") else ""),
        raw_data    = data,
    )
