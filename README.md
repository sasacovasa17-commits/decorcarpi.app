# Decor Carpi - Stucchi Decorativi

**Complete Application Package** - React 19 + Node.js + AI Integration + PWA

---

## 📦 What's Included

This ZIP contains the **complete, production-ready** decorcarpi application:

- ✅ Full source code (React + Node.js + tRPC)
- ✅ Database schema (Drizzle ORM + migrations)
- ✅ All media files (56 assets: images + videos)
- ✅ PWA configuration (manifest.json + service worker)
- ✅ AI integration (Replicate + LLM)
- ✅ Configuration files (.env.example, package.json, etc)
- ✅ Comprehensive documentation

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 22+ or pnpm 9+
- MySQL/TiDB database (or SQLite for local testing)
- Internet connection (for AI features)

### Installation

```bash
# 1. Extract ZIP and navigate to directory
unzip decorcarpi-complete.zip
cd decorcarpi-complete

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Setup environment variables
cp .env.example .env

# Edit .env and add:
# - DATABASE_URL: your MySQL connection string
# - VITE_APP_ID: Manus OAuth app ID
# - REPLICATE_API_TOKEN: Replicate AI token
# - OPENAI_API_KEY: OpenAI API key
# - Other required keys (see .env.example)

# 4. Setup database
pnpm db:push
# This runs: drizzle-kit generate && drizzle-kit migrate

# 5. Start development server
pnpm dev

# 6. Open in browser
# http://localhost:3000
```

---

## 📱 PWA Installation (Mobile)

### Android
1. Open app in Chrome: `https://your-domain.com`
2. Tap menu (⋮) → "Installa app"
3. Confirm installation
4. App appears on home screen

### iOS
1. Open app in Safari: `https://your-domain.com`
2. Tap Share → "Aggiungi a schermata iniziale"
3. Confirm
4. App appears on home screen

### Desktop
1. Open app in Chrome/Edge
2. Click install icon (top-right address bar)
3. Confirm
4. App launches in window mode

---

## 🌐 Deployment (Production)

### Option 1: Render (Recommended)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Create Render account: https://render.com
# 3. New Web Service → Connect GitHub repo
# 4. Configure:
#    - Build Command: pnpm install && pnpm build
#    - Start Command: node dist/index.js
#    - Environment: Add all .env variables
# 5. Deploy!
```

### Option 2: Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts and add environment variables
```

### Option 3: Docker

```bash
# Build Docker image
docker build -t decorcarpi .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e VITE_APP_ID="..." \
  decorcarpi
```

---

## 📁 Project Structure

```
decorcarpi-complete/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utilities & tRPC client
│   │   └── App.tsx           # Main router
│   └── public/
│       └── manus-storage/    # All media files (56 assets)
│
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   └── _core/                # Framework code
│
├── drizzle/                   # Database
│   ├── schema.ts             # Table definitions
│   └── migrations/           # Migration files
│
├── shared/                    # Shared types
├── package.json              # Dependencies
├── .env.example              # Environment template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── manifest.json             # PWA manifest
├── MEDIA-INVENTORY.json      # Media asset list
└── README.md                 # This file
```

---

## 🎨 Media Files

All **56 media assets** are included in `client/public/manus-storage/`:

| Category | Count | Files |
|----------|-------|-------|
| Textures | 23 | img_1.jpg - img_10.jpg + enhanced PNGs |
| Certifications | 4 | diploma_1-4.png |
| Portfolio | 7 | 4 images + 3 MP4 videos |
| Gallery | 9 | WhatsApp + Antimuffa images |
| Hero | 1 | hero-banner.webp |
| **Total** | **56** | ~150MB |

**See `MEDIA-INVENTORY.json` for complete list with URLs and descriptions.**

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/decorcarpi

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# AI Services
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Other
JWT_SECRET=your_secret_key
APP_MODE=production
```

See `.env.example` for all required variables.

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

---

## 🔧 Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Format code
pnpm format

# Type check
pnpm type-check

# Database operations
pnpm db:push      # Push schema changes
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
```

---

## 📚 Key Features

### ✨ AI Interior Designer (Ispirazione D.C.)
- Upload room photo
- AI analyzes lighting & room type
- Generates design recommendations
- Preview with applied textures
- Save to projects

### 🎨 Paint Visualizer (Vernice AI)
- Upload wall photo
- AI detects walls
- Apply paint colors
- Real-time preview
- Export results

### 📊 Quote Calculator
- 20+ decorative finishes
- Real-time price calculation
- Save quotes locally
- Export to PDF
- Send via WhatsApp

### 📱 PWA Support
- Install on home screen
- Offline functionality
- Push notifications
- Fast load times

### 🔐 User Authentication
- Manus OAuth integration
- Role-based access (admin/user)
- Session management
- Secure API endpoints

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Ensure database server is running
- Verify credentials

### "OAuth not working"
- Verify `VITE_APP_ID` is correct
- Check `OAUTH_SERVER_URL` is reachable
- Clear browser cookies

### "Images not loading"
- Verify files exist in `client/public/manus-storage/`
- Check file permissions
- Clear browser cache

### "PWA not installing"
- Ensure HTTPS is enabled (production)
- Check `manifest.json` is valid
- Clear service worker cache

---

## 📞 Support

For issues or questions:
1. Check `.env.example` for configuration
2. Review `MEDIA-INVENTORY.json` for asset info
3. Check browser console for errors
4. Review server logs: `npm run dev`

---

## 📄 License

Proprietary - Decor Carpi

---

## 🎯 Next Steps

1. ✅ Extract ZIP
2. ✅ Install dependencies
3. ✅ Configure `.env`
4. ✅ Run `pnpm db:push`
5. ✅ Start dev server: `pnpm dev`
6. ✅ Test PWA installation
7. ✅ Deploy to production

**Happy coding! 🚀**
