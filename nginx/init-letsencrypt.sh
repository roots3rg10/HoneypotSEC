#!/bin/bash
# init-letsencrypt.sh — Emite el primer certificado Let's Encrypt.
# Ejecutar UNA SOLA VEZ desde la raíz del proyecto antes de levantar el stack completo.
#
#   chmod +x nginx/init-letsencrypt.sh
#   ./nginx/init-letsencrypt.sh

set -e

DOMAIN="honeypotsec.duckdns.org"
EMAIL="fevisergio@gmail.com"
COMPOSE="docker compose"

# ── Colores ──────────────────────────────────────────────────────────
GRN='\033[0;32m'; YLW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GRN}[+]${NC} $*"; }
warn()  { echo -e "${YLW}[!]${NC} $*"; }
die()   { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

# ── Verificar DNS ────────────────────────────────────────────────────
info "Verificando que $DOMAIN resuelve a esta máquina..."
SERVER_IP=$(curl -s --max-time 5 https://api.ipify.org || curl -s --max-time 5 https://ifconfig.me)
DNS_IP=$(dig +short "$DOMAIN" | tail -1)
if [ -z "$DNS_IP" ]; then
  die "No se puede resolver $DOMAIN. Comprueba que DuckDNS apunta a $SERVER_IP."
fi
if [ "$DNS_IP" != "$SERVER_IP" ]; then
  warn "DNS apunta a $DNS_IP pero la IP pública del servidor es $SERVER_IP."
  warn "Si DuckDNS acaba de actualizarse, espera unos minutos y vuelve a ejecutar."
  read -rp "¿Continuar de todas formas? [s/N] " resp
  [[ "$resp" =~ ^[sS]$ ]] || exit 1
fi
info "DNS OK: $DOMAIN → $DNS_IP"

# ── Verificar puertos 80 / 443 accesibles ────────────────────────────
for PORT in 80 443; do
  if ss -tlnp | grep -q ":$PORT "; then
    warn "Algo ya escucha en el puerto $PORT. Asegúrate de que no hay otro proceso ocupándolo."
  fi
done

# ── ¿Ya existe un certificado real? ─────────────────────────────────
CERT_EXISTS=$($COMPOSE run --rm --entrypoint sh certbot \
  -c "[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ] && echo yes || echo no" 2>/dev/null | tail -1)
if [ "$CERT_EXISTS" = "yes" ]; then
  warn "Ya existe un certificado para $DOMAIN."
  read -rp "¿Forzar nueva emisión? [s/N] " resp
  [[ "$resp" =~ ^[sS]$ ]] || exit 0
fi

# ── Paso 1: certificado autofirmado temporal (nginx necesita SSL para arrancar) ──
info "Creando certificado autofirmado temporal..."
$COMPOSE run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out    '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj   '/CN=localhost' 2>/dev/null
"

# ── Paso 2: arrancar nginx con el certificado temporal ───────────────
info "Arrancando nginx..."
$COMPOSE up --force-recreate -d nginx
echo "  Esperando 5 s para que nginx esté listo..."
sleep 5

# ── Paso 3: verificar acceso HTTP desde internet ──────────────────────
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://$DOMAIN/.well-known/acme-challenge/test" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "000" ]; then
  die "No se puede conectar a http://$DOMAIN. Comprueba que el puerto 80 esté abierto en el firewall."
fi
info "Puerto 80 accesible (HTTP $HTTP_STATUS)."

# ── Paso 4: eliminar certificado temporal ────────────────────────────
info "Eliminando certificado temporal..."
$COMPOSE run --rm --entrypoint sh certbot -c "
  rm -rf '/etc/letsencrypt/live/$DOMAIN'
  rm -rf '/etc/letsencrypt/archive/$DOMAIN'
  rm -f  '/etc/letsencrypt/renewal/$DOMAIN.conf'
"

# ── Paso 5: solicitar certificado real a Let's Encrypt ──────────────
info "Solicitando certificado a Let's Encrypt para $DOMAIN..."
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# ── Paso 6: recargar nginx con el certificado real ───────────────────
info "Recargando nginx con el certificado real..."
$COMPOSE exec nginx nginx -s reload

# ── Levantar el resto del stack si no está activo ────────────────────
info "Levantando el stack completo..."
$COMPOSE up -d

echo ""
echo -e "${GRN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GRN}║  ✓  HTTPS activo en https://$DOMAIN  ║${NC}"
echo -e "${GRN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YLW}Renovación automática del certificado:${NC}"
echo "  El servicio 'certbot' ya intenta renovar cada 12 h."
echo "  Sin embargo, nginx debe recargarse para aplicar el nuevo cert."
echo "  Añade esta línea al cron del host (sudo crontab -e):"
echo ""
echo "    0 4 * * * docker exec honeypot_nginx nginx -s reload"
echo ""
echo "  Esto recarga nginx cada día a las 4:00 AM (operación sin downtime)."
echo ""
