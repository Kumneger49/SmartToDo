import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barakaflow';
    
    // Ensure database name is in the connection string
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.match(/\/[^?]+(\?|$)/)) {
      // If no database name specified, add it
      const separator = mongoURI.includes('?') ? '&' : '?';
      mongoURI = `${mongoURI}${separator}retryWrites=true&w=majority`;
    }
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    console.log(`🔍 MONGODB_URI from env: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    // Set connection options for Atlas
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds for Atlas
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    };
    
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('📋 Full error:', error);
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

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
