const mongoose = require('mongoose');

module.exports = async function globalSetup() {
  console.log('Setting up global test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.PORT = 5000;
  
  // Wait for MongoDB to be available
  let retries = 0;
  const maxRetries = 30;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      retries++;
      console.log(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);
      if (retries >= maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}; 