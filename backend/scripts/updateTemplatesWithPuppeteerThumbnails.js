const mongoose = require('mongoose');
const Template = require('../models/Template');
const ThumbnailGenerationManager = require('./generatePuppeteerThumbnails');
require('dotenv').config();

async function updateTemplatesWithPuppeteerThumbnails() {
  const manager = new ThumbnailGenerationManager();
  
  try {
    console.log('🚀 Starting template thumbnail update process...');
    
    // Initialize the manager
    await manager.initialize();
    
    // Get all active templates
    const templates = await Template.find({ 'availability.isActive': true });
    console.log(`📋 Found ${templates.length} active templates to update`);
    
    if (templates.length === 0) {
      console.log('⚠️  No templates found to update');
      return;
    }
    
    // Generate thumbnails for all templates
    console.log('📸 Generating Puppeteer thumbnails...');
    const results = await manager.generateThumbnailsForAllTemplates({
      updateDatabase: true,
      format: 'webp',
      quality: 85,
      width: 300,
      height: 400
    });
    
    // Report results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 Update Results:');
    console.log(`✅ Successfully updated: ${successful} templates`);
    console.log(`❌ Failed to update: ${failed} templates`);
    
    if (failed > 0) {
      console.log('\n❌ Failed templates:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.templateName}: ${r.error || 'Unknown error'}`);
      });
    }
    
    // Display successful updates
    if (successful > 0) {
      console.log('\n✅ Successfully updated templates:');
      results.filter(r => r.success).forEach(r => {
        console.log(`  - ${r.templateName}: ${r.thumbnails[0]?.url || 'Generated'}`);
      });
    }
    
    console.log('\n🎉 Template thumbnail update process completed!');
    
  } catch (error) {
    console.error('❌ Error updating templates:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

async function regenerateSpecificTemplates(templateNames = []) {
  const manager = new ThumbnailGenerationManager();
  
  try {
    console.log(`🎯 Regenerating thumbnails for specific templates: ${templateNames.join(', ')}`);
    
    await manager.initialize();
    
    const templates = await Template.find({ 
      name: { $in: templateNames },
      'availability.isActive': true 
    });
    
    if (templates.length === 0) {
      console.log('⚠️  No matching templates found');
      return;
    }
    
    console.log(`📋 Found ${templates.length} matching templates`);
    
    const results = [];
    
    for (const template of templates) {
      console.log(`📸 Processing: ${template.name}`);
      
      const result = await manager.generateThumbnailsForAllTemplates([template], {
        updateDatabase: true,
        format: 'webp',
        quality: 85,
        width: 300,
        height: 400
      });
      
      results.push(result[0]);
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ Successfully regenerated ${successful}/${results.length} templates`);
    
  } catch (error) {
    console.error('❌ Error regenerating specific templates:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

async function generateDataURIThumbnails() {
  const manager = new ThumbnailGenerationManager();
  
  try {
    console.log('📸 Generating data URI thumbnails for all templates...');
    
    await manager.initialize();
    
    const results = await manager.generateDataURIThumbnails();
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ Successfully generated ${successful}/${results.length} data URI thumbnails`);
    
  } catch (error) {
    console.error('❌ Error generating data URI thumbnails:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

async function cleanupOldThumbnails() {
  const manager = new ThumbnailGenerationManager();
  
  try {
    console.log('🧹 Cleaning up old thumbnails...');
    
    await manager.initialize();
    await manager.cleanupOldThumbnails();
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning up thumbnails:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

async function fixEncodingAndRegenerateThumbnails() {
  const manager = new ThumbnailGenerationManager();
  
  try {
    console.log('🔧 Fixing encoding issues and regenerating thumbnails...');
    
    await manager.initialize();
    
    // First, fix any URL encoding issues in existing thumbnails
    const templates = await Template.find({ 'availability.isActive': true });
    
    for (const template of templates) {
      const currentUrl = template.preview?.thumbnail?.url;
      if (currentUrl && currentUrl.includes('+')) {
        // This is likely a placeholder URL with encoding issues
        console.log(`🔧 Template ${template.name} has encoding issues in thumbnail URL`);
        
        // Remove the old placeholder URL and regenerate with Puppeteer
        await Template.findByIdAndUpdate(template._id, {
          'preview.thumbnail.url': null,
          'preview.thumbnail.method': 'puppeteer-pending'
        });
        
        console.log(`🗑️  Cleared old thumbnail URL for ${template.name}`);
      }
    }
    
    // Now regenerate all thumbnails with Puppeteer
    console.log('📸 Regenerating all thumbnails with Puppeteer...');
    
    const results = await manager.generateThumbnailsForAllTemplates({
      updateDatabase: true,
      format: 'webp',
      quality: 85,
      width: 300,
      height: 400
    });
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ Successfully fixed and regenerated ${successful}/${results.length} thumbnails`);
    
  } catch (error) {
    console.error('❌ Error fixing encoding and regenerating thumbnails:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'update-all':
        await updateTemplatesWithPuppeteerThumbnails();
        break;
        
      case 'regenerate-specific':
        const templateNames = args.slice(1);
        if (templateNames.length === 0) {
          console.error('❌ Template names required for specific regeneration');
          console.log('Usage: node updateTemplatesWithPuppeteerThumbnails.js regenerate-specific "Template Name 1" "Template Name 2"');
          process.exit(1);
        }
        await regenerateSpecificTemplates(templateNames);
        break;
        
      case 'generate-datauri':
        await generateDataURIThumbnails();
        break;
        
      case 'cleanup':
        await cleanupOldThumbnails();
        break;
        
      case 'fix-encoding':
        await fixEncodingAndRegenerateThumbnails();
        break;
        
      default:
        console.log('🎯 Usage:');
        console.log('  node updateTemplatesWithPuppeteerThumbnails.js update-all');
        console.log('  node updateTemplatesWithPuppeteerThumbnails.js regenerate-specific "Template Name 1" "Template Name 2"');
        console.log('  node updateTemplatesWithPuppeteerThumbnails.js generate-datauri');
        console.log('  node updateTemplatesWithPuppeteerThumbnails.js cleanup');
        console.log('  node updateTemplatesWithPuppeteerThumbnails.js fix-encoding');
        break;
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  updateTemplatesWithPuppeteerThumbnails,
  regenerateSpecificTemplates,
  generateDataURIThumbnails,
  cleanupOldThumbnails,
  fixEncodingAndRegenerateThumbnails
}; 