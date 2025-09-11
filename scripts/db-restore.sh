#!/usr/bin/env bash
set -euo pipefail

# Postgres logical restore helper (DANGER: overwrites existing objects)
# Usage:
#   DATABASE_URL=postgres://user:pass@localhost:5434/mydb ./scripts/db-restore.sh backups/pg_backup_YYYYmmdd_HHMMSS.dump --force

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump_file> [--force]"
  exit 1
fi

DUMP_FILE=$1
FORCE=${2:-}

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: dump file not found: $DUMP_FILE"
  exit 1
fi

if [[ "$FORCE" != "--force" ]]; then
  echo "Refusing to restore without --force flag. Review your target and re-run with --force if sure."
  exit 1
fi

EXT=${DUMP_FILE##*.}
echo "Restoring $DUMP_FILE to $DATABASE_URL"

if [[ "$EXT" == "dump" ]]; then
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$DATABASE_URL" "$DUMP_FILE"
else
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"
fi

echo "Restore completed."

