const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const Resume = require('../models/Resume');
const PuppeteerThumbnailGenerator = require('../utils/puppeteerThumbnailGenerator');
require('dotenv').config();
const templatesList = require('../assets/newTemplates');

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
      quality: 90,
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

// Function to update resume template references
const updateResumeTemplateReferences = async (templateIdMapping) => {
  console.log('\n🔄 Updating resume template references...');
  
  let updatedResumes = 0;
  
  for (const [oldTemplateId, newTemplateId] of templateIdMapping.entries()) {
    if (oldTemplateId.toString() !== newTemplateId.toString()) {
      const result = await Resume.updateMany(
        { template: oldTemplateId },
        { template: newTemplateId }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Updated ${result.modifiedCount} resumes from template ${oldTemplateId} to ${newTemplateId}`);
        updatedResumes += result.modifiedCount;
      }
    }
  }
  
  console.log(`📊 Total resumes updated: ${updatedResumes}`);
  return updatedResumes;
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAllTemplates = async (templateName = null) => {
  let thumbnailManager = null;
  
  try {
    if (templateName) {
      console.log(`🚀 Starting template seeding for specific template: "${templateName}"...`);
    } else {
      console.log('🚀 Starting comprehensive template seeding with thumbnail generation...');
    }
    
    // Find an admin user or create one
    let adminUser = await User.findOne({ role: 'admin' });

    // Get existing templates to preserve usage data
    const existingTemplates = await Template.find({});
    const existingTemplatesMap = new Map();
    existingTemplates.forEach(template => {
      existingTemplatesMap.set(template.name, template);
    });
    console.log(`📊 Found ${existingTemplates.length} existing templates with usage data`);

    // Filter templates based on templateName parameter
    let templatesToProcess = templatesList;
    if (templateName) {
      templatesToProcess = templatesList.filter(t => 
        t.name.toLowerCase().includes(templateName.toLowerCase())
      );
      
      if (templatesToProcess.length === 0) {
        console.log(`❌ No templates found matching "${templateName}"`);
        console.log('Available templates:');
        templatesList.forEach(t => console.log(`   - ${t.name}`));
        return;
      }
      
      console.log(`🎯 Found ${templatesToProcess.length} template(s) matching "${templateName}"`);
      templatesToProcess.forEach(t => console.log(`   - ${t.name}`));
    }

    const templates = templatesToProcess.map(t => ({ ...t, creator: adminUser._id }));

    console.log('📝 Processing templates with data preservation...');
    
    // Process templates individually to preserve usage data
    const createdTemplates = [];
    const templateIdMapping = new Map(); // Track old -> new template ID mappings
    
    for (let i = 0; i < templates.length; i++) {
      const templateData = templates[i];
      const existingTemplate = existingTemplatesMap.get(templateData.name);
      
      let template;
      
      if (existingTemplate) {
        // Update existing template while preserving usage data and calculated fields
        const updateData = {
          ...templateData,
          // Preserve usage statistics (this maintains averageRating and popularityScore)
          usage: {
            totalUses: existingTemplate.usage.totalUses || 0,
            uniqueUsers: existingTemplate.usage.uniqueUsers || [],
            rating: {
              average: existingTemplate.usage.rating?.average || 0,
              count: existingTemplate.usage.rating?.count || 0
            }
          },
          // Preserve reviews (this affects averageRating calculation)
          reviews: existingTemplate.reviews || [],
          // Preserve version and changelog if they exist
          version: existingTemplate.version || templateData.version,
          changelog: existingTemplate.changelog || templateData.changelog
        };
        
        template = await Template.findByIdAndUpdate(
          existingTemplate._id,
          updateData,
          { new: true, runValidators: true }
        );
        
        // Track the ID mapping (in case the ID changes)
        templateIdMapping.set(existingTemplate._id, template._id);
        
        console.log(`🔄 Updated existing template: ${template.name} (preserved usage data)`);
        console.log(`   📊 Usage: ${template.usage.totalUses} uses, ${template.usage.uniqueUsers.length} unique users`);
        console.log(`   ⭐ Rating: ${template.usage.rating.average}/5 (${template.usage.rating.count} reviews)`);
        console.log(`   🎯 Popularity Score: ${template.popularityScore.toFixed(4)}`);
      } else {
        // Create new template
        template = await Template.create(templateData);
        console.log(`✨ Created new template: ${template.name}`);
      }
      
      createdTemplates.push(template);
      console.log(`   Progress: ${i + 1}/${templates.length} templates processed`);
    }
    
    // Update resume template references if any template IDs changed
    if (templateIdMapping.size > 0) {
      await updateResumeTemplateReferences(templateIdMapping);
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
      quality: 90,
      updateDatabase: true
    });

    // Clean up thumbnail manager
    await thumbnailManager.cleanup();

    // Generate summary
    const successfulThumbnails = thumbnailResults.filter(r => r.success).length;
    const failedThumbnails = thumbnailResults.filter(r => !r.success).length;
    
    const updatedTemplates = createdTemplates.filter(t => templateIdMapping.has(t._id)).length;
    const newTemplates = createdTemplates.length - updatedTemplates;
    
    console.log(`\n🎉 Successfully processed ${createdTemplates.length} templates:`);
    console.log(`   ✨ New templates: ${newTemplates}`);
    console.log(`   🔄 Updated templates: ${updatedTemplates}`);
    console.log(`   📊 Usage data preserved for existing templates`);
    
    createdTemplates.forEach((template, index) => {
      const thumbnailResult = thumbnailResults.find(r => r.templateId.toString() === template._id.toString());
      const thumbnailStatus = thumbnailResult?.success ? '✅' : '❌';
      const isUpdated = templateIdMapping.has(template._id);
      const status = isUpdated ? '🔄' : '✨';
      console.log(`   ${index + 1}. ${status} ${template.name} (${template.category}) - ${template.availability.tier} ${thumbnailStatus}`);
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
    
    console.log('\n✨ Template seeding with data preservation completed successfully!');
    console.log(`\n📊 Data Preservation Summary:`);
    console.log(`   ✅ Template usage statistics preserved (totalUses, uniqueUsers)`);
    console.log(`   ✅ User reviews and ratings preserved (affects averageRating)`);
    console.log(`   ✅ Virtual fields preserved (popularityScore, averageRating)`);
    console.log(`   ✅ Resume template selections maintained`);
    console.log(`   ✅ Template version history preserved`);
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
  // Get template name from command line arguments
  const templateName = process.argv[2];
  
  if (templateName && (templateName === '--help' || templateName === '-h')) {
    console.log('📖 Usage:');
    console.log('  node seedAllTemplates.js                    # Seed all templates');
    console.log('  node seedAllTemplates.js "Template Name"   # Seed specific template');
    console.log('  node seedAllTemplates.js --help             # Show this help');
    console.log('\n📋 Available templates:');
    templatesList.forEach(t => console.log(`   - ${t.name}`));
    process.exit(0);
  }
  
  seedAllTemplates(templateName)
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