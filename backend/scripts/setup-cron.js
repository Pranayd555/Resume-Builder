const cron = require('node-cron');
const { cleanupExpiredResumes } = require('./cleanup-expired-resumes');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

// Schedule cleanup to run every day at 2 AM
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Starting scheduled resume cleanup...');
    await cleanupExpiredResumes();
    logger.info('Scheduled resume cleanup completed');
    await emailService.sendCronJobNotification({
      jobName: 'Resume Cleanup',
      status: 'success',
      details: 'Resume cleanup completed successfully.'
    });
  } catch (error) {
    logger.error('Scheduled resume cleanup failed:', error);
    await emailService.sendCronJobNotification({
      jobName: 'Resume Cleanup',
      status: 'failure',
      error: error.message || error.toString()
    });
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: 'UTC'
});

// Start the cron job
cleanupJob.start();
logger.info('Resume cleanup cron job scheduled to run daily at 2 AM UTC');

module.exports = { cleanupJob };
