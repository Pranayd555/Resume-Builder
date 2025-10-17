const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const User = require('../models/User');
const logger = require('../utils/logger');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean up resumes marked for deletion
const cleanupExpiredResumes = async () => {
  try {
    const now = new Date();
    
    // Find resumes marked for deletion where deletion date has passed
    const resumesToDelete = await Resume.find({
      markedForDeletion: true,
      deletionDate: { $lte: now }
    }).populate('user', 'email name');
    
    if (resumesToDelete.length === 0) {
      console.log('No resumes to delete');
      return;
    }
    
    console.log(`Found ${resumesToDelete.length} resumes to delete`);
    
    // Group by user for notification
    const userResumeMap = {};
    resumesToDelete.forEach(resume => {
      const userId = resume.user._id.toString();
      if (!userResumeMap[userId]) {
        userResumeMap[userId] = {
          user: resume.user,
          resumes: []
        };
      }
      userResumeMap[userId].resumes.push(resume);
    });
    
    // Delete resumes
    const deletedResumeIds = resumesToDelete.map(r => r._id);
    const deleteResult = await Resume.deleteMany({
      _id: { $in: deletedResumeIds }
    });
    
    console.log(`Successfully deleted ${deleteResult.deletedCount} resumes`);
    
    // Send notification emails to users
    for (const userId in userResumeMap) {
      const { user, resumes } = userResumeMap[userId];
      
      try {
        const emailService = require('../utils/emailService');
        await emailService.sendResumeDeletionNotification({
          userEmail: user.email,
          userName: user.name,
          deletedResumes: resumes.map(r => ({
            title: r.title,
            status: r.status,
            deletedAt: new Date()
          })),
          totalDeleted: resumes.length
        });
        
        console.log(`Sent deletion notification to ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send notification to ${user.email}:`, emailError);
      }
    }
    
    logger.info(`Cleanup completed: ${deleteResult.deletedCount} resumes deleted`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    logger.error('Resume cleanup error:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await cleanupExpiredResumes();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanupExpiredResumes };
