# راهنمای استقرار سرور واسط ایران (Iran Relay Proxy Guide)

این سرویس برای کاربرانی است که سرور اصلی خود را در خارج از ایران (مثلاً AWS, Hetzner, Google Cloud, DigitalOcean) مستقر کرده‌اند و با سد تحریم و مسدودسازی آی‌پی‌های خارجی توسط شرکت مدیریت فناوری بورس تهران (TSETMC) مواجه می‌شوند.

---

## ۱. نحوه راه‌اندازی روی سرور مجازی ایران (Iran VPS)

یک سرور لینوکس ابری سبک (۱ هسته پردازنده، ۱ گیگابایت رم) از ارائه‌دهندگان معتبر داخلی مانند ابر آروان، پارس‌آنلاین، شاتل، افرانت یا آسیاتک تهیه کنید.

### گام‌ها:
```bash
# نصب پایتون و نیازمندی‌ها
sudo apt update && sudo apt install -y python3 python3-pip python3-venv

git clone <your-repo-url> /opt/tsetmc-relay
cd /opt/tsetmc-relay/relay

python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn httpx

# تنظیم کلید امنیتی اختصاصی
export RELAY_SECRET_TOKEN="my_ultra_secure_passphrase_123"

# اجرای سرویس با پورت 8080
uvicorn server:app --host 0.0.0.0 --port 8080
```

---

## ۲. راه‌اندازی با داکر (Docker)

```bash
docker run -d \
  --name tsetmc-relay \
  -p 8080:8080 \
  -e RELAY_SECRET_TOKEN="my_ultra_secure_passphrase_123" \
  tiangolo/uvicorn-gunicorn-fastapi:python3.10 \
  /bin/bash -c "pip install httpx && python -m uvicorn relay.server:app --host 0.0.0.0 --port 8080"
```

---

## ۳. اتصال سرور اصلی به رله
در فایل محیطی (`.env`) سرور اصلی خود، متغیر زیر را ثبت کنید:
```env
RELAY_URL="http://<IP-OF-IRAN-VPS>:8080"
RELAY_SECRET_TOKEN="my_ultra_secure_passphrase_123"
```
از این پس، تمامی درخواست‌های خروجی به TSETMC از طریق آی‌پی معتبر ایرانی سرور واسط روت می‌شوند.
