"""
Sistema de alertas para ataques de alto valor.
Envía notificaciones por email (SMTP) y/o Slack cuando se detecta
un evento que supera el umbral de criticidad.
"""
import os
import json
import smtplib
import logging
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass

log = logging.getLogger(__name__)

# Configuración leída de variables de entorno
SMTP_HOST     = os.getenv("SMTP_HOST", "")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM", "alertas@honeypot.local")
ALERT_EMAIL   = os.getenv("ALERT_EMAIL_TO", "")
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL", "")

# Criterios de alto valor: (honeypot, attack_types que lo activan, etiqueta)
HIGH_VALUE_RULES = [
    # ICS/SCADA — cualquier evento en Conpot es crítico
    ("conpot",    None,              "🏭 ICS/SCADA"),
    # SMB exploits tipo EternalBlue
    ("dionaea",   {"smb_exploit", "exploit"},      "🐛 Exploit SMB"),
    # Malware descargado vía Dionaea
    ("dionaea",   {"malware_download"},             "🦠 Malware descargado"),
    # Shell obtenida en Cowrie (atacante "entró")
    ("cowrie",    {"command_execution", "session"}, "🔓 Shell SSH obtenida"),
    # Cualquier tipo explícito de exploit en cualquier honeypot
    (None,        {"exploit", "rce"},               "💥 Exploit genérico"),
]


@dataclass
class AlertEvent:
    honeypot:    str
    attack_type: str
    source_ip:   str
    country:     str
    label:       str
    extra:       dict


def _is_high_value(honeypot: str, attack_type: str) -> str | None:
    """Devuelve la etiqueta de alerta si el evento es de alto valor, o None."""
    at = (attack_type or "").lower()
    for hp, types, label in HIGH_VALUE_RULES:
        if hp and honeypot != hp:
            continue
        if types is None or any(t in at for t in types):
            return label
    return None


def _send_email(event: AlertEvent) -> None:
    if not SMTP_HOST or not ALERT_EMAIL:
        return

    subject = f"[HoneypotSEC] {event.label} — {event.source_ip} ({event.country})"
    body = (
        f"Se ha detectado un ataque de alto valor:\n\n"
        f"  Etiqueta:    {event.label}\n"
        f"  Honeypot:    {event.honeypot}\n"
        f"  Tipo:        {event.attack_type}\n"
        f"  IP origen:   {event.source_ip}\n"
        f"  País:        {event.country}\n"
        f"  Detalles:    {json.dumps(event.extra, ensure_ascii=False, indent=2)}\n"
    )

    msg = MIMEMultipart()
    msg["From"]    = SMTP_FROM
    msg["To"]      = ALERT_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            if SMTP_USER:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, ALERT_EMAIL, msg.as_string())
        log.info(f"[alert] email enviado a {ALERT_EMAIL} — {event.label}")
    except Exception as e:
        log.warning(f"[alert] error al enviar email: {e}")


def _send_slack(event: AlertEvent) -> None:
    if not SLACK_WEBHOOK:
        return

    text = (
        f"*{event.label}* detectado en `{event.honeypot}`\n"
        f"IP: `{event.source_ip}` | País: {event.country} | Tipo: `{event.attack_type}`"
    )
    try:
        resp = requests.post(SLACK_WEBHOOK, json={"text": text}, timeout=5)
        if resp.status_code != 200:
            log.warning(f"[alert] Slack devolvió {resp.status_code}: {resp.text}")
        else:
            log.info(f"[alert] notificación Slack enviada — {event.label}")
    except Exception as e:
        log.warning(f"[alert] error al enviar Slack: {e}")


def check_and_alert(event) -> None:
    """
    Llamar tras insertar cada evento en BD.
    Si el evento supera el umbral de criticidad, dispara todas las
    notificaciones configuradas (email, Slack).
    """
    label = _is_high_value(event.honeypot, event.attack_type)
    if not label:
        return

    alert = AlertEvent(
        honeypot    = event.honeypot,
        attack_type = event.attack_type or "",
        source_ip   = event.source_ip,
        country     = getattr(event, "country", "") or "",
        label       = label,
        extra       = event.raw_data or {},
    )

    log.warning(f"[alert] ALTO VALOR: {label} — {event.source_ip} via {event.honeypot}")
    _send_email(alert)
    _send_slack(alert)
