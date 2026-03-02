#!/bin/bash
# Pull current production data and commit as backup.
# Run before each deploy to snapshot live data.
set -e

cd "$(dirname "$0")/.."

echo "Pulling photo orders from production..."
curl -s https://wilson-premier.com/api/photo-order?property=_all | \
  python3 -c "import json,sys; d=json.load(sys.stdin); json.dump(d.get('orders',{}), open('data/photo-orders.json','w'), indent=2)"

echo "Pulling site config from production..."
curl -s https://wilson-premier.com/api/site-config/public | \
  python3 -c "import json,sys; json.dump(json.load(sys.stdin), open('data/site-config.json','w'), indent=2)"

echo "Committing backup..."
git add data/photo-orders.json data/site-config.json
git commit -m "backup: production data snapshot $(date +%Y-%m-%d)" || echo "No changes to commit"

echo "Done."
