# Environment Variables Setup Guide

## 🔐 Required Environment Variables

### Backend (.env file for local development)
Create a `.env` file in `bhima_astra_backend/` directory with these variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bhima_astra_db

# Redis
REDIS_URL=redis://localhost:6379/0

# API Keys


# Anthropic/Claude
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Application
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO

# CORS
FRONTEND_URL=http://localhost:5173

# Optional: Razorpay (if using payments)
RAZORPAY_API_KEY=your_razorpay_api_key
RAZORPAY_API_SECRET=your_razorpay_api_secret
```

### Frontend (.env.local for each frontend app)
Create `.env.local` in each frontend directory:

**For `bhima_astra_frontend/manager/.env.local`:**
```env
VITE_API_URL=http://localhost:8000
```

**For `bhima_astra_frontend/worker/.env.local`:**
```env
VITE_API_URL=http://localhost:8000
```

**For `bhima_astra_frontend/admin/.env.local`:**
```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Production Environment Variables (Render)

Set these in **Render Dashboard** → **Environment** tab:

```
DATABASE_URL=postgresql://user:pass@your-render-db:5432/dbname
REDIS_URL=redis://:password@your-render-redis:6379
SECRET_KEY=your-production-secret-key-32-chars-min
ALGORITHM=HS256
ANTHROPIC_API_KEY=sk-ant-your-key
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO

```

---

## 🌐 Production Environment Variables (Vercel)

Set these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```
VITE_API_URL=https://bhima-astra-backend.onrender.com
```

---

## 📍 How to Get API Keys

### 1. Anthropic API Key
- Go to https://console.anthropic.com/
- Sign up or log in
- Create a new API key
- Copy and paste as `ANTHROPIC_API_KEY`

### 2. WAQI (World Air Quality Index) Token
Already provided: `c7bc7d0773524e87852502cd64f33d75137c5348`
(From your api_keys.txt file)

### 3. OpenWeatherMap API Key
Already provided: `0365663a887ee3b143714946e53526e0`
(From your api_keys.txt file)

### 4. Razorpay Keys (if using payments)
- Go to https://dashboard.razorpay.com/
- Navigate to Settings → API Keys
- Copy Key ID and Key Secret

---

## 🗄️ Database Setup

### Local PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb bhima_astra_db

# Create user
psql -U postgres -c "CREATE USER bhima_user WITH PASSWORD 'your_password';"
psql -U postgres -c "ALTER USER bhima_user CREATEDB;"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bhima_astra_db TO bhima_user;"
```

Update `.env`:
```
DATABASE_URL=postgresql://bhima_user:your_password@localhost:5432/bhima_astra_db
```

### Render PostgreSQL
- Render creates it automatically
- Copy the **Internal Database URL** to `DATABASE_URL`
- Format: `postgresql://user:password@host.onrender.com:5432/dbname`

---

## 💾 Redis Setup

### Local Redis
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

Update `.env`:
```
REDIS_URL=redis://localhost:6379/0
```

### Render Redis
- Render creates it automatically
- Copy the **Internal Redis URL** to `REDIS_URL`
- Format: `redis://:password@host.onrender.com:6379`

---

## ✅ Verification Checklist

Before deployment, verify locally:

```bash
# Check all imports work
python -c "from app.main import app; print('✓ FastAPI app imports successfully')"

# Test database connection
python -c "from app.db.database import SessionLocal; db = SessionLocal(); print('✓ Database connection successful'); db.close()"

# Test Redis connection
python -c "import redis; r = redis.from_url('redis://localhost:6379/0'); print(r.ping()); print('✓ Redis connection successful')"
```

---

## 🚨 Security Best Practices

1. **Never commit `.env` files** - Already ignored by .gitignore
2. **Use strong SECRET_KEY** - Min 32 characters, random
3. **Rotate API keys regularly** - In production
4. **Use HTTPS everywhere** - Render and Vercel use HTTPS by default
5. **Keep dependencies updated** - Regular security patches
6. **Monitor logs** - Check Render and Vercel dashboards regularly

---

## 🔄 Updating Environment Variables

### Locally
1. Edit `.env` file
2. Restart your dev server (`uvicorn` or `npm run dev`)

### Production (Render)
1. Go to Render Dashboard
2. Select your service
3. Go to **Environment** tab
4. Edit or add variables
5. Click **Save** - automatic redeploy starts
6. Check **Logs** tab for deployment status

### Production (Vercel)
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Edit variables
5. Automatic redeploy starts
6. Check **Deployments** tab

---

**Keep your environment variables secure and up to date! 🔒**
