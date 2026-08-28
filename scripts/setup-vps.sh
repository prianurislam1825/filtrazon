#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  FILTRAZON — VPS Setup Script (Ubuntu 22.04)
#  Jalankan sebagai root: bash setup-vps.sh
# ─────────────────────────────────────────────────────────────

set -e
echo "═══════════════════════════════════════"
echo "  FILTRAZON VPS Setup - Ubuntu 22.04"
echo "═══════════════════════════════════════"

# ── 1. Update system ──────────────────────────────────────────
echo "[1/7] Update system..."
apt update && apt upgrade -y
apt install -y curl wget git unzip ufw nginx certbot python3-certbot-nginx

# ── 2. Install Node.js 20 ─────────────────────────────────────
echo "[2/7] Install Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# ── 3. Install PM2 ───────────────────────────────────────────
echo "[3/7] Install PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ── 4. Install MySQL 8 ────────────────────────────────────────
echo "[4/7] Install MySQL 8..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Set MySQL root password dan buat database
MYSQL_ROOT_PASS="Filtrazon@2024!"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS filtrazon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "CREATE USER IF NOT EXISTS 'filtrazon'@'localhost' IDENTIFIED BY 'Filtrazon@2024!';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "GRANT ALL PRIVILEGES ON filtrazon.* TO 'filtrazon'@'localhost';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"
echo "✅ MySQL siap. Password: Filtrazon@2024!"

# ── 5. Clone / upload project ────────────────────────────────
echo "[5/7] Setup project directory..."
mkdir -p /var/www/filtrazon
echo "  → Upload project ke /var/www/filtrazon"
echo "  → Gunakan: scp -r ./filtrazon/* root@IP:/var/www/filtrazon/"

# ── 6. Konfigurasi Nginx ──────────────────────────────────────
echo "[6/7] Setup Nginx..."
cat > /etc/nginx/sites-available/filtrazon << 'NGINX'
server {
    listen 80;
    server_name _;  # Ganti dengan domain Anda

    # Increase buffer for SSE
    proxy_buffering off;
    proxy_cache off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # SSE endpoint — no buffering
    location /api/live {
        proxy_pass http://localhost:3000/api/live;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400;
        chunked_transfer_encoding on;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/filtrazon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 7. Firewall ───────────────────────────────────────────────
echo "[7/7] Setup firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3306  # MySQL (hanya jika perlu akses external)
ufw --force enable

echo ""
echo "═══════════════════════════════════════"
echo "  Setup selesai!"
echo "═══════════════════════════════════════"
echo ""
echo "Langkah selanjutnya:"
echo "1. Upload project: scp -r /path/filtrazon/* root@VPS_IP:/var/www/filtrazon/"
echo "2. Atau clone dari GitHub:"
echo "   cd /var/www && git clone https://github.com/prianurislam1825/filtrazon.git"
echo "3. Jalankan: bash /var/www/filtrazon/scripts/deploy.sh"
echo ""
echo "Database:"
echo "  Host: localhost"
echo "  User: filtrazon"
echo "  Pass: Filtrazon@2024!"
echo "  DB:   filtrazon"
