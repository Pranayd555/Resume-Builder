const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Simple MongoDB connection test script
 * Use this to diagnose connection issues before running migrations
 */

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/resume-builder';
    
    console.log('📍 Environment variables:');
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    
    console.log(`\n🔗 Connection URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Test connection with timeout
    console.log('\n⏱️  Attempting connection (10 second timeout)...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // List databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log(`📊 Available databases: ${dbs.databases.map(db => db.name).join(', ')}`);
    
    // Test collection access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.map(col => col.name).join(', ')}`);
    
    // Test model loading
    try {
      const Subscription = require('../models/Subscription');
      console.log('✅ Subscription model loaded successfully');
    } catch (error) {
      console.log('❌ Failed to load Subscription model:', error.message);
    }
    
    try {
      const User = require('../models/User');
      console.log('✅ User model loaded successfully');
    } catch (error) {
      console.log('❌ Failed to load User model:', error.message);
    }
    
    console.log('\n🎉 Connection test completed successfully!');
    console.log('✅ You can now run the migration script.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    // Provide specific troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:');
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('1. Check if MongoDB is running:');
      console.log('   - Local: mongod --version');
      console.log('   - Docker: docker ps | grep mongo');
      console.log('   - Cloud: Check your MongoDB Atlas cluster status');
      
      console.log('\n2. Verify connection string:');
      console.log('   - Check MONGODB_URI in .env file');
      console.log('   - Ensure correct host, port, and database name');
      
      console.log('\n3. Check network connectivity:');
      console.log('   - Ping the MongoDB host');
      console.log('   - Check firewall settings');
      console.log('   - Verify VPN connection if applicable');
      
    } else if (error.name === 'MongoParseError') {
      console.log('1. Check MongoDB URI format:');
      console.log('   - Should start with mongodb:// or mongodb+srv://');
      console.log('   - Check for special characters in password');
      console.log('   - URL encode special characters if needed');
      
    } else if (error.name === 'MongoAuthenticationError') {
      console.log('1. Check credentials:');
      console.log('   - Verify username and password');
      console.log('   - Check if user has database access');
      console.log('   - Verify authentication database');
      
    } else if (error.name === 'MongoNetworkError') {
      console.log('1. Check network settings:');
      console.log('   - Verify internet connection');
      console.log('   - Check DNS resolution');
      console.log('   - Try connecting from different network');
      
    } else {
      console.log('1. Check error details above');
      console.log('2. Verify MongoDB version compatibility');
      console.log('3. Check Node.js version compatibility');
    }
    
    console.log('\n📚 Common solutions:');
    console.log('- Restart MongoDB service');
    console.log('- Check .env file for correct MONGODB_URI');
    console.log('- Verify database permissions');
    console.log('- Try connecting with MongoDB Compass first');
    
    process.exit(1);
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n📡 Disconnected from MongoDB');
    }
  }
}

// Run the test
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
