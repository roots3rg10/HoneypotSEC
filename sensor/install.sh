#!/usr/bin/env bash
# HoneypotSEC — Sensor Installer
set -euo pipefail

BACKEND_URL="https://honeypotsec.duckdns.org"
INSTALL_DIR="/opt/hs-sensor"
TOKEN=""
SENSOR_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --token) TOKEN="$2";       shift 2 ;;
    --name)  SENSOR_NAME="$2"; shift 2 ;;
    *) echo "Argumento desconocido: $1"; exit 1 ;;
  esac
done

[[ -z "$TOKEN" ]] && {
  echo "Error: --token es obligatorio."
  echo "Uso: curl -sL ${BACKEND_URL}/install | sudo bash -s -- --token TOKEN"
  exit 1
}

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
echo -e "${NC}  Sensor Installer v1.2\n"

[[ $EUID -ne 0 ]] && die "Este instalador necesita privilegios de root.\nEjecuta: curl -sL ${BACKEND_URL}/install | sudo bash -s -- --token TOKEN"

# ── Sistema ───────────────────────────────────────────────────
step "Comprobando sistema"
[[ -f /etc/os-release ]] || die "No se puede detectar el SO. Solo se soporta Linux."
. /etc/os-release
OS_ID="${ID:-unknown}"
OS_VERSION="${VERSION_ID:-}"

ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH_LABEL="amd64" ;;
  aarch64) ARCH_LABEL="arm64" ;;
  *) die "Arquitectura no soportada: $ARCH (se requiere x86_64 o arm64)" ;;
esac
info "${PRETTY_NAME:-$OS_ID $OS_VERSION} — $ARCH_LABEL"

# ── Dependencias ──────────────────────────────────────────────
step "Preparando entorno"
case "$OS_ID" in
  ubuntu|debian|linuxmint)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq 2>/dev/null
    apt-get install -y -qq curl jq ca-certificates gnupg lsb-release 2>/dev/null
    ;;
  centos|rhel|rocky|almalinux|fedora)
    PKG_MGR="yum"; command -v dnf &>/dev/null && PKG_MGR="dnf"
    $PKG_MGR install -y -q curl jq ca-certificates yum-utils 2>/dev/null
    ;;
  *)
    command -v curl &>/dev/null || die "curl no encontrado. Instálalo manualmente y vuelve a ejecutar."
    command -v jq   &>/dev/null || die "jq no encontrado. Instálalo manualmente y vuelve a ejecutar."
    warn "Distribución '$OS_ID' no reconocida."
    ;;
esac

DOCKER_OK=false
command -v docker &>/dev/null && docker compose version &>/dev/null 2>&1 && DOCKER_OK=true

if $DOCKER_OK; then
  info "Docker ✓"
else
  warn "Instalando Docker..."
  case "$OS_ID" in
    ubuntu|debian|linuxmint)
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL "https://download.docker.com/linux/${OS_ID}/gpg" \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
      chmod a+r /etc/apt/keyrings/docker.gpg

      CODENAME="${VERSION_CODENAME:-}"
      [[ -z "$CODENAME" ]] && CODENAME=$(lsb_release -cs 2>/dev/null || echo "")
      [[ -z "$CODENAME" ]] && die "No se pudo determinar la versión del SO."

      echo "deb [arch=${ARCH_LABEL} signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/${OS_ID} ${CODENAME} stable" \
        > /etc/apt/sources.list.d/docker.list
      apt-get update -qq 2>/dev/null
      apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null
      systemctl enable --now docker
      ;;
    centos|rhel|rocky|almalinux|fedora)
      PKG_MGR="yum"; command -v dnf &>/dev/null && PKG_MGR="dnf"
      yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null
      $PKG_MGR install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null
      systemctl enable --now docker
      ;;
    *)
      die "Distribución '$OS_ID' no soportada para instalación automática de Docker.\nhttps://docs.docker.com/engine/install/"
      ;;
  esac
  info "Docker instalado ✓"
fi

if ! docker info &>/dev/null 2>&1; then
  warn "Iniciando Docker..."
  systemctl start docker 2>/dev/null || true
  sleep 4
  docker info &>/dev/null 2>&1 || die "El daemon de Docker no responde.\nComprueba: systemctl status docker"
