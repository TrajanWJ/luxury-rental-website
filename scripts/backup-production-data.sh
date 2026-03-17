#!/bin/bash
# Pull current production data and commit as backup.
# Run before each deploy to snapshot live data.
set -e

cd "$(dirname "$0")/.."

SITE_URL="${SITE_URL:-https://wilson-premier.com}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "Pulling photo orders from production..."
curl -s "${SITE_URL}/api/photo-order?property=_all" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); json.dump(d.get('orders',{}), open('data/photo-orders.json','w'), indent=2)"

if [ -n "${ADMIN_USERNAME:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "Logging in as admin to pull full site config..."
  curl -s -X POST "${SITE_URL}/api/admin/auth" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
    -c "$COOKIE_JAR" >/dev/null

  if grep -q "admin-session" "$COOKIE_JAR"; then
    echo "Pulling full site config (includes email settings + activity log)..."
    curl -s "${SITE_URL}/api/site-config" \
      -b "$COOKIE_JAR" | \
      python3 -c "import json,sys; json.dump(json.load(sys.stdin), open('data/site-config.json','w'), indent=2)"
  else
    echo "Admin login failed; falling back to public site config."
    curl -s "${SITE_URL}/api/site-config/public" | \
      python3 -c "import json,sys; json.dump(json.load(sys.stdin), open('data/site-config.json','w'), indent=2)"
  fi
else
  echo "ADMIN_USERNAME / ADMIN_PASSWORD not set; pulling public site config only."
  curl -s "${SITE_URL}/api/site-config/public" | \
    python3 -c "import json,sys; json.dump(json.load(sys.stdin), open('data/site-config.json','w'), indent=2)"
fi

echo "Committing backup..."
git add data/photo-orders.json data/site-config.json
git commit -m "backup: production data snapshot $(date +%Y-%m-%d)" || echo "No changes to commit"

echo "Done."
