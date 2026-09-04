# KTX VPS Deployment Guide

This project can be deployed to any VPS running Docker. Here's how.

---

## Prerequisites

- VPS with Docker + Docker Compose installed
- Ubuntu 20.04+ or Debian 11+ recommended
- At least 2 GB RAM, 2 vCPU
- Open ports: 80 (HTTP), 443 (HTTPS optional), 22 (SSH)

---

## Step 1 — Clone the repo on VPS

```bash
git clone https://github.com/davidganton1-alt/KTX.git /opt/kingdomtradex
cd /opt/kingdomtradex
```

## Step 2 — Set up data directory

```bash
mkdir -p /opt/kingdomtradex/data
# Copy data files from your local machine or start fresh
# The app will create users.json, pastors.json, announcements.json on first use
```

## Step 3 — Update environment for VPS

Edit `docker-compose.yml` if needed:
- Change port mapping from `3000:3000` to `80:3000` if running as non-root
- Or keep `3000:3000` and use a reverse proxy (nginx/Caddy) in front

## Step 4 — Build and start

```bash
cd /opt/kingdomtradex
docker compose up -d --build
```

## Step 5 — Verify

```bash
curl http://localhost:3000/
# Should return HTTP 200

docker compose ps
# Both containers should be "Up (healthy)"
```

## Step 6 — Reverse Proxy (optional but recommended)

### Using Caddy (simplest — auto HTTPS):

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy (/etc/caddy/Caddyfile):
echo "yourdomain.com {
    reverse_proxy localhost:3000
}" | sudo tee /etc/caddy/Caddyfile

sudo systemctl restart caddy
```

### Using Nginx:

```bash
sudo apt install nginx
sudo tee /etc/nginx/sites-available/kingdomtradex << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/kingdomtradex /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## Step 7 — Auto-start on VPS boot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# The docker-compose.yml already has restart: always on both services
# So containers will auto-start when Docker starts
```

## Step 8 — Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Data Management on VPS

The data folder (`/app/data` in container, `./data` on host) stores:
- `users.json` — user accounts and balances
- `pastors.json` — pastor accounts and earnings
- `announcements.json` — admin announcements

**Backing up data on VPS:**
```bash
# Backup
tar czf ktx-data-backup-$(date +%Y%m%d).tar.gz /opt/kingdomtradex/data/

# Restore
tar xzf ktx-data-backup-YYYYMMDD.tar.gz -C /opt/kingdomtradex/
docker compose restart
```

---

## Update Workflow on VPS

When you push changes to GitHub:

```bash
cd /opt/kingdomtradex
git pull origin master
docker compose down
docker compose up -d --build
```

Or use the management script (adapted for VPS):
```bash
./update-ktx.sh  # on VPS
```

---

## Architecture on VPS

```
Internet → Port 80/443 → Reverse Proxy (Caddy/Nginx) → Docker Container (port 3000) → Next.js app
                                                                          ↓
                                                                  Volume: ./data (users.json, etc.)
```

---

## Checking logs on VPS

```bash
docker compose logs -f          # All logs
docker compose logs -f main     # Main container only
docker compose logs -f preview  # Preview container only
docker compose ps               # Container status
docker compose down && docker compose up -d  # Restart
```

---

## Project Structure (for reference)

```
KingdomTradeX/
├── app/                    # Next.js App Router pages
│   ├── api/               # All API routes
│   ├── admin/             # Admin dashboard
│   ├── console/           # User dashboard
│   ├── pastor/            # Pastor panel
│   ├── ai-trading/        # AI trading page
│   ├── markets/           # Live markets
│   ├── wallet/            # Wallet/deposits/withdrawals
│   ├── plans/             # Tier plans
│   └── ...
├── components/            # React components
├── lib/                   # Core logic
│   ├── store.ts          # User data layer + tier config
│   ├── pastorStore.ts    # Pastor data layer
│   ├── auth.ts          # JWT authentication
│   ├── engine.ts        # AI trading engine
│   ├── announcements.ts # Announcements
│   └── ...
├── public/                # Static assets
├── data/                  # JSON data files (persisted via Docker volume)
├── Dockerfile            # Production container (port 3000)
├── Dockerfile-preview    # Preview container (port 3001)
├── Dockerfile-preview-selfcontained # Self-contained preview image
├── docker-compose.yml    # Original compose (port 3000 only)
├── dockercompose-all.yml # Full compose (both 3000 + 3001)
├── next.config.mjs       # Next.js config (standalone output)
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```
