#!/bin/bash
# Genera certificado TLS auto-firmado para desarrollo/demo.
# Para producción usa Let's Encrypt (ver README.md).
set -e

CERTS_DIR="$(dirname "$0")/certs"
mkdir -p "$CERTS_DIR"

DOMAIN="${1:-localhost}"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERTS_DIR/key.pem" \
  -out    "$CERTS_DIR/cert.pem" \
  -subj "/C=ES/ST=Madrid/L=Madrid/O=HoneypotPlatform/CN=${DOMAIN}" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"

chmod 600 "$CERTS_DIR/key.pem"
echo "Certificado generado en $CERTS_DIR/ para dominio: $DOMAIN"
