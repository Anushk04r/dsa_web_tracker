# 🚀 Deployment Guide - Quick & Simple

This guide provides the **easiest and fastest** way to deploy your DSA Tracker project to production.

## 📋 Deployment Overview

We'll deploy each service to the best platform:

- **Frontend (Next.js)** → **Vercel** (free, automatic deployments)
- **Backend (Express)** → **Railway** or **Render** (free tier available)
- **Chatbot Service (Python)** → **Railway** or **Render** (free tier available)
- **Database (MongoDB)** → **MongoDB Atlas** (already using)

---

## 🎯 Option 1: Quick Deployment (Recommended)

### Frontend → Vercel | Backend & Chatbot → Railway

This is the **fastest and easiest** option. Railway can host both backend services.

---

## 📦 Step-by-Step Deployment

### Prerequisites

- ✅ GitHub account
- ✅ GitHub repository with your code
- ✅ MongoDB Atlas account (you already have this)

---

## 1️⃣ Deploy Frontend to Vercel (5 minutes)

### Steps:

1. **Push your code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Set **Root Directory** to `frontend`
   - Framework Preset: **Next.js**

4. **Configure Environment Variables**
   
   Click "Environment Variables" and add:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret-here
   BACKEND_URL=https://your-backend.railway.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend is live! ✨

**Note:** You'll get the frontend URL after deployment (e.g., `https://dsa-tracker.vercel.app`)

---

## 2️⃣ Deploy Backend to Railway (5 minutes)

### Steps:

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend Service**
   - After importing, click "Add Service"
   - Select your repository
   - Railway will detect it's a Node.js project
   - **Important:** Set **Root Directory** to `backend`

4. **Set Environment Variables**

   Click on your service → Variables tab → Add:

   ```
   PORT=4000
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-jwt-secret-here
   FRONTEND_URL=https://your-frontend.vercel.app
   CHATBOT_URL=https://your-chatbot.railway.app/chat
   ```

   **Use your actual MongoDB Atlas connection string from `backend/.env`**

5. **Deploy**
   - Railway auto-deploys when you push to GitHub
   - Or click "Deploy" manually
   - Wait 2-3 minutes

6. **Get Backend URL**
   - Click on your service → Settings → Generate Domain
   - Copy the URL (e.g., `https://backend-production.up.railway.app`)
   - Update `FRONTEND_URL` in Railway variables with this URL

---

## 3️⃣ Deploy Chatbot Service to Railway (5 minutes)

### Steps:

1. **Add Another Service**
   - In the same Railway project, click "Add Service"
   - Select your repository again
   - Set **Root Directory** to `chatbot-service`

2. **Configure for Python**
   - Railway will detect Python
   - It will automatically run: `pip install -r requirements.txt`

3. **Set Start Command**
   - Go to Settings → Start Command
   - Enter: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Railway sets `$PORT` automatically

4. **Set Environment Variables**

   ```
   GROQ_API_KEY=your-groq-api-key-here
   GROQ_MODEL=mixtral-8x7b-32768
   PORT=8000
   ```

5. **Generate Domain**
   - Settings → Generate Domain
   - Copy the URL (e.g., `https://chatbot-production.up.railway.app`)

6. **Update Backend Environment Variable**
   - Go back to your Backend service → Variables
   - Update `CHATBOT_URL` to: `https://your-chatbot.railway.app/chat`

---

## 4️⃣ Update All Environment Variables

After getting all URLs, update environment variables:

### Frontend (Vercel) - Update:
```
NEXTAUTH_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

### Backend (Railway) - Update:
```
FRONTEND_URL=https://your-frontend.vercel.app
CHATBOT_URL=https://your-chatbot.railway.app/chat
```

---

## 🔧 Alternative: Deploy to Render (Free Tier)

If you prefer Render over Railway:

### Backend on Render:

1. **Go to Render**: https://render.com
2. **Sign up with GitHub**
3. **New Web Service** → Connect GitHub repo
4. **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run dev` (or `npm start` for production)
   - **Environment:** Node
   - **Port:** 4000 (or set from env)

5. **Add Environment Variables** (same as Railway)

### Chatbot Service on Render:

1. **New Web Service** → Same repo
2. **Settings:**
   - **Root Directory:** `chatbot-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3

3. **Add Environment Variables**

Render gives free HTTPS URLs like: `https://your-app.onrender.com`

