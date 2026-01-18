# ⚡ Quick Deploy Guide

## TL;DR - Deploy in 3 Steps

### 1️⃣ Deploy Backend (Railway)

```bash
# Go to railway.app → New Project → Deploy from GitHub
# Set these environment variables:
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=generate-with: openssl rand -base64 32
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Root Directory:** `server`  
**Build:** `npm install && npm run build`  
**Start:** `npm start`

### 2️⃣ Deploy Frontend (Vercel)

```bash
# Go to vercel.com → Add Project → Import from GitHub
# Set these environment variables:
VITE_API_URL=https://your-backend.railway.app/api
VITE_OPENAI_API_KEY=your-openai-key
```

**Framework:** Vite  
**Build:** `npm run build`  
**Output:** `dist`

### 3️⃣ Update CORS

Go back to Railway → Update `CORS_ORIGIN` = your Vercel URL

**Done! 🎉**

---

## Generate JWT Secret

```bash
openssl rand -base64 32
```

---

## Test Your Deployment

1. Visit your Vercel URL
2. Sign up → Should work!
3. Create a task → Should save!
4. Check AI features → Should work!

---

## Need Help?

See `DEPLOYMENT_CHECKLIST.md` for detailed instructions.
