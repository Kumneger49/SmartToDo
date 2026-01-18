# MongoDB Atlas Setup - Fix Connection Issues

## The Problem
You're getting: `Operation users.findOne() buffering timed out after 10000ms`

This means MongoDB Atlas is blocking your connection because your IP address is not whitelisted.

## Solution: Whitelist Your IP in MongoDB Atlas

### Step 1: Go to Network Access
1. Log into MongoDB Atlas: https://cloud.mongodb.com
2. Click on your cluster
3. Go to **"Network Access"** in the left sidebar

### Step 2: Add IP Address
1. Click **"Add IP Address"** button
2. For development, you can:
   - **Option A (Recommended for testing)**: Click **"Allow Access from Anywhere"**
     - This adds `0.0.0.0/0` which allows all IPs
     - ⚠️ Only use this for development!
   
   - **Option B (More secure)**: Add your current IP address
     - Click "Add Current IP Address"
     - Or manually enter your IP

3. Click **"Confirm"**

### Step 3: Wait a Few Minutes
- It may take 1-2 minutes for the changes to take effect

### Step 4: Restart Your Backend Server
```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
cd server
npm run dev
```

You should now see:
```
✅ MongoDB connected successfully
📊 Database: barakaflow
```

## Verify Connection

After restarting, try signing up again in the frontend. It should work now!

## Your Current Connection String
```
mongodb+srv://kumneger496235_db_user:****@smarttodo.a4vchmb.mongodb.net/barakaflow?appName=smartToDo
```

This is already configured in `server/.env`. You just need to whitelist your IP in MongoDB Atlas.
