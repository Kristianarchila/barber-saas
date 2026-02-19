#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MongoDB Restore Script
# ─────────────────────────────────────────────────────────────
#
# Restores a MongoDB backup created by backup-mongo.sh
#
# Usage:
#   bash scripts/restore-mongo.sh <backup-file>
#
# Example:
#   bash scripts/restore-mongo.sh backups/daily/barber-saas_2026-02-18_03-00-00.gz
#
# ⚠️  WARNING: This will OVERWRITE the current database!
# ─────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_FILE="${1:?Usage: restore-mongo.sh <backup-file>}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

MONGO_PASSWORD="${MONGO_APP_PASSWORD:?MONGO_APP_PASSWORD is required in .env}"

echo "═══════════════════════════════════════════════════"
echo "  🔄 MongoDB Restore"
echo "═══════════════════════════════════════════════════"
echo "  File: ${BACKUP_FILE}"
echo "  Size: $(du -sh "${BACKUP_FILE}" | cut -f1)"
echo ""
echo "  ⚠️  WARNING: This will OVERWRITE the current database!"
echo ""
read -p "  Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "  ❌ Restore cancelled."
    exit 0
fi

echo ""
echo "  Restoring..."

docker compose exec -T mongo mongorestore \
    --host="localhost" \
    --port="27017" \
    --db="barber-saas" \
    --username="barber_app" \
    --password="${MONGO_PASSWORD}" \
    --authenticationDatabase="barber-saas" \
    --archive="${BACKUP_FILE}" \
    --gzip \
    --drop \
    2>&1

echo ""
echo "  ✅ Restore completed successfully!"
echo "═══════════════════════════════════════════════════"
