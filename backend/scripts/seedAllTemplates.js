const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const PuppeteerThumbnailGenerator = require('../utils/puppeteerThumbnailGenerator');
require('dotenv').config();
const templatesList = require('../assets/templates');

class ThumbnailGenerationManager {
  constructor() {
    this.generator = new PuppeteerThumbnailGenerator();
    this.baseURL = process.env.BASE_URL || 'http://localhost:5000';
  }

  async initialize() {
    try {
      await this.generator.initialize();
      console.log('✅ Puppeteer initialized for thumbnail generation');
    } catch (error) {
      console.error('❌ Puppeteer initialization failed:', error);
      throw error;
    }
  }

  async generateThumbnailsForTemplates(templates, options = {}) {
    const defaultOptions = {
      width: 300,
      height: 400,
      format: 'webp',
      quality: 85,
      updateDatabase: true
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const results = [];

    console.log(`\n📸 Generating thumbnails for ${templates.length} templates...`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      console.log(`🖼️  Processing ${i + 1}/${templates.length}: ${template.name}`);

      try {
        const result = await this.generator.generateThumbnail(template, mergedOptions);

        if (result.success && mergedOptions.updateDatabase) {
          await Template.findByIdAndUpdate(template._id, {
            'preview.thumbnail.url': `${this.baseURL}${result.url}`,
            'preview.thumbnail.filename': result.filename,
            'preview.thumbnail.format': result.format,
            'preview.thumbnail.width': result.width,
            'preview.thumbnail.height': result.height,
            'preview.thumbnail.generated': new Date(),
            'preview.thumbnail.method': 'puppeteer'
          });

          console.log(`   ✅ Generated and updated thumbnail for ${template.name}`);
        }

        results.push({
          templateId: template._id,
          templateName: template.name,
          success: result.success,
          url: result.url
        });

      } catch (error) {
        console.error(`   ❌ Error generating thumbnail for ${template.name}:`, error.message);
        results.push({
          templateId: template._id,
          templateName: template.name,
          success: false,
          error: error.message
        });
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return results;
  }

  async cleanup() {
    try {
      await this.generator.close();
      console.log('✅ Puppeteer cleanup completed');
    } catch (error) {
      console.error('❌ Puppeteer cleanup failed:', error);
    }
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAllTemplates = async () => {
  let thumbnailManager = null;
  
  try {
    console.log('🚀 Starting comprehensive template seeding with thumbnail generation...');
    
    // Find an admin user or create one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@resumebuilder.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Created admin user');
    }

    // Clear existing templates
    await Template.deleteMany({});
    console.log('🧹 Cleared existing templates');

    const templates = templatesList.map(t => ({ ...t, creator: adminUser._id }));

    console.log('📝 Processing templates...');
    
    // Create templates in chunks to avoid memory issues
    const chunkSize = 3;
    const createdTemplates = [];
    
    for (let i = 0; i < templates.length; i += chunkSize) {
      const chunk = templates.slice(i, i + chunkSize);
      const created = await Template.insertMany(chunk);
      createdTemplates.push(...created);
      console.log(`✅ Created ${created.length} templates (${i + 1}-${Math.min(i + chunkSize, templates.length)} of ${templates.length})`);
    }

    // Initialize thumbnail generation manager
    console.log('\n🚀 Initializing thumbnail generation...');
    thumbnailManager = new ThumbnailGenerationManager();
    await thumbnailManager.initialize();

    // Generate thumbnails for all created templates
    const thumbnailResults = await thumbnailManager.generateThumbnailsForTemplates(createdTemplates, {
      width: 300,
      height: 400,
      format: 'webp',
      quality: 85,
      updateDatabase: true
    });

    // Clean up thumbnail manager
    await thumbnailManager.cleanup();

    // Generate summary
    const successfulThumbnails = thumbnailResults.filter(r => r.success).length;
    const failedThumbnails = thumbnailResults.filter(r => !r.success).length;
    
    console.log(`\n🎉 Successfully created ${createdTemplates.length} templates:`);
    createdTemplates.forEach((template, index) => {
      const thumbnailResult = thumbnailResults.find(r => r.templateId.toString() === template._id.toString());
      const thumbnailStatus = thumbnailResult?.success ? '✅' : '❌';
      console.log(`   ${index + 1}. ${template.name} (${template.category}) - ${template.availability.tier} ${thumbnailStatus}`);
    });

    console.log(`\n📸 Thumbnail Generation Summary:`);
    console.log(`   ✅ Successful: ${successfulThumbnails}/${thumbnailResults.length}`);
    console.log(`   ❌ Failed: ${failedThumbnails}/${thumbnailResults.length}`);

    if (failedThumbnails > 0) {
      console.log('\n❌ Failed thumbnail generation:');
      thumbnailResults.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.templateName}: ${r.error || 'Unknown error'}`);
      });
    }
    
    console.log('\n✨ Template seeding with thumbnail generation completed successfully!');
    console.log(`\n🔗 Templates are now accessible at:`);
    console.log(`   - API: ${process.env.BASE_URL || 'http://localhost:5000'}/api/templates`);
    console.log(`   - Thumbnails: ${process.env.BASE_URL || 'http://localhost:5000'}/thumbnails/`);
    
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    
    // Clean up thumbnail manager if it was initialized
    if (thumbnailManager) {
      try {
        await thumbnailManager.cleanup();
      } catch (cleanupError) {
        console.error('❌ Error during cleanup:', cleanupError);
      }
    }
    
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from MongoDB:', disconnectError);
    }
  }
};

// Run the seeder
if (require.main === module) {
  seedAllTemplates()
    .then(() => {
      console.log('🎉 Seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedAllTemplates; 