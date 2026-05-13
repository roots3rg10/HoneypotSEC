#!/usr/bin/env bash
# HoneypotSEC — Sensor Installer
# Uso: curl -s https://honeypotsec.duckdns.org/install | sudo bash -s -- --token TOKEN
set -euo pipefail

BACKEND_URL="https://honeypotsec.duckdns.org"
INSTALL_DIR="/opt/hs-sensor"
TOKEN=""
SENSOR_NAME=""

# ── Argumentos ───────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --token) TOKEN="$2";       shift 2 ;;
    --name)  SENSOR_NAME="$2"; shift 2 ;;
    *) echo "Argumento desconocido: $1"; exit 1 ;;
  esac
done

[[ -z "$TOKEN" ]] && { echo "Error: --token es obligatorio."; echo "Uso: ... | sudo bash -s -- --token TOKEN"; exit 1; }

# ── Colores ───────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; BLD='\033[1m'; NC='\033[0m'
info() { echo -e "${GRN}[+]${NC} $*"; }
warn() { echo -e "${YLW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }
step() { echo -e "\n${BLD}── $* ──${NC}"; }

echo -e "${BLD}"
echo "  ██╗  ██╗ ██████╗ ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗████████╗"
echo "  ██║  ██║██╔═══██╗████╗  ██║██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝╚══██╔══╝"
echo "  ███████║██║   ██║██╔██╗ ██║█████╗   ╚████╔╝ ██████╔╝╚█████╗    ██║   "
echo "  ██╔══██║██║   ██║██║╚██╗██║██╔══╝    ╚██╔╝  ██╔═══╝  ╚═══██╗   ██║   "
echo "  ██║  ██║╚██████╔╝██║ ╚████║███████╗   ██║   ██║     ██████╔╝   ██║   "
echo "  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝     ╚═════╝    ╚═╝   "
echo -e "${NC}  Sensor Installer v1.0\n"

# ── Verificar root ────────────────────────────────────────────
[[ $EUID -ne 0 ]] && die "Este instalador necesita privilegios de root.\n  Ejecuta: curl -s ${BACKEND_URL}/install | sudo bash -s -- --token TOKEN"

# ── Detectar SO ───────────────────────────────────────────────
step "Detectando sistema operativo"
[[ -f /etc/os-release ]] || die "No se puede detectar el SO. Solo se soporta Linux."
. /etc/os-release
OS_ID="${ID:-unknown}"
OS_VERSION="${VERSION_ID:-}"
info "SO: ${PRETTY_NAME:-$OS_ID $OS_VERSION}"

# ── Detectar arquitectura ─────────────────────────────────────
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH_LABEL="amd64" ;;
  aarch64) ARCH_LABEL="arm64" ;;
  *) die "Arquitectura no soportada: $ARCH (se requiere x86_64 o arm64)" ;;
esac
info "Arquitectura: $ARCH ($ARCH_LABEL)"

# ── Instalar Docker si no está presente ──────────────────────
step "Verificando Docker"
if command -v docker &>/dev/null; then
  DOCKER_VER=$(docker --version 2>/dev/null)
  info "Docker ya instalado: $DOCKER_VER"
else
  warn "Docker no encontrado. Instalando..."
  case "$OS_ID" in
    ubuntu|debian|linuxmint)
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -qq
      apt-get install -y -qq ca-certificates curl gnupg lsb-release
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL "https://download.docker.com/linux/${OS_ID}/gpg" \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
      echo "deb [arch=${ARCH_LABEL} signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/${OS_ID} \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        > /etc/apt/sources.list.d/docker.list
      apt-get update -qq
      apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
      ;;
    centos|rhel|rocky|almalinux|fedora)
      PKG_MGR="yum"
      command -v dnf &>/dev/null && PKG_MGR="dnf"
      $PKG_MGR install -y -q yum-utils
      yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
      $PKG_MGR install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin
      systemctl enable --now docker
      ;;
    *)
      die "Distribución '$OS_ID' no soportada.\nInstala Docker manualmente (https://docs.docker.com/engine/install/) y vuelve a ejecutar."
      ;;
  esac
  info "Docker instalado correctamente"
