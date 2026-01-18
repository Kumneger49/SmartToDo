# BarakaFlow Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed
- [x] MongoDB Atlas connection configured
- [x] Backend API working
- [x] Frontend-backend integration complete
- [x] Authentication system implemented

### 🔧 Before Deployment

#### 1. **Security & Environment Variables**

**Backend (.env for production):**
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=generate-a-strong-random-secret-here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Frontend (.env for production):**
```env
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_OPENAI_API_KEY=your-openai-api-key
```

**⚠️ Important:**
- Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- Never commit `.env` files to Git
- Set environment variables in your deployment platform

#### 2. **Build Configuration**

**Frontend:**
- ✅ Build script exists: `npm run build`
- ✅ Output directory: `dist/`

**Backend:**
- ✅ Build script exists: `npm run build`
- ✅ Start script exists: `npm start`
- ✅ Output directory: `dist/`

#### 3. **CORS Configuration**
- Update backend CORS to allow your production frontend domain
- Remove `localhost` from allowed origins in production

#### 4. **Error Handling**
- ✅ Already implemented in `api.ts`
- Consider adding error tracking (Sentry, etc.) for production

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) ⭐ Recommended

#### **Frontend on Vercel:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `VITE_API_URL` = Your backend URL
   - `VITE_OPENAI_API_KEY` = Your OpenAI API key

4. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### **Backend on Railway:**

1. **Go to:** https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Select your repository** → Choose `server` folder
4. **Set Environment Variables:**
   - `PORT` = 3000 (Railway sets this automatically)
   - `NODE_ENV` = production
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Your strong secret
   - `CORS_ORIGIN` = Your Vercel frontend URL

5. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `server`

6. **Get your Railway backend URL** (e.g., `https://barakaflow-backend.railway.app`)

7. **Update Vercel environment variable:**
   - Set `VITE_API_URL` = `https://barakaflow-backend.railway.app/api`

---

### Option 2: Vercel (Frontend) + Render (Backend)

#### **Backend on Render:**

1. **Go to:** https://render.com
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Name: `barakaflow-backend`
   - Environment: `Node`
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Root Directory: `server`

5. **Set Environment Variables** (same as Railway)

6. **Get your Render URL** and update Vercel's `VITE_API_URL`

---

### Option 3: Netlify (Frontend) + Any Backend Host

#### **Frontend on Netlify:**

1. **Go to:** https://netlify.com
2. **Deploy from GitHub**
3. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables:**
   - `VITE_API_URL`
   - `VITE_OPENAI_API_KEY`

---

## Post-Deployment Steps

### 1. **Test Production Build Locally**

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd server
npm run build
npm start
```

### 2. **Verify Environment Variables**
- Check that all variables are set correctly
- Test API endpoints
- Verify CORS is working

### 3. **Update MongoDB Atlas Network Access**
- Add your production backend IP to whitelist
- Or keep `0.0.0.0/0` for development (not recommended for production)

### 4. **Test Authentication Flow**
- Sign up a new user
- Log in
- Create/edit/delete tasks
- Test AI features

### 5. **Monitor Logs**
- Check backend logs for errors
- Monitor API response times
- Watch for database connection issues

---

## Production Optimizations (Optional)

### 1. **Add Error Tracking**
- Consider Sentry or similar for error monitoring

### 2. **Add Analytics**
- Google Analytics or similar

### 3. **Performance**
- Enable compression on backend
- Optimize images (if any)
- Enable caching headers

### 4. **Security Headers**
- Add security headers (CSP, HSTS, etc.)

### 5. **Database Indexes**
- Ensure MongoDB indexes are optimized

---

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly
- Verify backend CORS allows your frontend domain
- Check backend is running and accessible

### Authentication not working
- Verify `JWT_SECRET` is set in backend
- Check token expiration settings
- Verify cookies/localStorage work in production

### MongoDB connection fails
- Check MongoDB Atlas network access
- Verify connection string is correct
- Check if cluster is paused (free tier)

### Build fails
- Check Node.js version matches deployment platform
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build`

---

## Quick Deploy Commands

### Frontend (Vercel):
```bash
npm i -g vercel
vercel --prod
```

### Backend (Railway):
```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## Recommended Deployment Flow

1. ✅ **Deploy Backend First**
   - Get backend URL
   - Test backend endpoints

2. ✅ **Deploy Frontend**
   - Set `VITE_API_URL` to backend URL
   - Test full flow

3. ✅ **Update CORS**
   - Add frontend URL to backend CORS

4. ✅ **Final Testing**
   - Test all features
   - Check mobile responsiveness
   - Verify error handling

---

## Cost Estimates

- **Vercel (Frontend):** Free tier (generous)
- **Railway (Backend):** $5/month (or free trial)
- **Render (Backend):** Free tier available
- **MongoDB Atlas:** Free tier (512MB)
- **OpenAI API:** Pay-as-you-go

**Total:** ~$5/month or free (depending on usage)

---

## Need Help?

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test locally with production build
4. Check CORS and network settings

Good luck with deployment! 🚀
