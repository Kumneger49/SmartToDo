# BarakaFlow Backend API

Backend server for BarakaFlow task management application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
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
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Authentication

All task endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Deployment

The backend is deployed on Render:
- **URL**: https://smarttodo-1-in05.onrender.com/api
- **Health Check**: https://smarttodo-1-in05.onrender.com/api/health

## Project Structure

```
server/
├── src/
│   ├── config/        # Database configuration
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/   # Express middleware
│   └── index.ts      # Server entry point
├── dist/             # Compiled JavaScript (generated)
└── package.json
```