---

## 🌐 MongoDB Atlas Configuration

### Important: Allow Network Access

1. **Go to MongoDB Atlas Dashboard**
2. **Network Access** → **Add IP Address**
3. **Add:** `0.0.0.0/0` (allows all IPs - for development/production)
   - Or add specific IPs of Railway/Render servers

### Get Connection String:

1. **Atlas Dashboard** → **Database** → **Connect**
2. **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add query parameters: `?retryWrites=true&w=majority`

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Chatbot service deployed to Railway/Render
- [ ] All environment variables set correctly
- [ ] MongoDB Atlas allows network access
- [ ] Test frontend URL in browser
- [ ] Test backend: `GET https://your-backend.railway.app/health`
- [ ] Test chatbot: `GET https://your-chatbot.railway.app/health`
- [ ] Try registering a new user
- [ ] Try logging in
- [ ] Test chatbot functionality

---

## 🐛 Common Deployment Issues & Fixes

### Issue 1: Backend can't connect to MongoDB

**Solution:**
- ✅ Check `MONGO_URI` in Railway/Render environment variables
- ✅ Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- ✅ Ensure connection string includes `?retryWrites=true&w=majority`

### Issue 2: Frontend can't reach backend

**Solution:**
- ✅ Check `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables
- ✅ Verify backend URL is correct (with `https://`)
- ✅ Check backend CORS settings allow your frontend URL

### Issue 3: Chatbot service not responding

**Solution:**
- ✅ Verify `CHATBOT_URL` in backend environment variables
- ✅ Check chatbot service is running (test `/health` endpoint)
- ✅ Verify `GROQ_API_KEY` is set in chatbot service

### Issue 4: Build errors on Vercel

**Solution:**
- ✅ Ensure **Root Directory** is set to `frontend`
- ✅ Check `package.json` exists in frontend folder
- ✅ Review build logs in Vercel dashboard

### Issue 5: Port binding errors

**Solution:**
- ✅ Railway/Render automatically sets `PORT` - use `process.env.PORT` in your code
- ✅ For chatbot: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- ✅ Backend should use `process.env.PORT || 4000`

---

## 📝 Production Checklist

### Before Going Live:

1. **Security:**
   - ✅ Use strong, unique secrets for `JWT_SECRET` and `NEXTAUTH_SECRET`
   - ✅ MongoDB Atlas database user has read/write permissions only
   - ✅ Review MongoDB Atlas IP whitelist

2. **Performance:**
   - ✅ Enable caching where possible
   - ✅ Monitor API response times
   - ✅ Set up error logging (Sentry, LogRocket, etc.)

3. **Monitoring:**
   - ✅ Set up uptime monitoring (UptimeRobot, etc.)
   - ✅ Monitor Railway/Render usage (free tier limits)
   - ✅ Check Vercel bandwidth limits

---

## 🎯 Quick Commands Reference

### Local Testing Before Deployment:

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd frontend
npm run dev

# Test chatbot locally
cd chatbot-service
python -m uvicorn main:app --reload --port 8000
```

### After Deployment - Test URLs:

```bash
# Test backend health
curl https://your-backend.railway.app/health

# Test chatbot health
curl https://your-chatbot.railway.app/health

# Frontend should be accessible in browser
https://your-frontend.vercel.app
```

---

## 💰 Cost Overview (Free Tier)

- **Vercel**: Free (generous limits for personal projects)
- **Railway**: $5/month free credit (enough for small projects)
- **Render**: Free tier (spins down after inactivity, slower)
- **MongoDB Atlas**: Free M0 cluster (512MB storage)

**Total Cost: $0 - $5/month** (depending on traffic)

---

## 🔄 Continuous Deployment

All platforms support **automatic deployments**:

- **Vercel**: Auto-deploys on push to `main` branch
- **Railway**: Auto-deploys on push to `main` branch
- **Render**: Auto-deploys on push to `main` branch

Just push to GitHub and your changes deploy automatically! 🚀

---

## 📞 Support

If you encounter issues:

1. Check deployment logs in each platform's dashboard
2. Verify all environment variables are set
3. Test each service individually using health check endpoints
4. Review the **Common Issues** section above

---

## 🎉 You're Done!

After following these steps, your DSA Tracker will be live and accessible from anywhere!

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- Chatbot: `https://your-chatbot.railway.app`

Happy deploying! 🚀
