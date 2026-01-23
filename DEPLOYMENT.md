# 🚀 Deployment Guide - Intelligent Expense Tracker

This guide covers deploying both the **Backend (FastAPI)** and **Frontend (React)** to various cloud platforms.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
   - [Railway](#option-1-railway-recommended)
   - [Render](#option-2-render)
   - [Heroku](#option-3-heroku)
3. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#option-1-vercel-recommended)
   - [Netlify](#option-2-netlify)
4. [Database Migration](#database-migration)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Tested the application locally (both frontend and backend)
- ✅ Git repository pushed to GitHub
- ✅ Requirements.txt is up to date
- ✅ Environment variables documented
- ✅ CORS settings configured for production domains
- ✅ ML model trained and saved (`ml/model.pkl` exists)

---

## Backend Deployment

### Option 1: Railway (Recommended)

Railway offers the easiest deployment for Python apps with a generous free tier.

#### Steps:

1. **Sign up at [Railway.app](https://railway.app/)**
   - Use your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `intelligent-expense-tracker`

3. **Configure**
   - Railway auto-detects Python
   - It will use `requirements.txt` automatically

4. **Add Start Command**
   - In Settings → Deploy
   - Set Start Command:
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

5. **Set Environment Variables** (in Variables tab)
   ```
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   DATABASE_URL=sqlite:///./expenses.db
   ```

6. **Deploy**
   - Railway automatically deploys on push to main
   - Get your API URL: `https://your-app.railway.app`

7. **Test**
   - Visit `https://your-app.railway.app/docs`
   - Should see Swagger API documentation

---

### Option 2: Render

1. **Sign up at [Render.com](https://render.com/)**

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository

3. **Configure**
   - **Name**: intelligent-expense-tracker-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

5. **Advanced Settings**
   - Health Check Path: `/health`
   - Auto-Deploy: Yes

6. **Deploy**
   - Click "Create Web Service"

---

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # Visit https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create intelligent-expense-tracker-api
   ```

3. **Create `Procfile`** in project root:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is built by the creators of Next.js and offers excellent performance for React apps.

#### Steps:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Web Interface**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `intelligent-expense-tracker`

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variable**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-api.railway.app/api/v1
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push to main

6. **Custom Domain** (Optional)
   - Settings → Domains
   - Add your custom domain

#### Deploy via CLI:
```bash
cd intelligent-expense-tracker
vercel

# For production
vercel --prod
```

---

### Option 2: Netlify

1. **Sign up at [Netlify.com](https://www.netlify.com/)**

2. **Build Locally**
   ```bash
   # Create .env.production
   echo "VITE_API_URL=https://your-backend-api.railway.app/api/v1" > .env.production
   
   # Build
   npm run build
   ```

3. **Deploy via Drag & Drop**
   - Go to Netlify dashboard
   - Drag the `dist/` folder to deploy area

4. **Or Deploy via Git**
   - New Site from Git
   - Connect to GitHub repo
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

5. **Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add:
     ```
     VITE_API_URL=https://your-backend-api.railway.app/api/v1
     ```

6. **Deploy**
   - Netlify auto-deploys on push

---

## Database Migration

### SQLite (Default - Development Only)

- SQLite works for low-traffic demos
- File-based, included in deployment
- **Not recommended for production with multiple instances**

### PostgreSQL (Production Recommended)

1. **Add PostgreSQL to Railway/Render**
   - Railway: Add PostgreSQL plugin
   - Render: Create PostgreSQL database

2. **Update Backend Code**

   Install psycopg2:
   ```bash
   pip install psycopg2-binary
   pip freeze > requirements.txt
   ```

3. **Update `database.py`**:
   ```python
   import os
   
   DATABASE_URL = os.getenv(
       "DATABASE_URL", 
       "sqlite:///./expenses.db"
   )
   
   # Fix for Heroku PostgreSQL URLs
   if DATABASE_URL.startswith("postgres://"):
       DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
   
   engine = create_engine(DATABASE_URL)
   ```

4. **Set Environment Variable**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

5. **Run Migrations** (first deploy)
   - Tables auto-create on first run via SQLAlchemy

---

## Environment Variables

### Backend `.env` (for local development)
```env
# API Settings
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app

# Database (production)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional
DEBUG=False
LOG_LEVEL=INFO
```

### Frontend `.env.production`
```env
# API URL
VITE_API_URL=https://your-backend-api.railway.app/api/v1
```

---

## Post-Deployment Testing

### 1. Test Backend Health
```bash
curl https://your-backend-api.railway.app/health
# Should return: {"status": "healthy"}
```

### 2. Test API Endpoints
```bash
# Get expenses
curl https://your-backend-api.railway.app/api/v1/expenses

# Create expense
curl -X POST https://your-backend-api.railway.app/api/v1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test expense",
    "amount": 100,
    "category": "Food",
    "date": "2026-01-23",
    "type": "expense",
    "user_id": 1
  }'
```

### 3. Test Frontend
1. Visit your frontend URL
2. Try adding an expense manually
3. Test the Smart Add feature
4. Check if charts render correctly
5. Verify backend API calls in Network tab (F12)

### 4. Test CORS
- Open browser console on frontend
- Look for CORS errors
- If errors exist, add frontend domain to backend `ALLOWED_ORIGINS`

---

## Troubleshooting

### Backend Issues

#### "Application Error" on Railway/Render
```bash
# Check logs
railway logs  # Railway
render logs <service-id>  # Render

# Common issues:
# 1. Missing dependencies in requirements.txt
# 2. Wrong start command
# 3. Port binding (use $PORT not hardcoded 8000)
```

#### Database Connection Errors
```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql://user:pass@host:5432/dbname
# SQLite: sqlite:///./expenses.db

# For Railway, use the provided connection string
```

#### CORS Errors
Update `config.py`:
```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-frontend.vercel.app",
    "https://your-frontend.netlify.app",
]
```

### Frontend Issues

#### "Failed to fetch" errors
1. Check if backend is running
2. Verify `VITE_API_URL` is correct
3. Check browser console for exact error
4. Test API directly with curl

#### Build Failures on Vercel
```bash
# Check Node version
# In vercel.json:
{
  "buildCommand": "npm install && npm run build",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

#### Environment Variables Not Working
- Environment variables in Vite MUST start with `VITE_`
- Redeploy after changing environment variables
- Check variable is set in build logs

---

## Performance Optimization

### Backend
```python
# Add caching for ML predictions
from functools import lru_cache

@lru_cache(maxsize=1000)
def predict_category(description: str):
    # ML prediction logic
    pass
```

### Frontend
```bash
# Enable compression in vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression()
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

---

## Security Considerations

1. **Never commit `.env` files**
   - Add to `.gitignore`

2. **Use HTTPS only in production**
   - Both platforms provide free SSL

3. **Restrict CORS**
   - Only allow your frontend domain

4. **Rate Limiting** (Advanced)
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/api/v1/expenses")
   @limiter.limit("10/minute")
   async def create_expense():
       pass
   ```

5. **Database Backups**
   - Railway/Render offer automated backups
   - Export data periodically

---

## Monitoring & Logs

### Railway
```bash
railway logs --tail
```

### Render
- Dashboard → Logs tab
- Set up log drain for persistence

### Vercel
- Project → Deployments → View Function Logs

### Application Monitoring
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage stats

---

## Continuous Deployment

Both platforms auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway/Render/Vercel/Netlify auto-deploy
```

---

## Cost Estimates

### Free Tier Limits

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| Railway | $5/month credit | 500 hours/month |
| Render | Free (with limits) | Sleeps after 15min inactivity |
| Heroku | Eco Dyno $5/month | No free tier anymore |
| Vercel | Free | Unlimited bandwidth |
| Netlify | Free | 100GB bandwidth/month |

### Recommended Setup (Free)
- **Backend**: Railway ($5 credit covers small apps)
- **Frontend**: Vercel (unlimited free tier)
- **Total**: $0-5/month

---

## Support

If you encounter issues:

1. Check logs first
2. Review this guide
3. Search GitHub issues
4. Open a new issue with:
   - Platform (Railway/Vercel/etc)
   - Error logs
   - Steps to reproduce

---

**Happy Deploying! 🚀**

Built with ❤️ by [Mithraa-N](https://github.com/Mithraa-N)
