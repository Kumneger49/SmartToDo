# 🚀 Deploy Backend to Render.com

## Step-by-Step Guide

### 1. Sign Up / Login to Render

1. Go to https://render.com
2. Sign up or log in (you can use GitHub to sign in)
3. Verify your email if needed

### 2. Create New Web Service

1. Click **"New +"** button in the top right
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your **SmartToDo repository**

### 3. Configure the Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `barakaflow-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `server` ⚠️ **IMPORTANT: Set this to `server`**
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Environment:**
- **Node Version:** `18` or `20` (Render will auto-detect)

### 4. Set Environment Variables

Click on **"Environment"** tab and add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kumneger496235_db_user:EON63IcQS2rE5XJC@smarttodo.a4vchmb.mongodb.net/barakaflow?retryWrites=true&w=majority&appName=smartToDo
JWT_SECRET=naffBnJaHoTTUo/z1emQQ38XVINK5Knj28Jniz1WufY=
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=10000
```

**⚠️ Important Notes:**
- `PORT` should be set to `10000` (Render uses this port, or you can use `$PORT` which Render sets automatically)
- `CORS_ORIGIN` - Leave this for now, we'll update it after deploying frontend
- `MONGODB_URI` - Your MongoDB Atlas connection string

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. You'll see build logs in real-time

### 6. Get Your Backend URL

Once deployed:
1. Your service will have a URL like: `https://barakaflow-backend.onrender.com`
2. **Copy this URL** - you'll need it for frontend deployment
3. Test the health endpoint: `https://your-service.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"BarakaFlow API is running"}`

### 7. Update CORS After Frontend Deployment

After you deploy the frontend:
1. Go back to Render dashboard
2. Click on your service → **Environment** tab
3. Update `CORS_ORIGIN` to your Vercel frontend URL
4. Render will auto-redeploy

---

## Render-Specific Notes

### Free Tier Limitations

- **Spins down after 15 minutes of inactivity** (takes ~30 seconds to wake up)
- **750 hours/month free** (enough for one service running 24/7)
- **Auto-deploys on git push** to your main branch

### Port Configuration

Render automatically sets the `PORT` environment variable. You can either:
- Use `process.env.PORT` in your code (already done ✅)
- Or explicitly set `PORT=10000` in environment variables

### Build & Deploy

- Render will automatically:
  - Install dependencies (`npm install`)
  - Build your app (`npm run build`)
  - Start your app (`npm start`)

### Custom Domain (Optional)

1. Go to your service → **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS records as instructed

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check that `Root Directory` is set to `server`
- Verify all dependencies are in `server/package.json`

**Error: "Build command failed"**
- Check build logs for specific errors
- Make sure TypeScript compiles: `cd server && npm run build`

### Service Won't Start

**Error: "Port already in use"**
- Make sure you're using `process.env.PORT || 3000` in your code
- Or set `PORT=10000` in environment variables

**Error: "MongoDB connection failed"**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access allows Render's IPs
- Render's IPs change, so you might need `0.0.0.0/0` in Atlas

### Service Spins Down

- This is normal on free tier
- First request after 15 min will take ~30 seconds
- Consider upgrading to paid plan for always-on service

---

## Quick Checklist

- [ ] Signed up for Render
- [ ] Created Web Service
- [ ] Set Root Directory to `server`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm start`
- [ ] Added all environment variables
- [ ] Deployment successful
- [ ] Health endpoint works: `/api/health`
- [ ] Copied backend URL for frontend deployment

---

## Next Steps

1. ✅ Backend deployed on Render
2. ⏭️ Deploy frontend on Vercel (see `DEPLOYMENT_CHECKLIST.md`)
3. ⏭️ Update `CORS_ORIGIN` in Render with Vercel URL
4. ⏭️ Update `VITE_API_URL` in Vercel with Render URL

**You're all set! 🎉**
