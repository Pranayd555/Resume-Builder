const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration to add ATS analysis field to existing resumes
const addAtsAnalysisField = async () => {
  try {
    console.log('Starting migration: Adding ATS analysis field to resumes...');
    
    const db = mongoose.connection.db;
    const resumesCollection = db.collection('resumes');
    
    // Count existing resumes
    const totalResumes = await resumesCollection.countDocuments();
    console.log(`Found ${totalResumes} resumes to migrate`);
    
    if (totalResumes === 0) {
      console.log('No resumes found. Migration completed.');
      return;
    }
    
    // Update all resumes to add the ATS analysis field
    const result = await resumesCollection.updateMany(
      { atsAnalysis: { $exists: false } }, // Only update resumes that don't have atsAnalysis
      {
        $set: {
          atsAnalysis: {
            overall_score: null,
            category_scores: {
              keyword_skill_match: null,
              experience_alignment: null,
              section_completeness: null,
              project_impact: null,
              formatting: null,
              bonus_skills: null
            },
            missing_keywords: [],
            strengths: [],
            weaknesses: [],
            ats_warnings: [],
            recommendations: [],
            job_description_hash: null,
            analyzed_at: null
          }
        }
      }
    );
    
    console.log(`Migration completed successfully:`);
    console.log(`- Matched: ${result.matchedCount} resumes`);
    console.log(`- Modified: ${result.modifiedCount} resumes`);
    
    // Verify the migration
    const resumesWithAts = await resumesCollection.countDocuments({
      'atsAnalysis': { $exists: true }
    });
    
    console.log(`Verification: ${resumesWithAts} resumes now have ATS analysis field`);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Rollback function to remove ATS analysis field
const rollbackAtsAnalysisField = async () => {
  try {
    console.log('Starting rollback: Removing ATS analysis field from resumes...');
    
    const db = mongoose.connection.db;
    const resumesCollection = db.collection('resumes');
    
    const result = await resumesCollection.updateMany(
      { atsAnalysis: { $exists: true } },
      { $unset: { atsAnalysis: 1 } }
    );
    
    console.log(`Rollback completed successfully:`);
    console.log(`- Matched: ${result.matchedCount} resumes`);
    console.log(`- Modified: ${result.modifiedCount} resumes`);
    
  } catch (error) {
    console.error('Rollback error:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    const command = process.argv[2];
    
    if (command === 'rollback') {
      await rollbackAtsAnalysisField();
    } else {
      await addAtsAnalysisField();
    }
    
    console.log('Migration script completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the migration
main();
