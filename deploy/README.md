# Mismari SMM - VPS Deployment Guide

## المتطلبات
- Ubuntu 22.04 أو Debian 12
- RAM: 1GB كحد أدنى
- VPS مع صلاحية root

---

## الخطوة 1: إعداد السيرفر

ارفع ملف `setup-vps.sh` إلى السيرفر وشغله:

```bash
scp deploy/setup-vps.sh root@YOUR_VPS_IP:/root/
ssh root@YOUR_VPS_IP
chmod +x /root/setup-vps.sh
bash /root/setup-vps.sh
```

هذا السكريبت يقوم بتثبيت:
- Node.js 20
- PostgreSQL
- PM2 (لإدارة التطبيق)
- Nginx (reverse proxy)

---

## الخطوة 2: رفع ملفات التطبيق

```bash
# على جهازك الشخصي - اضغط الملفات
zip -r mismari-smm.zip . \
  --exclude "*.git*" \
  --exclude "node_modules/*" \
  --exclude "dist/*" \
  --exclude "attached_assets/*" \
  --exclude ".local/*"

# ارفع الملف إلى السيرفر
scp mismari-smm.zip root@YOUR_VPS_IP:/tmp/

# على السيرفر
ssh root@YOUR_VPS_IP
unzip /tmp/mismari-smm.zip -d /var/www/mismari
```

---

## الخطوة 3: تشغيل التطبيق

```bash
cd /var/www/mismari

# تثبيت الحزم
npm install

# بناء التطبيق
npm run build

# إعداد قاعدة البيانات
npm run db:push

# إنشاء مجلد الـ logs
mkdir -p /var/log/mismari

# تشغيل التطبيق
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

---

## الخطوة 4: التحقق

```bash
# التحقق من أن التطبيق يعمل
pm2 status
pm2 logs mismari

# التحقق من Nginx
curl http://localhost
```

---

## تحديث التطبيق لاحقاً

```bash
# ارفع الملفات الجديدة ثم شغل:
bash /var/www/mismari/deploy/deploy.sh
```

---

## متغيرات البيئة (ملف .env)

الملف موجود في `/var/www/mismari/.env`:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://mismari:PASSWORD@localhost:5432/mismari_db
AMAZING_SMM_API_KEY=89d66e38e7baebdb20f29843e6aebb06
SESSION_SECRET=RANDOM_SECRET
```

---

## إعداد SSL (اختياري - يحتاج دومين)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```
