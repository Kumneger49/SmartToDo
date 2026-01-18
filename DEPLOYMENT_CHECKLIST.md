# 🚀 BarakaFlow Deployment Checklist

## Pre-Deployment Tasks

### 1. Environment Variables Setup

#### Backend (server/.env - DO NOT COMMIT)
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://kumneger496235_db_user:****@smarttodo.a4vchmb.mongodb.net/barakaflow?retryWrites=true&w=majority
JWT_SECRET=generate-strong-secret-here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

#### Frontend (.env - DO NOT COMMIT)
```env
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_OPENAI_API_KEY=your-openai-api-key
```

### 2. Security Checks ✅
- [x] `.env` files in `.gitignore` ✅
- [ ] Generate strong `JWT_SECRET` for production
- [ ] Update MongoDB Atlas network access (remove `0.0.0.0/0` if needed)
- [ ] Verify CORS allows only your production domains

### 3. Build & Test Locally

**Test Frontend Build:**
```bash
npm run build
npm run preview
# Should work without errors
```

**Test Backend Build:**
```bash
cd server
npm run build
npm start
# Should connect to MongoDB and start successfully
```

### 4. Code Quality
- [x] No console errors in browser
- [x] TypeScript compiles without errors
- [x] All features working locally

---

## Deployment Steps

### Step 1: Deploy Backend First

**Recommended: Railway.app**

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. **Configure:**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = (your MongoDB Atlas connection string)
   - `JWT_SECRET` = (generated secret)
   - `CORS_ORIGIN` = (will add after frontend deployment)
   - `PORT` = (Railway sets this automatically)
7. **Deploy** and wait for it to start
8. **Copy your Railway URL** (e.g., `https://barakaflow-backend.railway.app`)

**Alternative: Render.com**
- Similar process, but use "New Web Service"
- Build: `cd server && npm install && npm run build`
- Start: `cd server && npm start`

### Step 2: Deploy Frontend

**Recommended: Vercel**

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your repository
5. **Configure:**
   - Framework Preset: Vite
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variables:**
   - `VITE_API_URL` = `https://your-backend-url.railway.app/api`
   - `VITE_OPENAI_API_KEY` = (your OpenAI API key)
7. **Deploy**
8. **Copy your Vercel URL** (e.g., `https://barakaflow.vercel.app`)

### Step 3: Update Backend CORS

1. Go back to Railway/Render
2. Update `CORS_ORIGIN` environment variable:
   - Set to your Vercel frontend URL
   - Example: `https://barakaflow.vercel.app`
3. **Redeploy** backend (or it will auto-redeploy)

### Step 4: Update MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. For production, you can:
   - Add your backend server's IP (if static)
   - Or keep `0.0.0.0/0` for now (less secure but works)

---

## Post-Deployment Testing

### ✅ Test Checklist

- [ ] Frontend loads without errors
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Can create task
- [ ] Can edit task
- [ ] Can delete task
- [ ] AI suggestions work
- [ ] Day optimization works
- [ ] Updates/comments work
- [ ] Recurring tasks work
- [ ] Search and filters work

### 🔍 Verify

1. **Check Browser Console:**
   - No errors
   - API calls successful

2. **Check Network Tab:**
   - All API requests return 200/201
   - No CORS errors

3. **Test on Mobile:**
   - Responsive design works
   - Touch interactions work

---

## Quick Reference

### Backend URLs
- Health Check: `https://your-backend.railway.app/api/health`
- Should return: `{"status":"ok","message":"BarakaFlow API is running"}`

### Frontend URLs
- Main App: `https://your-app.vercel.app`
- Should show login page

### Environment Variables Summary

**Backend:**
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Token signing secret
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV` - `production`

**Frontend:**
- `VITE_API_URL` - Backend API URL
- `VITE_OPENAI_API_KEY` - OpenAI API key

---

## Troubleshooting

### "Cannot connect to server"
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS settings

### "Database connection failed"
- Verify MongoDB Atlas network access
- Check `MONGODB_URI` is correct
- Ensure cluster is not paused

### "CORS error"
- Update `CORS_ORIGIN` in backend
- Include protocol (https://)
- No trailing slash

### Build fails
- Check Node.js version (should be 18+)
- Verify all dependencies installed
- Check for TypeScript errors

---

## Estimated Time: 30-45 minutes

1. Backend deployment: 10-15 min
2. Frontend deployment: 10-15 min
3. Configuration: 5-10 min
4. Testing: 10-15 min

---

## Cost Estimate

- **Vercel:** Free (generous limits)
- **Railway:** $5/month (or free trial)
- **MongoDB Atlas:** Free tier
- **OpenAI:** Pay-as-you-go

**Total:** ~$5/month or free

---

## Next Steps After Deployment

1. ✅ Share the app URL
2. ✅ Monitor error logs
3. ✅ Set up custom domain (optional)
4. ✅ Add analytics (optional)
5. ✅ Set up error tracking (optional)

**You're ready to deploy! 🎉**
