/**
 * Database Configuration
 * 
 * Handles MongoDB connection using Mongoose
 * Supports both local MongoDB and MongoDB Atlas (cloud)
 * 
 * @fileoverview MongoDB connection setup and configuration
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * 
 * Uses connection string from environment variable or defaults to localhost
 * Configures connection options optimized for MongoDB Atlas
 * Throws error if connection fails (prevents server from starting without DB)
 * 
 * @throws Error if connection fails
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Get MongoDB connection string from environment or use default
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barakaflow';
    
    // Ensure database name and connection options are in the connection string
    // This is important for MongoDB Atlas connections
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.match(/\/[^?]+(\?|$)/)) {
      // If no database name specified, add connection options
      const separator = mongoURI.includes('?') ? '&' : '?';
      mongoURI = `${mongoURI}${separator}retryWrites=true&w=majority`;
    }
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs for security
    console.log(`🔍 MONGODB_URI from env: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    // Connection options optimized for MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (Atlas can be slow)
      socketTimeoutMS: 45000, // Socket timeout
      retryWrites: true, // Retry failed writes
      w: 'majority' as const, // Write concern: wait for majority of replicas
    };
    
    // Establish connection to MongoDB
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('📋 Full error:', error);
    
    // Provide helpful error messages for common connection issues
    if (error.message.includes('buffering timed out')) {
      console.error('💡 This usually means:');
      console.error('   1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('   2. The connection string is incorrect');
      console.error('   3. Network/firewall issues');
      console.error('   4. MongoDB Atlas cluster is paused or unavailable');
    }
    throw error; // Throw to prevent server from starting without DB
  }
};

// ==================== Connection Event Handlers ====================

/**
 * Handle MongoDB disconnection events
 * Logs when connection is lost
 */
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

/**
 * Handle MongoDB connection errors
 * Logs any errors that occur after initial connection
 */
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
