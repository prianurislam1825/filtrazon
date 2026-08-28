#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  FILTRAZON — Deploy Script
#  Jalankan di VPS setelah project diupload
#  cd /var/www/filtrazon && bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────

set -e
cd /var/www/filtrazon

echo "═══════════════════════════════════════"
echo "  FILTRAZON Deploy"
echo "═══════════════════════════════════════"

# ── 1. Buat .env.local ───────────────────────────────────────
echo "[1/5] Buat .env.local..."
cat > .env.local << 'ENV'
APP_MODE=cloud
AUTH_ENABLED=true
DATABASE_URL=mysql://filtrazon:Filtrazon@2024!@localhost:3306/filtrazon
NEXTAUTH_SECRET=ganti-dengan-random-string-panjang
NEXTAUTH_URL=http://YOUR_VPS_IP
DEVICE_TOKEN=filtrazon-iot-token-2024
DEVICE_TOKEN_SECRET=filtrazon-secret-2024
LOGIN_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_WINDOW_MS=600000
ENV

echo "⚠️  Edit .env.local dan ganti NEXTAUTH_URL dengan IP/domain VPS Anda"

# ── 2. Install dependencies ──────────────────────────────────
echo "[2/5] Install dependencies..."
npm install --cache /tmp/npm-cache --no-audit --no-fund

# ── 3. Setup database ─────────────────────────────────────────
echo "[3/5] Setup database..."
mysql -u filtrazon -p'Filtrazon@2024!' filtrazon < lib/db/schema.sql
echo "✅ Schema database berhasil diimport"

# ── 4. Build Next.js ─────────────────────────────────────────
echo "[4/5] Build Next.js..."
npm run build

# ── 5. Start dengan PM2 ───────────────────────────────────────
echo "[5/5] Start dengan PM2..."
pm2 delete filtrazon 2>/dev/null || true
pm2 start npm --name "filtrazon" -- start
pm2 save

echo ""
echo "═══════════════════════════════════════"
echo "  FILTRAZON berhasil dijalankan!"
echo "═══════════════════════════════════════"
echo ""
echo "Status: pm2 status"
echo "Log:    pm2 logs filtrazon"
echo "Stop:   pm2 stop filtrazon"
echo ""
echo "Akses: http://YOUR_VPS_IP"
echo "Login: admin@filtrazon.local / filtrazon2024"
