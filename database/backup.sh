#!/bin/sh
# Backup diario de PostgreSQL con retención de 7 días.
# Se ejecuta desde el contenedor backup vía cron.
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/honeypot_${DATE}.sql.gz"

pg_dump -h db -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"

# Eliminar backups con más de 7 días
find "$BACKUP_DIR" -name "honeypot_*.sql.gz" -mtime +7 -delete

echo "[$(date)] Backup completado: $FILE"
