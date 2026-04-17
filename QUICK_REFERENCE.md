# ⚡ Quick Reference - GitHub & Deployment Commands

## 🐙 Push to GitHub - Quick Commands

```bash
# Navigate to project root
cd /Users/laxmivarshitha/Documents/Hackathons/GuideWireDevTrails/bhima_astra1

# Initialize git (first time only)
git init
git add .
git commit -m "Initial commit: Bhima Astra project setup"

# Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main

# Verify it worked
echo "✓ Check: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME"
```

---

## 🎯 Deploy to Render - Step Summary

### 1. Create PostgreSQL Database
```
Render Dashboard → New + → PostgreSQL
- Name: bhima-astra-db
- Region: Pick closest to you
→ Copy "Internal Database URL"
```

### 2. Create Redis Cache
```
Render Dashboard → New + → Redis
- Name: bhima-astra-redis
- Region: Same as PostgreSQL
→ Copy "Internal Redis URL"
```

### 3. Deploy Backend Web Service
```
Render Dashboard → New + → Web Service
- GitHub Repo: YOUR_USERNAME/YOUR_REPO_NAME
- Service Name: bhima-astra-backend
- Branch: main
- Runtime: Python 3.10
- Build Command: pip install -r bhima_astra_backend/requirements.txt
- Start Command: cd bhima_astra_backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Root Directory: (leave blank)
- Plan: Free
→ Click "Create Web Service"
```

### 4. Add Environment Variables to Backend
```
Render Dashboard → bhima-astra-backend service → Environment

Add these (replace with your actual values):
DATABASE_URL=postgresql://user:pass@render-db-url:5432/dbname
REDIS_URL=redis://:password@render-redis-url:6379
ANTHROPIC_API_KEY=sk-ant-your-key
SECRET_KEY=your-secret-key-32-characters-min
ENVIRONMENT=production
```

### 5. Test Backend
```bash
curl https://bhima-astra-backend.onrender.com/docs
# Should see FastAPI Swagger docs
```

---

## 🚀 Deploy to Vercel - Step Summary

### 1. Deploy Manager Dashboard
```
Vercel Dashboard → Add New → Project
- GitHub Repo: YOUR_USERNAME/YOUR_REPO_NAME
- Project Name: bhima-astra-manager
- Framework: Other
- Root Directory: bhima_astra_frontend/manager
- Build Command: npm run build
- Output Directory: dist
→ Click "Deploy"
```

### 2. Add Environment Variables
```
Vercel Dashboard → bhima-astra-manager → Settings → Environment Variables

VITE_API_URL=https://bhima-astra-backend.onrender.com
```

### 3. (Optional) Deploy Other Frontends
Repeat step 1 for:
- **Worker**: root = `bhima_astra_frontend/worker`
- **Admin**: root = `bhima_astra_frontend/admin`

---

## ✅ Verification URLs

After deployment, test these:

```bash
# Backend API (Render)
https://bhima-astra-backend.onrender.com/docs

# Frontend Manager (Vercel)
https://bhima-astra-manager.vercel.app

# Frontend Worker (if deployed)
https://bhima-astra-worker.vercel.app

# Frontend Admin (if deployed)
https://bhima-astra-admin.vercel.app
```

---

## 🔄 Push Updates After Deployment

```bash
# Make changes locally
git add .
git commit -m "Feature: Description of changes"
git push origin main

# ✓ Automatic redeploy triggers on:
# - Render backend
# - All Vercel frontends
```

---

## 📝 Important Reminders

✅ **Already Done:**
- `.gitignore` created - protects sensitive files
- `render.json` created - configures Render deployment
- `DEPLOYMENT_GUIDE.md` created - full instructions
- `ENV_SETUP.md` created - environment variables reference

⚠️ **Before Pushing:**
- Check `.env` files are NOT committed (they're ignored)
- Verify no API keys in code
- Test locally first

⚠️ **Before Deploying:**
- Have all API keys ready
- Create PostgreSQL and Redis on Render
- Set all environment variables

🚀 **Automatic After GitHub Push:**
- Render redeploys backend
- Vercel redeploys frontends
- Check deployment logs if issues

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Render Logs tab - most errors there |
| Frontend not connecting to backend | Verify VITE_API_URL environment variable is correct |
| Database connection failed | Ensure DATABASE_URL is correct format |
| Build takes too long | Frontend might have issues, check Vercel build logs |
| API keys leaking | They're already in .gitignore, you're safe |

---

## 📞 Dashboard Links

- **Render**: https://dashboard.render.com/
- **Vercel**: https://vercel.com/dashboard
- **GitHub**: https://github.com/YOUR_USERNAME

---

**You're ready to go! Deploy with confidence! 🎉**
