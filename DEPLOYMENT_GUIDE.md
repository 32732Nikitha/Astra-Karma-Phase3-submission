# Bhima Astra - GitHub & Deployment Guide

## 📋 Overview
This guide covers:
1. Pushing your project to GitHub
2. Deploying Backend to Render
3. Deploying Frontend to Vercel

---

## 🚀 Part 1: Push to GitHub

### Prerequisites
- GitHub account created
- Git installed on your machine
- Repository created on GitHub (without initializing README, .gitignore, or license)

### Step-by-Step Instructions

#### 1. Navigate to your project root
```bash
cd /Users/laxmivarshitha/Documents/Hackathons/GuideWireDevTrails/bhima_astra1
```

#### 2. Initialize Git (if not already initialized)
```bash
git init
git add .
git commit -m "Initial commit: Bhima Astra project setup"
```

#### 3. Add GitHub remote
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repository name:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### 4. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

### Verify
Visit `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME` in your browser to confirm all files are uploaded.

---

## ⚙️ Part 2: Deploy Backend to Render

### Prerequisites
- Render account (https://render.com)
- PostgreSQL database ready (or use Render's PostgreSQL)
- Redis instance ready (use Render's Redis)
- All environment variables ready

### Step-by-Step Instructions

#### 1. Create a Render Account
- Go to https://render.com
- Sign up (you can use GitHub for faster setup)

#### 2. Connect GitHub Repository
- In Render dashboard, click **"New +"** → **"Web Service"**
- Select **"Build and deploy from a Git repository"**
- Click **"Connect"** and authorize Render to access your GitHub account
- Select your repository `YOUR_USERNAME/YOUR_REPO_NAME`

#### 3. Configure Web Service
**General Settings:**
- **Name:** `bhima-astra-backend`
- **Branch:** `main`
- **Root Directory:** `bhima_astra_backend` (important!)
- **Runtime:** `Python 3.10`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan:** `Free` (or choose based on your needs)

#### 4. Add Environment Variables
Click on **"Environment"** tab and add these variables:

**Critical Variables (must set):**
```
DATABASE_URL=postgresql://user:password@host:5432/db_name
REDIS_URL=redis://user:password@host:6379
ANTHROPIC_API_KEY=your_anthropic_api_key
SECRET_KEY=your_secret_key_here
ENVIRONMENT=production
```

**For API Keys (from api_keys.txt):**
```

```

#### 5. Create Render PostgreSQL Database
- In Render dashboard: **"New +"** → **"PostgreSQL"**
- **Name:** `bhima-astra-db`
- **PostgreSQL Version:** `15` (or latest)
- **Region:** Choose closest to your location
- Note the **Internal Database URL**
- Use this URL as your `DATABASE_URL`

#### 6. Create Render Redis Cache
- In Render dashboard: **"New +"** → **"Redis"**
- **Name:** `bhima-astra-redis`
- **Region:** Same as database
- Note the **Internal Redis URL**
- Use this as your `REDIS_URL`

#### 7. Deploy
- Click **"Create Web Service"**
- Render automatically deploys your code
- Monitor the deployment in **"Logs"** tab
- Once deployed, you'll get a URL like: `https://bhima-astra-backend.onrender.com`

#### 8. Test Backend
```bash
curl https://bhima-astra-backend.onrender.com/docs
```

---

## 🌐 Part 3: Deploy Frontend to Vercel

### Frontend Deployment Structure
Your project has multiple frontend apps:
- **Manager Dashboard** (primary) → Deploy this
- **Worker Dashboard** 
- **Admin Panel**
- **Landing Page**

### Prerequisites
- Vercel account (https://vercel.com)
- Node.js 18+ installed locally

### Step-by-Step Instructions

#### 1. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub for easier deployment

#### 2. Deploy Manager Dashboard

**Option A: Automatic GitHub Integration (Recommended)**
- In Vercel, click **"Add New"** → **"Project"**
- Select your GitHub repository
- **Project Name:** `bhima-astra-manager`
- **Root Directory:** `bhima_astra_frontend/manager`
- **Framework:** `Other` (or Vite)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Option B: Deploy Other Apps**
Repeat the same process for:
- **Worker Dashboard**
  - Root Directory: `bhima_astra_frontend/worker`
  - Project Name: `bhima-astra-worker`
- **Admin Panel**
  - Root Directory: `bhima_astra_frontend/admin`
  - Project Name: `bhima-astra-admin`

#### 3. Add Environment Variables (Vercel)
For each frontend deployment, add:
```
VITE_API_URL=https://bhima-astra-backend.onrender.com
```

Update `vite.config.ts` or `.env` files to use this variable.

#### 4. Deploy
- Click **"Deploy"**
- Vercel builds and deploys automatically
- Your app URL: `https://bhima-astra-manager.vercel.app`

#### 5. Continuous Deployment
Every push to `main` branch automatically triggers deployment on both Render and Vercel.

---

## ✅ Post-Deployment Checklist

### Backend Checks
- [ ] Database tables created (run migrations if needed)
- [ ] Redis connection working
- [ ] API responding at `/docs` endpoint
- [ ] WebSocket connections functional
- [ ] Celery workers running (if needed)
- [ ] CORS properly configured for frontend URL

### Frontend Checks
- [ ] All routes loading correctly
- [ ] API calls connecting to backend
- [ ] WebSocket connections to backend working
- [ ] Maps rendering correctly
- [ ] Real-time updates functioning
- [ ] No console errors

### Environment Variables Check
```bash
# Verify on Render backend
curl https://bhima-astra-backend.onrender.com/health
# Should return 200 OK
```

---

## 🔧 Troubleshooting

### Backend Won't Start on Render
1. Check **Logs** tab in Render dashboard
2. Verify all environment variables are set
3. Ensure `app.main:app` exists
4. Check `requirements.txt` has all dependencies

### Frontend Not Connecting to Backend
1. Verify `VITE_API_URL` environment variable
2. Check CORS settings in backend `main.py`
3. Ensure backend URL is correct (use HTTPS)

### Database Connection Issues
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
2. Check database is running on Render
3. Test connection locally if possible

### Redis Connection Failed
1. Verify `REDIS_URL` is correct
2. Check Redis instance is running on Render
3. Format should be: `redis://:password@host:port`

---

## 📝 Important Notes

### API Keys Security
⚠️ **Never commit API keys to GitHub!**
- `.gitignore` already protects sensitive files
- Use Render's environment variables for production keys
- Never share `.env` files

### Database Migrations
If using Alembic for database migrations on Render:
1. Add pre-deployment command: `alembic upgrade head`
2. Or run manually via Render shell

### File Limits
- Render free tier: Limited build time
- Vercel free tier: Good for frontend
- ML model files should be under 100MB for deployment

### Monitoring
- **Render:** View logs in dashboard
- **Vercel:** View logs in Deployments tab
- Set up error tracking (e.g., Sentry)

---

## 🔄 Deployment Workflow

After initial setup, use this workflow:

```bash
# 1. Make changes locally
git add .
git commit -m "Feature: Your feature description"

# 2. Push to GitHub
git push origin main

# 3. Deployments trigger automatically
# - Render backend redeploys
# - Vercel frontend redeploys

# 4. Monitor deployments
# - Render Dashboard → Logs tab
# - Vercel Dashboard → Deployments tab
```

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/
- React/Vite Deployment: https://vitejs.dev/guide/static-deploy.html

---

**Your project is now production-ready! 🎉**
