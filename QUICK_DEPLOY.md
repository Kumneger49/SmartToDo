# ⚡ Quick Deploy Guide

## TL;DR - Deploy in 3 Steps

### 1️⃣ Deploy Backend (Render)

```bash
# Go to render.com → New + → Web Service
# Set these environment variables:
MONGODB_URI=mongodb+srv://kumneger496235_db_user:****@smarttodo.a4vchmb.mongodb.net/barakaflow?retryWrites=true&w=majority
JWT_SECRET=naffBnJaHoTTUo/z1emQQ38XVINK5Knj28Jniz1WufY=
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Root Directory:** `server` ⚠️ **IMPORTANT**  
**Build:** `npm install && npm run build`  
**Start:** `npm start`

📖 **See `DEPLOY_TO_RENDER.md` for detailed steps**

### 2️⃣ Deploy Frontend (Vercel)

```bash
# Go to vercel.com → Add Project → Import from GitHub
# Set these environment variables:
VITE_API_URL=https://your-backend.onrender.com/api
VITE_OPENAI_API_KEY=your-openai-key
```

**Framework:** Vite  
**Build:** `npm run build`  
**Output:** `dist`

### 3️⃣ Update CORS

Go back to Render → Update `CORS_ORIGIN` = your Vercel URL

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