fi

# Verificar docker compose v2
docker compose version &>/dev/null \
  || die "Plugin 'docker compose' no encontrado. Asegúrate de tener Docker Engine >= 23."

# ── Obtener hostname e IP pública ─────────────────────────────
HOSTNAME=$(hostname -f 2>/dev/null || hostname)
PUBLIC_IP=$(curl -sf --max-time 8 https://api.ipify.org \
         || curl -sf --max-time 8 https://ifconfig.me \
         || echo "unknown")
[[ -n "$SENSOR_NAME" ]] || SENSOR_NAME="$HOSTNAME"

# ── Contactar con el servidor para obtener la configuración ───
step "Activando sensor en HoneypotSEC"
info "Servidor:  $BACKEND_URL"
info "Hostname:  $HOSTNAME"
info "IP pública: $PUBLIC_IP"

BOOTSTRAP=$(curl -sf \
  --max-time 30 \
  -H "Accept: application/json" \
  "${BACKEND_URL}/api/sensor/bootstrap?token=${TOKEN}&hostname=${HOSTNAME}&ip=${PUBLIC_IP}" \
) || die "No se pudo contactar con el servidor.\n  · Comprueba que el token es válido y no ha expirado (72 h)\n  · Verifica que el servidor ${BACKEND_URL} es accesible"

# Parsear respuesta JSON
_jq() { echo "$BOOTSTRAP" | python3 -c "import sys,json; print(json.load(sys.stdin)$1)"; }

INGEST_TOKEN=$(_jq "['ingest_token']")
PLAN=$(_jq "['plan']")
COMPOSE=$(_jq "['compose']")
TENANT_ID=$(_jq "['tenant_id']")
SENSOR_ID=$(_jq "['sensor_id']")

info "Plan activado: ${YLW}${PLAN}${NC}"
info "Sensor ID:    $SENSOR_ID"

# ── Crear directorio e instalar ficheros ──────────────────────
step "Instalando sensor en $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

printf '%s' "$COMPOSE" > docker-compose.yml

cat > .env <<ENV
INGEST_TOKEN=${INGEST_TOKEN}
TENANT_ID=${TENANT_ID}
SENSOR_ID=${SENSOR_ID}
BACKEND_URL=${BACKEND_URL}
PLAN=${PLAN}
SENSOR_NAME=${SENSOR_NAME}
ENV
chmod 600 .env
info "Ficheros escritos en $INSTALL_DIR"

# ── Arrancar contenedores ─────────────────────────────────────
step "Iniciando honeypots"
docker compose pull -q
docker compose up -d
info "Contenedores en marcha"

# ── Configurar arranque automático (systemd) ──────────────────
if command -v systemctl &>/dev/null; then
  cat > /etc/systemd/system/hs-sensor.service <<UNIT
[Unit]
Description=HoneypotSEC Sensor
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=120

[Install]
WantedBy=multi-user.target
UNIT
  systemctl daemon-reload
  systemctl enable hs-sensor 2>/dev/null || true
  info "Servicio systemd 'hs-sensor' configurado (arranque automático con el sistema)"
fi

# ── Resumen final ─────────────────────────────────────────────
echo ""
echo -e "${GRN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GRN}║   ✓  Sensor HoneypotSEC instalado correctamente              ║${NC}"
echo -e "${GRN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Plan activo:    ${YLW}${PLAN}${NC}"
echo -e "  Directorio:     ${INSTALL_DIR}"
echo -e "  Dashboard:      ${YLW}${BACKEND_URL}${NC}"
echo ""
echo "  Comandos útiles:"
echo "    Estado:   docker compose -f ${INSTALL_DIR}/docker-compose.yml ps"
echo "    Logs:     docker compose -f ${INSTALL_DIR}/docker-compose.yml logs -f"
echo "    Detener:  docker compose -f ${INSTALL_DIR}/docker-compose.yml down"
echo "    Reiniciar: systemctl restart hs-sensor"
echo ""
echo -e "  Los ataques aparecerán en tu panel en los próximos minutos."
echo ""
