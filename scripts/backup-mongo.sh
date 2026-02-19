#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MongoDB Automated Backup Script
# ─────────────────────────────────────────────────────────────
#
# Creates compressed backups of the barber-saas database with
# configurable retention policy (daily/weekly/monthly).
#
# Designed to run inside the backup container via cron.
#
# Environment variables:
#   MONGO_HOST           - MongoDB host (default: mongo)
#   MONGO_PORT           - MongoDB port (default: 27017)
#   MONGO_DB             - Database name (default: barber-saas)
#   MONGO_USER           - Auth username
#   MONGO_PASSWORD       - Auth password
#   MONGO_AUTH_DB        - Auth database (default: barber-saas)
#   BACKUP_DIR           - Backup directory (default: /backups)
#   RETENTION_DAILY      - Days to keep daily backups (default: 7)
#   RETENTION_WEEKLY     - Weeks to keep weekly backups (default: 4)
#   RETENTION_MONTHLY    - Months to keep monthly backups (default: 6)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────
MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-barber-saas}"
MONGO_USER="${MONGO_USER:-barber_app}"
MONGO_PASSWORD="${MONGO_PASSWORD:?MONGO_PASSWORD is required}"
MONGO_AUTH_DB="${MONGO_AUTH_DB:-barber-saas}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAILY="${RETENTION_DAILY:-7}"
RETENTION_WEEKLY="${RETENTION_WEEKLY:-4}"
RETENTION_MONTHLY="${RETENTION_MONTHLY:-6}"

# ─── Derived Variables ────────────────────────────────────────
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)
BACKUP_FILE="${BACKUP_DIR}/daily/${MONGO_DB}_${DATE}.gz"

# ─── Create directories ──────────────────────────────────────
mkdir -p "${BACKUP_DIR}/daily"
mkdir -p "${BACKUP_DIR}/weekly"
mkdir -p "${BACKUP_DIR}/monthly"

echo "═══════════════════════════════════════════════════"
echo "  🗃️  MongoDB Backup — $(date)"
echo "═══════════════════════════════════════════════════"
echo "  Database: ${MONGO_DB}"
echo "  Host:     ${MONGO_HOST}:${MONGO_PORT}"
echo "  Output:   ${BACKUP_FILE}"
echo ""

# ─── Step 1: Create Backup ───────────────────────────────────
echo "1️⃣  Creating backup..."
mongodump \
    --host="${MONGO_HOST}" \
    --port="${MONGO_PORT}" \
    --db="${MONGO_DB}" \
    --username="${MONGO_USER}" \
    --password="${MONGO_PASSWORD}" \
    --authenticationDatabase="${MONGO_AUTH_DB}" \
    --archive="${BACKUP_FILE}" \
    --gzip \
    2>&1

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "   ✅ Backup created: ${BACKUP_SIZE}"

# ─── Step 2: Weekly Copy (Sundays) ───────────────────────────
if [ "$DAY_OF_WEEK" = "7" ]; then
    WEEKLY_FILE="${BACKUP_DIR}/weekly/${MONGO_DB}_week_$(date +%Y-%W).gz"
    cp "${BACKUP_FILE}" "${WEEKLY_FILE}"
    echo "2️⃣  ✅ Weekly backup copied"
fi

# ─── Step 3: Monthly Copy (1st of month) ─────────────────────
if [ "$DAY_OF_MONTH" = "01" ]; then
    MONTHLY_FILE="${BACKUP_DIR}/monthly/${MONGO_DB}_$(date +%Y-%m).gz"
    cp "${BACKUP_FILE}" "${MONTHLY_FILE}"
    echo "3️⃣  ✅ Monthly backup copied"
fi

# ─── Step 4: Cleanup Old Backups ─────────────────────────────
echo "4️⃣  Cleaning up old backups..."

# Delete daily backups older than RETENTION_DAILY days
DAILY_DELETED=$(find "${BACKUP_DIR}/daily" -type f -name "*.gz" -mtime "+${RETENTION_DAILY}" -delete -print | wc -l)
echo "   Daily:   ${DAILY_DELETED} old backups removed (keeping ${RETENTION_DAILY} days)"

# Delete weekly backups older than RETENTION_WEEKLY weeks
WEEKLY_DAYS=$((RETENTION_WEEKLY * 7))
WEEKLY_DELETED=$(find "${BACKUP_DIR}/weekly" -type f -name "*.gz" -mtime "+${WEEKLY_DAYS}" -delete -print | wc -l)
echo "   Weekly:  ${WEEKLY_DELETED} old backups removed (keeping ${RETENTION_WEEKLY} weeks)"

# Delete monthly backups older than RETENTION_MONTHLY months
MONTHLY_DAYS=$((RETENTION_MONTHLY * 30))
MONTHLY_DELETED=$(find "${BACKUP_DIR}/monthly" -type f -name "*.gz" -mtime "+${MONTHLY_DAYS}" -delete -print | wc -l)
echo "   Monthly: ${MONTHLY_DELETED} old backups removed (keeping ${RETENTION_MONTHLY} months)"

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Backup completed successfully!"
echo "═══════════════════════════════════════════════════"
echo ""

# List current backups
echo "📦 Current backups:"
echo "   Daily:   $(ls ${BACKUP_DIR}/daily/*.gz 2>/dev/null | wc -l) files"
echo "   Weekly:  $(ls ${BACKUP_DIR}/weekly/*.gz 2>/dev/null | wc -l) files"
echo "   Monthly: $(ls ${BACKUP_DIR}/monthly/*.gz 2>/dev/null | wc -l) files"
echo "   Total:   $(du -sh ${BACKUP_DIR} | cut -f1)"
