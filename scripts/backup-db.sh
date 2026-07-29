#!/usr/bin/env bash
# Nightly Postgres backup with off-box copy and retention.
#
#   sudo crontab -e
#   15 3 * * * /opt/atlas/scripts/backup-db.sh >> /var/log/atlas-backup.log 2>&1
#
# Media lives in Hetzner Object Storage, so Postgres is the only stateful
# thing on this server. If this script is not running, the server IS the backup.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/atlas}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.prod.yml --env-file ${APP_DIR}/.env.prod"

cd "$APP_DIR"
# shellcheck disable=SC1091
set -a; source .env.prod; set +a

STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUT="${APP_DIR}/backups/atlas-${STAMP}.sql.gz"
mkdir -p "${APP_DIR}/backups"

echo "[$(date -Is)] dumping ${DB_DATABASE}"
# Fail on a truncated dump rather than writing a corrupt archive: without
# pipefail a pg_dump error would still produce a valid-looking .gz.
$COMPOSE exec -T postgres pg_dump -U "$DB_USERNAME" -d "$DB_DATABASE" --clean --if-exists \
    | gzip -9 > "$OUT"

SIZE=$(stat -c %s "$OUT")
if [ "$SIZE" -lt 1024 ]; then
    echo "[$(date -Is)] ERROR: dump is ${SIZE} bytes, refusing to treat as valid" >&2
    rm -f "$OUT"
    exit 1
fi
echo "[$(date -Is)] wrote ${OUT} (${SIZE} bytes)"

# Off-box copy. A backup sitting on the machine it protects is not a backup.
if [ -n "${S3_ACCESS_KEY:-}" ]; then
    docker run --rm \
        -e AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
        -e AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
        -e AWS_DEFAULT_REGION="$S3_REGION" \
        -v "${APP_DIR}/backups:/backups:ro" \
        amazon/aws-cli:latest \
        s3 cp "/backups/$(basename "$OUT")" "s3://${S3_BUCKET}/db-backups/" \
        --endpoint-url "$S3_ENDPOINT"
    echo "[$(date -Is)] uploaded to ${S3_BUCKET}/db-backups/"
else
    echo "[$(date -Is)] WARNING: S3_ACCESS_KEY unset, backup exists only on this server" >&2
fi

find "${APP_DIR}/backups" -name 'atlas-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
echo "[$(date -Is)] done; pruned local backups older than ${RETENTION_DAYS}d"
