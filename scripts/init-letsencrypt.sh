#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Let's Encrypt Certificate Initialization Script
# ─────────────────────────────────────────────────────────────
#
# Run this ONCE before first production deployment to obtain
# SSL certificates from Let's Encrypt.
#
# Prerequisites:
#   - Domain DNS must point to this server
#   - Ports 80 and 443 must be open
#   - Docker and docker compose must be installed
#   - .env file must have DOMAIN and CERTBOT_EMAIL set
#
# Usage:
#   bash scripts/init-letsencrypt.sh
#
# For testing, set STAGING=1 to use Let's Encrypt staging
# (avoids rate limits during testing):
#   STAGING=1 bash scripts/init-letsencrypt.sh
# ─────────────────────────────────────────────────────────────

set -e

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Validate required variables
if [ -z "$DOMAIN" ]; then
    echo "❌ ERROR: DOMAIN is not set in .env file"
    echo "   Example: DOMAIN=app.tudominio.com"
    exit 1
fi

if [ -z "$CERTBOT_EMAIL" ]; then
    echo "❌ ERROR: CERTBOT_EMAIL is not set in .env file"
    echo "   Example: CERTBOT_EMAIL=admin@tudominio.com"
    exit 1
fi

echo "═══════════════════════════════════════════════════"
echo "  🔐 Let's Encrypt Certificate Setup"
echo "═══════════════════════════════════════════════════"
echo "  Domain:  $DOMAIN"
echo "  Email:   $CERTBOT_EMAIL"
echo "  Staging: ${STAGING:-0}"
echo "═══════════════════════════════════════════════════"
echo ""

# Staging flag for testing
staging_arg=""
if [ "${STAGING}" = "1" ]; then
    staging_arg="--staging"
    echo "⚠️  Using Let's Encrypt STAGING environment (test certificates)"
    echo ""
fi

# Step 1: Start nginx (HTTP only) to serve ACME challenges
echo "1️⃣  Starting nginx for ACME challenge..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend
sleep 5

# Step 2: Request certificate
echo "2️⃣  Requesting certificate from Let's Encrypt..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
    certonly \
    --webroot \
    -w /var/www/certbot \
    $staging_arg \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --force-renewal

# Step 3: Reload nginx with SSL config
echo "3️⃣  Reloading nginx with SSL configuration..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate frontend

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ SSL Certificate installed successfully!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Your site is now available at:"
echo "    https://$DOMAIN"
echo ""
echo "  Certificates will auto-renew via the certbot service."
echo ""
echo "  To start all services with SSL:"
echo "    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
