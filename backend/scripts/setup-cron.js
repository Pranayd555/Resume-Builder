const cron = require('node-cron');
const { cleanupExpiredResumes } = require('./cleanup-expired-resumes');
const logger = require('../utils/logger');

// Schedule cleanup to run every day at 2 AM
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Starting scheduled resume cleanup...');
    await cleanupExpiredResumes();
    logger.info('Scheduled resume cleanup completed');
  } catch (error) {
    logger.error('Scheduled resume cleanup failed:', error);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: 'UTC'
});

// Start the cron job
cleanupJob.start();
logger.info('Resume cleanup cron job scheduled to run daily at 2 AM UTC');

module.exports = { cleanupJob };
