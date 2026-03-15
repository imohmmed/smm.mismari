#!/bin/bash
# ===========================================
# Mismari SMM - Deploy / Update Script
# Run from /var/www/mismari after uploading new files
# ===========================================

set -e

APP_DIR="/var/www/mismari"
cd $APP_DIR

echo "======================================"
echo "   Mismari SMM - Deploying..."
echo "======================================"

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "[1/5] Installing dependencies..."
npm install --production=false

echo "[2/5] Building application..."
npm run build

echo "[3/5] Running database migrations..."
npm run db:push

echo "[4/5] Restarting app with PM2..."
if pm2 list | grep -q "mismari"; then
  pm2 restart mismari
else
  pm2 start ecosystem.config.cjs --env production
fi

echo "[5/5] Saving PM2 config..."
pm2 save

echo ""
echo "======================================"
echo "   Deployment complete!"
echo "   Status: $(pm2 status mismari | tail -2)"
echo "======================================"
