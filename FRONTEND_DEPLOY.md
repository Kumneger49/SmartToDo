# 🚀 Deploy Frontend to Vercel

## Quick Steps

### 1. Go to Vercel

1. Visit https://vercel.com
2. Sign up or log in (use GitHub for easy integration)

### 2. Create New Project

1. Click **"Add New Project"** or **"New Project"**
2. Import your GitHub repository: `Kumneger49/SmartToDo`
3. Click **"Import"**

### 3. Configure Project

**Framework Preset:**
- Select **"Vite"** (or it may auto-detect)

**Root Directory:**
- Leave as `.` (root directory)

**Build and Output Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (default)

### 4. Set Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://smarttodo-1-in05.onrender.com/api
```

```
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

⚠️ **Important:** Replace `your-openai-api-key-here` with your actual OpenAI API key from your `.env` file.

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

### 6. Update Backend CORS

After frontend is deployed:

1. Go to Render dashboard
2. Click on your backend service (`smarttodo-1-in05`)
3. Go to **Environment** tab
4. Find `CORS_ORIGIN` variable
5. Update it to your Vercel URL:
   - Example: `https://barakaflow.vercel.app`
   - Or whatever Vercel assigns you
6. Render will automatically redeploy

### 7. Test Everything

1. Visit your Vercel frontend URL
2. Try to sign up
3. Create a task
4. Test AI features
5. Everything should work! 🎉

---

## Your URLs

**Backend:**
- Health: https://smarttodo-1-in05.onrender.com/api/health
- API Base: https://smarttodo-1-in05.onrender.com/api

**Frontend:**
- Will be: `https://your-app-name.vercel.app` (after deployment)

---

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Vercel
- Verify backend is running (check Render dashboard)
- Test backend health endpoint manually

### CORS errors
- Make sure `CORS_ORIGIN` in Render matches your Vercel URL exactly
- Include `https://` protocol
- No trailing slash

### Build fails
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Make sure TypeScript compiles: `npm run build`

---

**Ready to deploy! 🚀**
