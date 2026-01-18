# BarakaFlow Backend API

Backend server for BarakaFlow task management application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/barakaflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

### 3. MongoDB Setup

You need MongoDB running. Options:

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use `mongodb://localhost:27017/barakaflow`

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Use connection string in `MONGODB_URI`

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Tasks (Protected - requires authentication)

- `GET /api/tasks` - Get all user's tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Authentication

All task endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
server/
├── src/
│   ├── config/        # Database configuration
│   ├── models/        # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── index.ts        # Server entry point
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables (create this)
└── package.json
```
