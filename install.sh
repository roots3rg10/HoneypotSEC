#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  Honeypot Platform — Instalador interactivo
#  Uso: bash install.sh
# ══════════════════════════════════════════════════════════════
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   Honeypot Platform — Instalación         ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ─── Comprobaciones previas ───────────────────────────────────
command -v docker   >/dev/null 2>&1 || { echo -e "${RED}Error: Docker no encontrado. Instálalo antes de continuar.${NC}"; exit 1; }
command -v openssl  >/dev/null 2>&1 || { echo -e "${RED}Error: openssl no encontrado.${NC}"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo -e "${RED}Error: Docker Compose v2 no encontrado.${NC}"; exit 1; }

# ─── Datos de la empresa ─────────────────────────────────────
echo -e "${YELLOW}Introduce los datos de tu empresa:${NC}"
echo ""

read -rp "  Nombre de la empresa:           " COMPANY_NAME
read -rp "  Dominio o IP del servidor:      " DOMAIN
read -rp "  Email del administrador:        " ADMIN_EMAIL
read -rp "  Nombre de usuario del admin:    " ADMIN_USERNAME

while true; do
  read -rsp "  Contraseña del admin:           " ADMIN_PASSWORD; echo ""
  read -rsp "  Repite la contraseña:           " ADMIN_PASSWORD2; echo ""
  [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD2" ] && break
  echo -e "${RED}  Las contraseñas no coinciden. Inténtalo de nuevo.${NC}"
done

echo ""

# ─── Generar secrets aleatorios ──────────────────────────────
echo -e "  Generando secrets seguros..."
SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 18 | tr -d '=/+' | head -c 22)

ALLOWED_ORIGINS="https://${DOMAIN}"
[ "$DOMAIN" = "localhost" ] && ALLOWED_ORIGINS="https://localhost,https://127.0.0.1"

# ─── Escribir .env ────────────────────────────────────────────
cat > .env <<EOF
# Generado por install.sh el $(date '+%Y-%m-%d %H:%M:%S')
# ⚠ No compartas este fichero ni lo subas al repositorio

POSTGRES_DB=honeypot_db
POSTGRES_USER=honeypot_user
POSTGRES_PASSWORD=${DB_PASSWORD}

DATABASE_URL=postgresql+asyncpg://honeypot_user:${DB_PASSWORD}@db:5432/honeypot_db
DATABASE_SYNC_URL=postgresql://honeypot_user:${DB_PASSWORD}@db:5432/honeypot_db

SECRET_KEY=${SECRET_KEY}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

DOMAIN=${DOMAIN}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
VITE_API_URL=/api

COMPANY_NAME=${COMPANY_NAME}
EOF

echo -e "  ${GREEN}✔ Fichero .env creado${NC}"

# ─── Certificado TLS ─────────────────────────────────────────
if [ ! -f nginx/certs/cert.pem ]; then
  echo -e "  Generando certificado TLS auto-firmado para '${DOMAIN}'..."
  bash nginx/generate-cert.sh "$DOMAIN"
  echo -e "  ${GREEN}✔ Certificado generado${NC}"
else
  echo -e "  ${CYAN}ℹ Certificado ya existe, omitiendo${NC}"
fi

# ─── Arrancar la plataforma ───────────────────────────────────
echo ""
echo -e "${YELLOW}Arrancando la plataforma (puede tardar 2-3 minutos)...${NC}"
docker compose up -d --build

# ─── Esperar a que todo esté healthy ─────────────────────────
echo -e "  Esperando a que todos los servicios estén operativos..."
TIMEOUT=120
ELAPSED=0
while true; do
  UNHEALTHY=$(docker compose ps --format json 2>/dev/null | \
    python3 -c "import sys,json; data=sys.stdin.read(); rows=[json.loads(l) for l in data.strip().splitlines() if l]; print(sum(1 for r in rows if r.get('Health','') not in ('healthy','','running') and r.get('State','') != 'running'))" 2>/dev/null || echo "0")

  if [ "$UNHEALTHY" = "0" ]; then
    break
  fi

  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo -e "${YELLOW}  Algunos servicios pueden tardar más. Comprueba con: docker compose ps${NC}"
    break
  fi

  printf "."
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
echo ""

# ─── Resumen ─────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║   ¡Instalación completada!                ║${NC}"
echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  URL:          ${CYAN}https://${DOMAIN}${NC}"
echo -e "  Usuario:      ${CYAN}${ADMIN_USERNAME}${NC}"
echo -e "  Contraseña:   ${CYAN}(la que introdujiste)${NC}"
echo ""
echo -e "  ${YELLOW}⚠ Si usas certificado auto-firmado, acepta la advertencia del navegador.${NC}"
echo -e "  ${YELLOW}  Para producción, consulta el README.md para configurar Let's Encrypt.${NC}"
echo ""
echo -e "  Para ver los logs: ${CYAN}docker compose logs -f${NC}"
echo -e "  Para parar:        ${CYAN}docker compose down${NC}"
echo ""
