# Decor Carpi - Complete Setup Guide

**Step-by-step instructions for local development and production deployment**

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Configuration](#database-configuration)
3. [Environment Variables](#environment-variables)
4. [PWA Installation](#pwa-installation)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Step 1: Extract and Navigate

```bash
# Extract ZIP file
unzip decorcarpi-complete.zip

# Navigate to project
cd decorcarpi-complete
```

### Step 2: Install Node.js (if needed)

```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Recommended: Node.js 22 LTS
```

### Step 3: Install pnpm (recommended)

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Step 4: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install

# This installs all packages from package.json
# Takes ~2-3 minutes
```

### Step 5: Setup Environment Variables

```bash
# Copy template to .env
cp .env.example .env

# Edit .env with your editor
nano .env
# or
code .env
```

**See [Environment Variables](#environment-variables) section below for what to fill in.**

### Step 6: Setup Database

```bash
# Generate and run migrations
pnpm db:push

# This command:
# 1. Generates migrations from schema.ts
# 2. Applies migrations to database
# 3. Creates all tables
```

### Step 7: Start Development Server

```bash
# Start dev server
pnpm dev

# Output will show:
# ✓ built in 2.5s
# ➜  Local:   http://localhost:3000/
# ➜  press h to show help
```

### Step 8: Open in Browser

```
http://localhost:3000
```

**You should see the Decor Carpi home page with:**
- Hero banner
- Texture gallery
- Calculator tools
- Portfolio section

---

## Database Configuration

### Option 1: Local SQLite (Development)

**Easiest for local testing - no setup required**

```env
# .env
DATABASE_URL=file:./dev.db
```

### Option 2: MySQL/TiDB (Production)

**Recommended for production**

```env
# .env
DATABASE_URL=mysql://user:password@host:3306/decorcarpi

# Example with TiDB Cloud:
DATABASE_URL=mysql://root:password@gateway01.eu-west-1.prod.aws.tidbcloud.com:4000/decorcarpi
```

### Option 3: PostgreSQL

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/decorcarpi
```

### Create Database (MySQL Example)

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL shell:
CREATE DATABASE decorcarpi;
CREATE USER 'decorcarpi_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON decorcarpi.* TO 'decorcarpi_user'@'localhost';
FLUSH PRIVILEGES;

# Update .env:
DATABASE_URL=mysql://decorcarpi_user:strong_password@localhost:3306/decorcarpi
```

---

## Environment Variables

### Required Variables

```env
# ===== DATABASE =====
DATABASE_URL=mysql://user:password@host/decorcarpi

# ===== MANUS OAUTH =====
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# ===== AI SERVICES =====
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxx

# ===== SECURITY =====
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# ===== APP CONFIG =====
APP_MODE=development
VITE_APP_TITLE=Decor Carpi
```

### Optional Variables (Stripe)

```env
# ===== STRIPE (Optional) =====
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Get API Keys

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy and paste in .env

**Replicate:**
1. Go to https://replicate.com/account
2. Copy API token
3. Paste in .env

**Manus OAuth:**
1. Go to Manus dashboard
2. Create OAuth app
3. Copy app ID
4. Paste in .env

---

## PWA Installation

### Desktop (Chrome/Edge)

1. Open app: `http://localhost:3000`
2. Click install icon (top-right address bar)
3. Click "Install"
4. App launches in window

### Android (Chrome)

1. Open app: `http://localhost:3000` in Chrome
2. Tap menu (⋮)
3. Tap "Installa app"
4. Confirm
5. App appears on home screen

### iOS (Safari)

1. Open app: `http://localhost:3000` in Safari
2. Tap Share (bottom)
3. Tap "Aggiungi a schermata iniziale"
4. Name: "Decor Carpi"
5. Tap "Aggiungi"
6. App appears on home screen

### PWA Features

Once installed:
- ✅ Works offline (cached pages)
- ✅ Fast load times
- ✅ Push notifications
- ✅ Home screen icon
- ✅ Full screen mode

---

## Production Deployment

### Option 1: Render (Recommended)

**Easiest deployment platform**

#### Step 1: Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/your-username/decorcarpi.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Render

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Select your repository
5. Configure:
   - **Name:** decorcarpi
   - **Environment:** Node
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `node dist/index.js`
   - **Region:** Choose closest to users

#### Step 3: Add Environment Variables

In Render dashboard:
1. Go to Environment
2. Add all variables from `.env`:
   - DATABASE_URL
   - VITE_APP_ID
   - OPENAI_API_KEY
   - REPLICATE_API_TOKEN
   - JWT_SECRET
   - etc.

#### Step 4: Deploy

1. Click "Create Web Service"
2. Render builds and deploys automatically
3. Your app is live at: `https://decorcarpi.onrender.com`

### Option 2: Vercel

**Fast deployment for frontend**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
# Add environment variables when asked
```

### Option 3: Docker

**Deploy anywhere with Docker**

#### Create Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

# Build
RUN pnpm build

# Start
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### Build and Run

```bash
# Build image
docker build -t decorcarpi .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e VITE_APP_ID="..." \
  -e OPENAI_API_KEY="..." \
  decorcarpi
```

---

## Media Files

All **56 media assets** are included in:

```
client/public/manus-storage/
```

### Asset Breakdown

| Type | Count | Size |
|------|-------|------|
| Textures (JPG/PNG) | 23 | ~60MB |
| Certifications (PNG) | 4 | ~2MB |
| Portfolio (JPG) | 4 | ~10MB |
| Portfolio (MP4) | 3 | ~45MB |
| Gallery (JPG) | 6 | ~8MB |
| Antimuffa (JPG/WEBP) | 3 | ~5MB |
| Hero (WEBP) | 1 | ~250KB |
| **Total** | **56** | **~150MB** |

**See `MEDIA-INVENTORY.json` for complete list.**

---

## Troubleshooting

### "pnpm: command not found"

```bash
# Install pnpm globally
npm install -g pnpm

# Or use npm instead
npm install
npm run dev
```

### "Cannot find module 'react'"

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Database connection failed"

```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -e "SELECT 1"

# If using TiDB Cloud, enable SSL:
DATABASE_URL="mysql://user:pass@host/db?ssl=true"
```

### "OAuth not working"

```bash
# Check VITE_APP_ID
echo $VITE_APP_ID

# Clear cookies
# In browser: DevTools → Application → Cookies → Delete all

# Restart dev server
pnpm dev
```

### "Images not loading"

```bash
# Check files exist
ls -la client/public/manus-storage/

# Check permissions
chmod 644 client/public/manus-storage/*

# Clear browser cache
# Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

### "PWA not installing"

```bash
# PWA requires HTTPS in production
# For local development, use:
# - http://localhost:3000 (works)
# - http://127.0.0.1:3000 (works)

# In production, ensure HTTPS is enabled
# Render/Vercel handle this automatically
```

### "Build fails"

```bash
# Check TypeScript errors
pnpm type-check

# Check build output
pnpm build

# View detailed error
npm run build 2>&1 | tail -50
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start dev server
pnpm dev

# 2. Make changes to code
# Editor auto-saves, browser auto-refreshes

# 3. Test PWA
# Open DevTools → Application → Service Workers

# 4. Test on mobile
# Find your local IP:
ipconfig getifaddr en0  # Mac
hostname -I             # Linux

# Open: http://YOUR_IP:3000 on phone
```

### Before Deployment

```bash
# 1. Run tests
pnpm test

# 2. Type check
pnpm type-check

# 3. Format code
pnpm format

# 4. Build production
pnpm build

# 5. Preview build
pnpm preview

# 6. Commit changes
git add .
git commit -m "Ready for production"
git push
```

---

## Performance Tips

### Optimize Images

```bash
# Convert PNG to WebP (smaller size)
cwebp image.png -o image.webp

# Compress JPG
jpegoptim --max=85 image.jpg
```

### Enable Caching

```env
# In production, set:
APP_MODE=production

# This enables:
# - Service worker caching
# - Browser caching headers
# - Gzip compression
```

### Monitor Performance

```bash
# Check bundle size
pnpm build
ls -lh dist/

# Analyze dependencies
pnpm dlx depcheck
```

---

## Next Steps

1. ✅ Extract ZIP
2. ✅ Install dependencies: `pnpm install`
3. ✅ Configure `.env`
4. ✅ Setup database: `pnpm db:push`
5. ✅ Start dev: `pnpm dev`
6. ✅ Test locally: `http://localhost:3000`
7. ✅ Test PWA installation
8. ✅ Deploy to production

**Questions? Check README.md or MEDIA-INVENTORY.json**

---

**Happy coding! 🚀**
