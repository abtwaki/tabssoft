#!/usr/bin/env bash
# TabsSoft website deploy — run on the VPS (Ubuntu 22.04).
# Usage: bash deploy.sh   (from the uploaded project directory)
set -euo pipefail

APP_ROOT=/var/www/tabssoft-website
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Syncing project to $APP_ROOT"
mkdir -p "$APP_ROOT"
rsync -a --delete \
    --exclude '.venv' --exclude 'node_modules' --exclude 'db.sqlite3' \
    --exclude '.git' --exclude '*.log' --exclude '__pycache__' \
    "$SRC_DIR/backend" "$SRC_DIR/frontend" "$SRC_DIR/deploy" "$APP_ROOT/"

echo "==> Python venv + dependencies"
cd "$APP_ROOT/backend"
[ -d .venv ] || python3 -m venv .venv
./.venv/bin/pip install -q -r requirements.txt

if [ ! -f .env ]; then
    echo "!! $APP_ROOT/backend/.env missing — copy .env.example and configure it" >&2
    exit 1
fi

echo "==> Migrations + static files"
./.venv/bin/python manage.py migrate --noinput
./.venv/bin/python manage.py collectstatic --noinput
./.venv/bin/python manage.py seed_demo   # idempotent

echo "==> Dedicated service user + log dir"
id tabssoft >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin -d "$APP_ROOT" tabssoft
mkdir -p /var/log/tabssoft
chown tabssoft:tabssoft /var/log/tabssoft
chown -R tabssoft:tabssoft "$APP_ROOT"
chmod 600 "$APP_ROOT/backend/.env"

echo "==> systemd service"
cp "$APP_ROOT/deploy/systemd/tabssoft-website.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now tabssoft-website
systemctl restart tabssoft-website

echo "==> Apache vhost"
cp "$APP_ROOT/deploy/apache/tabssoftglobal.com.conf" /etc/apache2/sites-available/
a2ensite tabssoftglobal.com
a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl >/dev/null
apache2ctl configtest
systemctl reload apache2

echo "==> Done. Health check:"
sleep 1
curl -s http://127.0.0.1:8003/api/health/ || true
echo
echo "Site live once DNS points here. Then run:"
echo "  certbot --apache -d tabssoftglobal.com -d www.tabssoftglobal.com \\"
echo "    -d tabssoftglobal.com.ng -d www.tabssoftglobal.com.ng"
