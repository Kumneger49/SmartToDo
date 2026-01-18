# BarakaFlow Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/barakaflow`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get your connection string
5. Replace `<password>` with your database password

### 3. Configure Environment Variables

Create `server/.env` file:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/barakaflow
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barakaflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

### 4. Start Backend Server
```bash
cd server
npm run dev
```

Server will run on `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Configure API URL (Optional)

Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Frontend
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing the Connection

1. Start the backend server (must have MongoDB running)
2. Start the frontend
3. Open browser to `http://localhost:5173`
4. You should see the Login page
5. Click "Sign up" to create an account
6. After signup/login, you'll see the main app

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Tasks (Protected)
- `GET /api/tasks` - Get all user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists in `server/` directory
- Check MongoDB connection string is correct

### Frontend can't connect to backend
- Make sure backend is running on port 3000
- Check CORS_ORIGIN in server/.env matches frontend URL
- Check browser console for errors

### Authentication errors
- Check JWT_SECRET is set in server/.env
- Verify token is being stored in localStorage
- Check network tab for API responses
