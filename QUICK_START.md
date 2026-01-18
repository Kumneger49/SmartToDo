# Quick Start Guide - Fixing "Failed to fetch" Error

## The Problem
You're seeing "Failed to fetch" because **MongoDB is not running**. The backend server is running, but it can't connect to the database.

## Solution: Set Up MongoDB

### Option 1: MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Sign up** for a free account
3. **Create a free cluster** (takes 3-5 minutes)
4. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/barakaflow`)
5. **Update server/.env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barakaflow
   ```
   (Replace `username` and `password` with your actual credentials)

6. **Restart the backend server**:
   ```bash
   cd server
   npm run dev
   ```

### Option 2: Local MongoDB

**On macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**On Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**On Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Verify Everything is Working

1. **Check backend is running**: Open http://localhost:3000/api/health
   - Should show: `{"status":"ok","message":"BarakaFlow API is running"}`

2. **Check MongoDB connection**: Look at the backend terminal
   - Should see: `✅ MongoDB connected successfully`

3. **Try signing up again** in the frontend
   - Should work now!

## Current Status

✅ Backend server: Running on port 3000  
✅ Frontend: Connected to backend  
❌ MongoDB: Not connected (this is the issue!)

Once MongoDB is connected, signup/login will work perfectly!
