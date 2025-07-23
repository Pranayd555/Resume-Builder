# Scripts Directory

This directory contains utility scripts for the Resume Builder backend.

## 🚀 Available Scripts

### Template Management

#### `seedAllTemplates.js` - **MAIN TEMPLATE SEEDER**
**Use this script for all template seeding needs.**

```bash
npm run seed:all-templates
```

**Features:**
- ✅ Creates all 10 comprehensive resume templates
- ✅ Includes templates across 6 categories: Modern (3), Creative (1), Classic (2), Minimalist (1), Professional (2), Academic (1)
- ✅ Complete HTML/CSS code with proper styling
- ✅ Automatic admin user creation
- ✅ Error handling and progress tracking

**Templates included:**
1. **Modern Category** (3 templates)
   - Modern Professional
   - Modern Executive  
   - Modern Tech

2. **Creative Category** (1 template)
   - Creative Designer

3. **Classic Category** (2 templates)
   - Classic Traditional
   - Classic Professional

4. **Minimalist Category** (1 template)
   - Minimalist Clean

5. **Professional Category** (2 templates)
   - Professional Corporate
   - Professional Executive

6. **Academic Category** (1 template)
   - Academic Research

### Template Testing

#### `testTemplates.js` - Template Validation
Tests template functionality and validates template data.

```bash
npm run test:templates
```

**What it does:**
- Connects to database and fetches all templates
- Validates template structure and required fields
- Tests template rendering with sample data
- Reports issues and validation results

## 🖼️ Thumbnail Management (Puppeteer System)

### `generatePuppeteerThumbnails.js` - **MAIN THUMBNAIL GENERATOR**
**Advanced thumbnail generation using Puppeteer for real template screenshots.**

```bash
# Generate thumbnails for all templates
npm run generate-thumbnails generate

# Generate thumbnails with multiple sizes
npm run generate-thumbnails generate --multi-size

# Generate data URI thumbnails
npm run generate-thumbnails generate-datauri

# Clean up old thumbnails
npm run generate-thumbnails cleanup
```

**Features:**
- 🎯 **Real Screenshots**: Generates actual template previews with sample data
- 🖼️ **Multiple Formats**: PNG, JPEG, WebP support
- 📏 **Multiple Sizes**: Small (150x200), Medium (300x400), Large (600x800)
- 💾 **Data URI Support**: For inline embedding
- 🔄 **Auto Database Updates**: Updates MongoDB with thumbnail URLs
- 🧹 **Cleanup Tools**: Automatic cleanup of old thumbnails

### `updateTemplatesWithPuppeteerThumbnails.js` - **DATABASE UPDATE UTILITIES**
**Database update utilities for Puppeteer thumbnail management.**

```bash
# Update all templates with Puppeteer thumbnails
npm run update-thumbnails update-all

# Fix encoding issues and regenerate
npm run update-thumbnails fix-encoding

# Regenerate specific templates
npm run update-thumbnails regenerate-specific "Template Name"

# Generate data URI thumbnails
npm run update-thumbnails generate-datauri

# Clean up old thumbnails
npm run update-thumbnails cleanup
```

**Features:**
- 🔧 **Migration Tools**: Updates existing templates with Puppeteer thumbnails
- 🛠️ **Encoding Fixes**: Fixes URL encoding issues from old systems
- 🎯 **Selective Regeneration**: Regenerate specific templates by name
- 📊 **Progress Reporting**: Detailed success/failure reporting

## 📚 Documentation

### `PUPPETEER_THUMBNAILS_README.md` - **COMPREHENSIVE GUIDE**
Detailed documentation for the Puppeteer thumbnail generation system.

**Includes:**
- 📖 Complete API reference
- 🛠️ Configuration options
- 🔧 Troubleshooting guide
- 🚀 Production deployment guide
- 💡 Best practices and examples

## 🚀 Quick Start Guide

### 1. Seed Templates
```bash
npm run seed:all-templates
```

### 2. Generate Thumbnails
```bash
# Option A: Fix existing and regenerate (recommended for migration)
npm run update-thumbnails fix-encoding

# Option B: Generate fresh thumbnails
npm run generate-thumbnails generate
```

### 3. Verify Setup
```bash
npm run test:templates
```

## 🔧 Technical Details

### Thumbnail System Evolution

**Old System (Deprecated):**
- ❌ External dependency on via.placeholder.com
- ❌ URL encoding issues with `+` characters
- ❌ Generic placeholder images
- ❌ Network reliability issues

**New System (Current):**
- ✅ Self-hosted real template screenshots
- ✅ Proper filename handling and local serving
- ✅ Beautiful template previews with actual data
- ✅ No external dependencies
- ✅ WebP format for optimal file sizes

### Sample Data Used

The Puppeteer system uses comprehensive sample data:
- **Personal Info**: John Smith with complete contact details
- **Work Experience**: 2 realistic job positions with achievements
- **Education**: Master's and Bachelor's degrees
- **Skills**: Programming languages, frameworks, tools with levels
- **Projects**: Real-world project examples
- **Certifications**: AWS and Google Cloud certifications

### File Structure

```
backend/scripts/
├── seedAllTemplates.js                    # Main template seeder
├── testTemplates.js                       # Template validation
├── generatePuppeteerThumbnails.js         # Thumbnail generation
├── updateTemplatesWithPuppeteerThumbnails.js  # Database updates
├── PUPPETEER_THUMBNAILS_README.md        # Detailed documentation
└── README.md                             # This file
```

## 🔗 Integration

### Server Integration
Thumbnails are served through Express static middleware:
```javascript
app.use('/thumbnails', express.static('thumbnails', {
  maxAge: '7d', // Cache for 7 days
  etag: true,
  lastModified: true
}));
```

### Database Schema
Thumbnail data is stored in the `preview.thumbnail` field:
```javascript
{
  preview: {
    thumbnail: {
      url: "http://localhost:5000/thumbnails/modern-professional-thumbnail.webp",
      filename: "modern-professional-thumbnail.webp",
      format: "webp",
      width: 300,
      height: 400,
      generated: "2023-12-01T10:00:00.000Z",
      method: "puppeteer"
    }
  }
}
```

## 🆘 Support

For issues or questions:
1. Check `PUPPETEER_THUMBNAILS_README.md` for detailed troubleshooting
2. Verify all dependencies are installed (`npm install`)
3. Test with a single template first
4. Check logs for specific error messages 