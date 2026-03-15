#!/bin/bash
# ===========================================
# Mismari SMM - VPS Setup Script
# Ubuntu 22.04 / Debian 12 - Run as root
# ===========================================

set -e

echo "======================================"
echo "   Mismari SMM - VPS Setup"
echo "======================================"

# ---- 1. Update system ----
echo "[1/8] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ---- 2. Install Node.js 20 ----
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# ---- 3. Install PostgreSQL ----
echo "[3/8] Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# ---- 4. Create DB and user ----
echo "[4/8] Setting up database..."
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 20)

sudo -u postgres psql << SQL
CREATE USER mismari WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE mismari_db OWNER mismari;
GRANT ALL PRIVILEGES ON DATABASE mismari_db TO mismari;
SQL

DATABASE_URL="postgresql://mismari:${DB_PASSWORD}@localhost:5432/mismari_db"
echo ""
echo ">>> Database URL: $DATABASE_URL"
echo ">>> SAVE THIS PASSWORD: $DB_PASSWORD"
echo ""

# ---- 5. Install PM2 ----
echo "[5/8] Installing PM2..."
npm install -g pm2

# ---- 6. Setup app directory ----
echo "[6/8] Setting up application directory..."
APP_DIR="/var/www/mismari"
mkdir -p $APP_DIR

# ---- 7. Create .env file ----
echo "[7/8] Creating environment file..."
SESSION_KEY=$(openssl rand -base64 32)

cat > $APP_DIR/.env << ENV
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
AMAZING_SMM_API_KEY=89d66e38e7baebdb20f29843e6aebb06
SESSION_SECRET=${SESSION_KEY}
ENV

echo ".env created at $APP_DIR/.env"

# ---- 8. Install and configure Nginx ----
echo "[8/8] Installing and configuring Nginx..."
apt-get install -y nginx

cat > /etc/nginx/sites-available/mismari << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/mismari /etc/nginx/sites-enabled/mismari
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx

echo ""
echo "======================================"
echo "   Setup complete!"
echo ""
echo "   Next steps:"
echo "   1. Upload app zip to /tmp/mismari.zip"
echo "   2. Run: unzip /tmp/mismari.zip -d /var/www/mismari"
echo "   3. Run: cd /var/www/mismari && npm install"
echo "   4. Run: npm run build"
echo "   5. Run: npm run db:push"
echo "   6. Run: pm2 start ecosystem.config.cjs --env production"
echo "   7. Run: pm2 save && pm2 startup"
echo "======================================"
