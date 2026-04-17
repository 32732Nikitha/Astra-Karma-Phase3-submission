# BHIMA ASTRA - Render Deployment Guide

## 6-Step Deployment to Render.com

### Step 1: Prepare Your Git Repository

```bash
# Navigate to project root
cd /Users/laxmivarshitha/Documents/Hackathons/GuideWireDevTrails/bhima_astra1

# Ensure all files are committed
git add .
git commit -m "Deployment: Add config, start.sh, and .env.example"

# Push to GitHub
git push origin main
```

**Verify:**
- Repository pushed to GitHub
- start.sh is executable
- .env.example exists in backend/

---

### Step 2: Create Neon Database (PostgreSQL)

1. Go to **https://neon.tech**
2. Click **Sign up** → Create free account
3. Click **Create a project**
4. Fill in:
   - **Project Name:** bhima-astra
   - **Region:** Choose closest to you
   - **Database Name:** bhima (default)
5. Click **Create project**
6. You'll see a connection string:
   ```
   postgresql://neondb_owner:password@host.neon.tech/bhima
   ```
7. **Copy this string** → Save in notes (you'll need it in Step 5)

**Connection String Format:**
```
postgresql://username:password@host.neon.tech/database_name
```

---

### Step 3: Create Redis (Upstash)

1. Go to **https://upstash.com**
2. Click **Sign up** → Create free account
3. Click **Create Database**
4. Fill in:
   - **Name:** bhima-redis
   - **Region:** Choose same region as Neon (or closest)
   - **Type:** Redis
5. Click **Create**
6. Copy the **Redis connection URL**:
   ```
   redis://:password@host:port
   ```
7. **Copy this URL** → Save in notes (you'll need it in Step 5)

**Connection URL Format:**
```
redis://:password@host:port
```

---

### Step 4: Create Web Service on Render

1. Go to **https://render.com**
2. Click **Sign up** → Create free account
3. Click **Dashboard**
4. Click **New +** → Select **Web Service**
5. Click **Connect your GitHub account** (if not already connected)
6. Select your repository: `YOUR_USERNAME/bhima_astra1`
7. Fill in the service details:

| Field | Value |
|-------|-------|
| **Name** | bhima-astra-api |
| **Region** | Choose closest to you |
| **Branch** | main |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `bash start.sh` |
| **Instance Type** | Free |

8. Click **Advanced** and scroll down to **Environment**

---

### Step 5: Add Environment Variables

In Render Dashboard, under the Web Service **Environment** tab, add these variables:

| Key | Value | Source |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://user:password@host.neon.tech/bhima` | From Step 2 |
| `REDIS_URL` | `redis://:password@host:port` | From Step 3 |
| `SECRET_KEY` | (see below) | Generate new |
| `ALGORITHM` | `HS256` | Keep as-is |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Keep as-is |
| `ALLOWED_ORIGINS` | `https://your-app.onrender.com` | Will update later |
| `ENVIRONMENT` | `production` | Keep as-is |

**Generate SECRET_KEY:**

Run this in your terminal:
```bash
openssl rand -hex 32
```

Copy the output and paste it as `SECRET_KEY` value.

**Example:**
```
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

---

### Step 6: Deploy

1. In Render Dashboard, click **Create Web Service**
2. Wait for build to complete (3-5 minutes)
3. Check the **Logs** tab to ensure all services started:

```
✅ Migrations complete
✅ Celery worker started (PID: xxx)
✅ Celery Beat started (PID: xxx)
✅ FastAPI server running on http://0.0.0.0:10000
```

4. Once deployed, you'll get a URL like:
   ```
   https://bhima-astra-api.onrender.com
   ```

5. Update `ALLOWED_ORIGINS` with your new URL:
   - Go to **Environment**
   - Change `ALLOWED_ORIGINS` to:
     ```
     https://bhima-astra-api.onrender.com
     ```
   - Click **Save**

6. Visit your API:
   ```
   https://bhima-astra-api.onrender.com/docs
   ```

---

## Verification Checklist

- [ ] Git repository pushed to GitHub
- [ ] Neon database created and connection string copied
- [ ] Upstash Redis created and connection URL copied
- [ ] Render Web Service created
- [ ] All 7 environment variables added
- [ ] Start command set to `bash start.sh`
- [ ] Build completed successfully
- [ ] All 4 startup logs appear ✅
- [ ] API accessible at `/docs`
- [ ] `ALLOWED_ORIGINS` updated with deployment URL

---

## Troubleshooting

### Build Fails: "No module named 'app'"

**Solution:** Ensure your build command is:
```
pip install -r requirements.txt
```

And start command is from `bhima_astra_backend/` directory.

### "Connection refused" error

**Causes:**
1. DATABASE_URL or REDIS_URL is incorrect
2. Neon/Upstash databases not created
3. Environment variables not saved

**Fix:** Re-check all URLs, click **Save** in Environment tab, then redeploy.

### Celery worker not starting

**Check:** Look for error in **Logs** tab:
```
celery -A app.core.celery_app worker
```

If error mentions imports, ensure `requirements.txt` includes:
- celery==5.4.0
- redis==5.0.8

### API returning 500 errors

**Check:**
1. Database migrations ran: Look for "✅ Migrations complete"
2. All environment variables set (no blank values)
3. PostgreSQL connection string includes `/database_name`

---

## Post-Deployment

Once deployed, you can:

1. **View Live Logs:**
   ```
   Render Dashboard → Web Service → Logs
   ```

2. **Redeploy (after code changes):**
   ```bash
   git push origin main  # Render auto-redeploys
   ```

3. **Scale Up (from Free to Paid):**
   - Render Dashboard → Instance Type → Select paid tier
   - Increased concurrency and higher uptime SLA

4. **Monitor Health:**
   ```
   https://bhima-astra-api.onrender.com/health
   ```

---

## Environment Variables Summary

```bash
# Database
DATABASE_URL=postgresql://neon_owner:password@host.neon.tech/bhima

# Cache
REDIS_URL=redis://:password@host:port

# Security
SECRET_KEY=random-32-char-hex-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=https://bhima-astra-api.onrender.com

# Deployment
ENVIRONMENT=production
```

---

**Status:** Ready for Render Deployment
**Last Updated:** April 17, 2026
