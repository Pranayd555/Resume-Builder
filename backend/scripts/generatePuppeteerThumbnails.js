const mongoose = require('mongoose');
const Template = require('../models/Template');
const PuppeteerThumbnailGenerator = require('../utils/puppeteerThumbnailGenerator');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

class ThumbnailGenerationManager {
  constructor() {
    this.generator = new PuppeteerThumbnailGenerator();
    this.baseURL = process.env.BASE_URL || 'http://localhost:5000';
  }

  async initialize() {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');

      // Initialize Puppeteer
      await this.generator.initialize();
      console.log('✅ Puppeteer initialized');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      await this.generator.close();
      await mongoose.disconnect();
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  async generateThumbnailsForAllTemplates(options = {}) {
    const defaultOptions = {
      width: 300,
      height: 400,
      format: 'webp',
      quality: 85,
      updateDatabase: true,
      generateMultipleSizes: false
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      console.log('🔄 Fetching templates from database...');
      const templates = await Template.find({ 'availability.isActive': true });
      
      if (templates.length === 0) {
        console.log('⚠️  No active templates found');
        return [];
      }

      console.log(`📋 Found ${templates.length} active templates`);

      const results = [];

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        console.log(`\n📸 Processing ${i + 1}/${templates.length}: ${template.name}`);

        try {
          let thumbnailResults = [];

          if (mergedOptions.generateMultipleSizes) {
            // Generate multiple sizes
            const sizes = [
              { width: 150, height: 200, suffix: 'small' },
              { width: 300, height: 400, suffix: 'medium' },
              { width: 600, height: 800, suffix: 'large' }
            ];

            for (const size of sizes) {
              const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${size.suffix}.webp`;
              const result = await this.generator.generateThumbnail(template, {
                width: size.width,
                height: size.height,
                format: 'webp',
                filename
              });

              thumbnailResults.push({
                size: size.suffix,
                ...result
              });
            }
          } else {
            // Generate single thumbnail
            const result = await this.generator.generateThumbnail(template, mergedOptions);
            thumbnailResults.push(result);
          }

          // Update database if requested
          if (mergedOptions.updateDatabase) {
            const primaryThumbnail = thumbnailResults.find(r => r.size === 'medium' || !r.size);
            if (primaryThumbnail && primaryThumbnail.success) {
              await Template.findByIdAndUpdate(template._id, {
                'preview.thumbnail.url': `${this.baseURL}${primaryThumbnail.url}`,
                'preview.thumbnail.filename': primaryThumbnail.filename,
                'preview.thumbnail.format': primaryThumbnail.format,
                'preview.thumbnail.width': primaryThumbnail.width,
                'preview.thumbnail.height': primaryThumbnail.height,
                'preview.thumbnail.generated': new Date(),
                'preview.thumbnail.method': 'puppeteer'
              });

              console.log(`✅ Updated database for ${template.name}`);
            }
          }

          results.push({
            templateId: template._id,
            templateName: template.name,
            thumbnails: thumbnailResults,
            success: thumbnailResults.some(r => r.success)
          });

        } catch (error) {
          console.error(`❌ Error processing ${template.name}:`, error.message);
          results.push({
            templateId: template._id,
            templateName: template.name,
            thumbnails: [],
            success: false,
            error: error.message
          });
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      console.log('\n📊 Generation Summary:');
      console.log(`✅ Successful: ${successful}/${results.length}`);
      console.log(`❌ Failed: ${failed}/${results.length}`);

      if (failed > 0) {
        console.log('\n❌ Failed templates:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`  - ${r.templateName}: ${r.error || 'Unknown error'}`);
        });
      }

      return results;

    } catch (error) {
      console.error('❌ Error in thumbnail generation:', error);
      throw error;
    }
  }

  async generateSingleThumbnail(templateId, options = {}) {
    try {
      const template = await Template.findById(templateId);
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      console.log(`📸 Generating thumbnail for: ${template.name}`);

      const result = await this.generator.generateThumbnail(template, options);

      if (result.success && options.updateDatabase !== false) {
        await Template.findByIdAndUpdate(templateId, {
          'preview.thumbnail.url': `${this.baseURL}${result.url}`,
          'preview.thumbnail.filename': result.filename,
          'preview.thumbnail.format': result.format,
          'preview.thumbnail.width': result.width,
          'preview.thumbnail.height': result.height,
          'preview.thumbnail.generated': new Date(),
          'preview.thumbnail.method': 'puppeteer'
        });

        console.log(`✅ Updated database for ${template.name}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ Error generating thumbnail for template ${templateId}:`, error);
      throw error;
    }
  }

  async generateDataURIThumbnails(templateIds = []) {
    try {
      const query = templateIds.length > 0 
        ? { _id: { $in: templateIds } }
        : { 'availability.isActive': true };

      const templates = await Template.find(query);
      
      if (templates.length === 0) {
        console.log('⚠️  No templates found');
        return [];
      }

      console.log(`📋 Generating data URI thumbnails for ${templates.length} templates`);

      const results = [];

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        console.log(`📸 Processing ${i + 1}/${templates.length}: ${template.name}`);

        try {
          const result = await this.generator.generateDataURI(template, {
            width: 300,
            height: 400,
            format: 'png'
          });

          if (result.success) {
            await Template.findByIdAndUpdate(template._id, {
              'preview.thumbnail.dataURI': result.dataURI,
              'preview.thumbnail.mimeType': result.mimeType,
              'preview.thumbnail.size': result.size,
              'preview.thumbnail.generated': new Date(),
              'preview.thumbnail.method': 'puppeteer-datauri'
            });

            console.log(`✅ Updated data URI for ${template.name}`);
          }

          results.push({
            templateId: template._id,
            templateName: template.name,
            ...result
          });

        } catch (error) {
          console.error(`❌ Error generating data URI for ${template.name}:`, error.message);
          results.push({
            templateId: template._id,
            templateName: template.name,
            success: false,
            error: error.message
          });
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const successful = results.filter(r => r.success).length;
      console.log(`\n✅ Generated ${successful}/${results.length} data URI thumbnails`);

      return results;

    } catch (error) {
      console.error('❌ Error generating data URI thumbnails:', error);
      throw error;
    }
  }

  async cleanupOldThumbnails() {
    try {
      const thumbnailsDir = path.join(__dirname, '../thumbnails');
      const files = await fs.readdir(thumbnailsDir);
      
      console.log(`🧹 Found ${files.length} files in thumbnails directory`);
      
      for (const file of files) {
        const filePath = path.join(thumbnailsDir, file);
        const stats = await fs.stat(filePath);
        
        // Delete files older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (stats.mtime < sevenDaysAgo) {
          await fs.unlink(filePath);
          console.log(`🗑️  Deleted old thumbnail: ${file}`);
        }
      }
      
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.error('❌ Error cleaning up thumbnails:', error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new ThumbnailGenerationManager();
  
  try {
    await manager.initialize();
    
    switch (command) {
      case 'generate':
        console.log('🎯 Generating thumbnails for all templates...');
        await manager.generateThumbnailsForAllTemplates({
          updateDatabase: true,
          generateMultipleSizes: args.includes('--multi-size')
        });
        break;
        
      case 'generate-single':
        const templateId = args[1];
        if (!templateId) {
          console.error('❌ Template ID required for single generation');
          process.exit(1);
        }
        console.log(`🎯 Generating thumbnail for template: ${templateId}`);
        await manager.generateSingleThumbnail(templateId);
        break;
        
      case 'generate-datauri':
        console.log('🎯 Generating data URI thumbnails...');
        await manager.generateDataURIThumbnails();
        break;
        
      case 'cleanup':
        console.log('🧹 Cleaning up old thumbnails...');
        await manager.cleanupOldThumbnails();
        break;
        
      default:
        console.log('🎯 Usage:');
        console.log('  npm run generate-thumbnails generate [--multi-size]');
        console.log('  npm run generate-thumbnails generate-single <templateId>');
        console.log('  npm run generate-thumbnails generate-datauri');
        console.log('  npm run generate-thumbnails cleanup');
        break;
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await manager.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ThumbnailGenerationManager; 