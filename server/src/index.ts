import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - support multiple origins for dev and production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BarakaFlow API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  Warning: MONGODB_URI not set. Using default: mongodb://localhost:27017/barakaflow');
    }
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  // Still start server even if DB connection fails (for testing)
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (without database)`);
    console.log(`⚠️  Database connection failed. Some features may not work.`);
  });
});