fi

docker compose version &>/dev/null \
  || die "Plugin 'docker compose' no encontrado. Instala Docker Engine >= 23.\nhttps://docs.docker.com/engine/install/"

# ── Firewall ──────────────────────────────────────────────────
step "Configurando firewall"
if command -v ufw &>/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 2222/tcp comment "HoneypotSEC - Cowrie SSH"      2>/dev/null || true
  ufw allow 2323/tcp comment "HoneypotSEC - Cowrie Telnet"  2>/dev/null || true
  ufw allow 21/tcp   comment "HoneypotSEC - Dionaea FTP"    2>/dev/null || true
  ufw allow 445/tcp  comment "HoneypotSEC - Dionaea SMB"    2>/dev/null || true
  ufw allow 3306/tcp comment "HoneypotSEC - Dionaea MySQL"  2>/dev/null || true
  ufw allow 102/tcp  comment "HoneypotSEC - Conpot S7"      2>/dev/null || true
  ufw allow 502/tcp  comment "HoneypotSEC - Conpot Modbus"  2>/dev/null || true
  ufw allow 8080/tcp comment "HoneypotSEC - Web honeypot"   2>/dev/null || true
  ufw allow 25/tcp   comment "HoneypotSEC - SMTP honeypot"  2>/dev/null || true
  ufw allow 110/tcp  comment "HoneypotSEC - POP3 honeypot"  2>/dev/null || true
  ufw allow 143/tcp  comment "HoneypotSEC - IMAP honeypot"  2>/dev/null || true
  ufw allow 587/tcp  comment "HoneypotSEC - SMTP2 honeypot" 2>/dev/null || true
  ufw allow 23/tcp   comment "HoneypotSEC - Telnet honeypot" 2>/dev/null || true
  ufw allow 3389/tcp comment "HoneypotSEC - RDP honeypot"   2>/dev/null || true
  ufw allow 5900/tcp comment "HoneypotSEC - VNC honeypot"   2>/dev/null || true
  ufw allow 1433/tcp comment "HoneypotSEC - MSSQL honeypot" 2>/dev/null || true
  ufw allow 6379/tcp comment "HoneypotSEC - Redis honeypot" 2>/dev/null || true
  info "Puertos de honeypots habilitados"
else
  info "Sin cambios en el firewall"
fi

# ── Red: detectar IPs ─────────────────────────────────────────
SENSOR_HOST=$(hostname -f 2>/dev/null || hostname 2>/dev/null || echo "unknown")

PUBLIC_IP=$(curl -sf --max-time 8 https://api.ipify.org \
         || curl -sf --max-time 8 https://ifconfig.me \
         || curl -sf --max-time 8 https://icanhazip.com \
         || echo "unknown")

# IP privada: interfaz de salida del servidor
PRIVATE_IP=$(ip route get 8.8.8.8 2>/dev/null \
  | awk 'NR==1{for(i=1;i<=NF;i++){if($i=="src"){print $(i+1);break}}}')
[[ -z "$PRIVATE_IP" ]] && PRIVATE_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[[ -z "$PRIVATE_IP" ]] && PRIVATE_IP="0.0.0.0"

# Si la IP pública está directamente en una interfaz local (VPS/cloud), la usamos para web
WEB_BIND_IP="$PRIVATE_IP"
if [[ "$PUBLIC_IP" != "unknown" ]] && ip addr show 2>/dev/null | grep -qF "$PUBLIC_IP"; then
  WEB_BIND_IP="$PUBLIC_IP"
fi

[[ -n "$SENSOR_NAME" ]] || SENSOR_NAME="$SENSOR_HOST"

# ── Activar sensor ────────────────────────────────────────────
step "Activando sensor"
BOOTSTRAP=$(curl -sf \
  --max-time 30 \
  -H "Accept: application/json" \
  "${BACKEND_URL}/api/sensor/bootstrap?token=${TOKEN}&hostname=${SENSOR_HOST}&ip=${PUBLIC_IP}" \
) || die "No se pudo contactar con el servidor.\n  · Verifica que el token es válido y no ha expirado (72 h)\n  · Comprueba conectividad: curl -v ${BACKEND_URL}/api/health"

