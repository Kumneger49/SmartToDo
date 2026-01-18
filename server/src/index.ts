/**
 * BarakaFlow Backend Server
 * 
 * Express.js server that provides:
 * - User authentication (JWT-based)
 * - Task CRUD operations
 * - MongoDB database connection
 * - CORS configuration for frontend
 * 
 * @fileoverview Main server entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
// Use PORT from environment (set by hosting platform) or default to 3000
const PORT = process.env.PORT || 3000;

// ==================== Middleware Configuration ====================

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Allows requests from specified frontend origins
 * Supports multiple origins (comma-separated) for dev and production
 */
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173']; // Default to localhost for development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow if origin is in whitelist or in development mode
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies/credentials to be sent
}));

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ==================== API Routes ====================

/**
 * Health check endpoint
 * Used by deployment platforms to verify server is running
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BarakaFlow API is running' });
});

// Authentication routes (register, login, verify)
app.use('/api/auth', authRoutes);

// Task routes (CRUD operations - protected by authentication middleware)
app.use('/api/tasks', taskRoutes);

// ==================== Error Handling ====================

/**
 * 404 Handler - Catch all unmatched routes
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Global Error Handler
 * Catches all errors and returns appropriate HTTP status codes
 * Includes stack trace in development mode for debugging
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    // Only include stack trace in development for security
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== Server Startup ====================

/**
 * Connect to MongoDB database and start Express server
 * If database connection fails, server still starts (for testing/debugging)
 * but task operations will not work
 */
connectDB().then(() => {
  // Database connected successfully, start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  Warning: MONGODB_URI not set. Using default: mongodb://localhost:27017/barakaflow');
    }
  });
}).catch((error) => {
  // Database connection failed, but start server anyway for debugging
  console.error('❌ Failed to start server:', error);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (without database)`);
    console.log(`⚠️  Database connection failed. Some features may not work.`);
  });
});
