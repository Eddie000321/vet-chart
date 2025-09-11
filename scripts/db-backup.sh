#!/usr/bin/env bash
set -euo pipefail

# Simple Postgres logical backup helper
# Usage:
#   DATABASE_URL=postgres://user:pass@localhost:5434/mydb ./scripts/db-backup.sh
# Optional env:
#   BACKUP_DIR=backups  BACKUP_KEEP=7

BACKUP_DIR=${BACKUP_DIR:-backups}
KEEP=${BACKUP_KEEP:-7}

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Tip: export DATABASE_URL or prefix the command: DATABASE_URL=... ./scripts/db-backup.sh"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP=$(date +"%Y%m%d_%H%M%S")
OUT="$BACKUP_DIR/pg_backup_${STAMP}.dump"

echo "Creating backup: $OUT"
pg_dump --no-owner --no-privileges --format=custom --file="$OUT" "$DATABASE_URL"
echo "Backup completed: $OUT"

# Rotate old backups (keep last N)
if [[ "$KEEP" -gt 0 ]]; then
  ls -1t "$BACKUP_DIR"/pg_backup_*.dump 2>/dev/null | tail -n +$((KEEP+1)) | xargs -I {} rm -f -- {}
  echo "Retention applied (keep=$KEEP)."
fi