INGEST_TOKEN=$(echo "$BOOTSTRAP" | jq -r '.ingest_token' 2>/dev/null || echo "")
PLAN=$(        echo "$BOOTSTRAP" | jq -r '.plan'          2>/dev/null || echo "")
COMPOSE=$(     echo "$BOOTSTRAP" | jq -r '.compose'       2>/dev/null || echo "")
TENANT_ID=$(   echo "$BOOTSTRAP" | jq -r '.tenant_id'     2>/dev/null || echo "")
SENSOR_ID=$(   echo "$BOOTSTRAP" | jq -r '.sensor_id'     2>/dev/null || echo "")

[[ -z "$INGEST_TOKEN" || "$INGEST_TOKEN" == "null" ]] \
  && die "Respuesta inválida del servidor. Comprueba que el token es correcto."

info "Plan activo:  ${YLW}${PLAN}${NC}"
info "IP privada:   $PRIVATE_IP  ${YLW}← SSH, FTP, SMB, MySQL${NC}"
if [[ "$WEB_BIND_IP" == "$PUBLIC_IP" ]]; then
  info "IP web:       $WEB_BIND_IP  ${YLW}← HTTP, SCADA (pública directa)${NC}"
else
  info "IP web:       $WEB_BIND_IP  ${YLW}← HTTP, SCADA (red local)${NC}"
fi

# ── Instalar sensor ───────────────────────────────────────────
step "Instalando sensor"
mkdir -p "$INSTALL_DIR/agent"
cd "$INSTALL_DIR"

printf '%s' "$COMPOSE" > docker-compose.yml

cat > .env <<ENV
INGEST_TOKEN=${INGEST_TOKEN}
TENANT_ID=${TENANT_ID}
SENSOR_ID=${SENSOR_ID}
BACKEND_URL=${BACKEND_URL}
PLAN=${PLAN}
SENSOR_NAME=${SENSOR_NAME}
PRIVATE_IP=${PRIVATE_IP}
WEB_BIND_IP=${WEB_BIND_IP}
ENV
chmod 600 .env

for f in agent.py requirements.txt Dockerfile webhoneypot.py webhoneypot.Dockerfile portmon.py portmon.Dockerfile cowrie.cfg; do
  curl -sf --max-time 30 "${BACKEND_URL}/api/sensor/agent/${f}" -o "agent/${f}" \
    || die "No se pudo descargar el agente.\nComprueba conectividad: curl -v ${BACKEND_URL}/api/health"
done
info "Componentes instalados ✓"

# ── Iniciar honeypots ─────────────────────────────────────────
step "Iniciando honeypots"
docker compose pull -q 2>/dev/null || true
docker compose up -d --build 2>/dev/null \
  || docker compose up -d --build 2>&1 | tail -8

sleep 8
TOTAL=$(  docker compose ps -q                 2>/dev/null | wc -l | tr -d ' ')
RUNNING=$(docker compose ps -q --status running 2>/dev/null | wc -l | tr -d ' ')
info "${RUNNING}/${TOTAL} honeypots activos"

[[ "$RUNNING" -eq 0 ]] && warn "Ningún honeypot está activo. Revisa los logs:"
[[ "$RUNNING" -eq 0 ]] && docker compose logs --tail=15

# ── Inicio automático ─────────────────────────────────────────
if command -v systemctl &>/dev/null; then
  DOCKER_BIN=$(command -v docker)
  cat > /etc/systemd/system/hs-sensor.service <<UNIT
[Unit]
Description=HoneypotSEC Sensor
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=${DOCKER_BIN} compose up -d
ExecStop=${DOCKER_BIN} compose down
TimeoutStartSec=180

[Install]
WantedBy=multi-user.target
UNIT
  systemctl daemon-reload
  systemctl enable hs-sensor 2>/dev/null || true
  info "Inicio automático configurado ✓"
fi

# ── Resumen ───────────────────────────────────────────────────
echo ""
echo -e "${GRN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GRN}║   ✓  Sensor HoneypotSEC instalado correctamente              ║${NC}"
echo -e "${GRN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Plan activo:    ${YLW}${PLAN}${NC}"
echo -e "  Dashboard:      ${YLW}${BACKEND_URL}${NC}"
echo ""
echo -e "  Los ataques aparecerán en tu panel en los próximos minutos."
echo ""
