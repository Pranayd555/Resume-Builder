const mongoose = require('mongoose');

module.exports = async function globalTeardown() {
  console.log('Cleaning up global test environment...');
  
  try {
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed successfully');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  
  // Force exit after cleanup
  process.exit(0);
}; 