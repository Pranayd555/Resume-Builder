# Puppeteer Thumbnail Generation System

This document explains how to use the new Puppeteer-based thumbnail generation system for resume templates.

## Overview

The Puppeteer thumbnail generation system creates high-quality, real screenshots of resume templates using sample data. This replaces the old placeholder-based system with actual rendered template previews.

## Key Features

- **Real Screenshots**: Generates actual screenshots of rendered templates
- **Multiple Formats**: Supports PNG, JPEG, and WebP formats
- **Multiple Sizes**: Can generate thumbnails in different sizes
- **Data URI Support**: Can generate base64-encoded data URIs for inline embedding
- **Automatic Database Updates**: Updates template records in MongoDB
- **Error Handling**: Comprehensive error handling and logging
- **Cleanup Tools**: Automatic cleanup of old thumbnail files

## Files

### Core Files
- `utils/puppeteerThumbnailGenerator.js` - Main thumbnail generation class
- `scripts/generatePuppeteerThumbnails.js` - Command-line interface for generation
- `scripts/updateTemplatesWithPuppeteerThumbnails.js` - Database update utilities

### Generated Files
- `thumbnails/` - Directory containing generated thumbnail files
- Templates in database updated with thumbnail URLs

## Installation

The required dependencies are already included in `package.json`:
- `puppeteer` - For browser automation and screenshots
- `handlebars` - For template rendering

## Usage

### Basic Commands

```bash
# Generate thumbnails for all templates
npm run generate-thumbnails generate

# Generate thumbnails with multiple sizes
npm run generate-thumbnails generate --multi-size

# Generate data URI thumbnails
npm run generate-thumbnails generate-datauri

# Clean up old thumbnails
npm run generate-thumbnails cleanup

# Update existing templates with Puppeteer thumbnails
npm run update-thumbnails update-all

# Fix encoding issues and regenerate
npm run update-thumbnails fix-encoding
```

### Advanced Commands

```bash
# Generate thumbnail for specific template
npm run generate-thumbnails generate-single <templateId>

# Regenerate specific templates by name
npm run update-thumbnails regenerate-specific "Modern Professional" "Classic Traditional"

# Generate data URI for specific templates
npm run update-thumbnails generate-datauri
```

## Configuration

### Environment Variables

```bash
# Base URL for serving thumbnails (default: http://localhost:5000)
BASE_URL=http://localhost:5000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/resumebuilder
```

### Default Settings

```javascript
const defaultOptions = {
  width: 300,        // Thumbnail width in pixels
  height: 400,       // Thumbnail height in pixels
  format: 'webp',    // Image format (png, jpeg, webp)
  quality: 85,       // Image quality (1-100)
  updateDatabase: true  // Whether to update database
};
```

## API Reference

### PuppeteerThumbnailGenerator Class

#### Methods

##### `initialize()`
Initializes the Puppeteer browser instance.

##### `generateThumbnail(template, options)`
Generates a single thumbnail for a template.

**Parameters:**
- `template` - Template object from database
- `options` - Configuration options

**Returns:**
- Object with `success`, `path`, `filename`, `url`, `width`, `height`, `format`

##### `generateThumbnailsForAllTemplates(templates, options)`
Generates thumbnails for multiple templates.

##### `generateDataURI(template, options)`
Generates a base64-encoded data URI for inline embedding.

##### `close()`
Closes the Puppeteer browser instance.

### ThumbnailGenerationManager Class

#### Methods

##### `updateTemplatesWithPuppeteerThumbnails()`
Updates all active templates with Puppeteer-generated thumbnails.

##### `regenerateSpecificTemplates(templateNames)`
Regenerates thumbnails for specific templates by name.

##### `generateDataURIThumbnails()`
Generates data URI thumbnails for all templates.

##### `cleanupOldThumbnails()`
Removes thumbnail files older than 7 days.

##### `fixEncodingAndRegenerateThumbnails()`
Fixes URL encoding issues and regenerates all thumbnails.

## File Structure

```
backend/
├── utils/
│   └── puppeteerThumbnailGenerator.js
├── scripts/
│   ├── generatePuppeteerThumbnails.js
│   ├── updateTemplatesWithPuppeteerThumbnails.js
│   └── PUPPETEER_THUMBNAILS_README.md
├── thumbnails/                    # Generated thumbnails
│   ├── modern-professional-thumbnail.webp
│   ├── classic-traditional-thumbnail.webp
│   └── ...
└── server.js                      # Updated to serve thumbnails
```

## Database Schema

The thumbnail data is stored in the `preview.thumbnail` field of template documents:

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
      method: "puppeteer",
      
      // Optional fields
      dataURI: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4...",
      mimeType: "image/webp",
      size: 12345
    }
  }
}
```

## Sample Data

The system uses comprehensive sample data to render templates:

```javascript
const sampleData = {
  personalInfo: {
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    address: 'New York, NY',
    // ... more fields
  },
  workExperience: [
    {
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      // ... more fields
    }
  ],
  // ... education, skills, projects, etc.
};
```

## Error Handling

The system includes comprehensive error handling:

- **Network Issues**: Retries and timeouts
- **Template Errors**: Continues processing other templates
- **File System**: Creates directories as needed
- **Database**: Handles connection issues gracefully

## Performance Considerations

- **Browser Reuse**: Single browser instance for all thumbnails
- **Resource Management**: Automatic cleanup of browser resources
- **Concurrency**: Sequential processing to avoid overwhelming system
- **Caching**: Serves thumbnails with appropriate cache headers

## Troubleshooting

### Common Issues

1. **Puppeteer Installation Issues**
   ```bash
   # Re-install Puppeteer
   npm install puppeteer --save
   ```

2. **Permission Issues**
   ```bash
   # Ensure thumbnails directory is writable
   chmod 755 thumbnails/
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 scripts/generatePuppeteerThumbnails.js generate
   ```

4. **Template Rendering Issues**
   - Check template HTML/CSS for errors
   - Verify Handlebars helpers are registered
   - Ensure fonts are available

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=puppeteer:* npm run generate-thumbnails generate
```

## Migration from Placeholder System

### Step 1: Backup Current Templates
```bash
# Export current templates
mongodump --db resumebuilder --collection templates
```

### Step 2: Fix Encoding Issues
```bash
# Fix URL encoding issues
npm run update-thumbnails fix-encoding
```

### Step 3: Generate New Thumbnails
```bash
# Generate Puppeteer thumbnails
npm run update-thumbnails update-all
```

### Step 4: Verify Results
```bash
# Check generated thumbnails
ls -la thumbnails/
```

## Production Deployment

### Server Configuration

1. **Static File Serving**: Ensure thumbnails directory is served by web server
2. **CDN Integration**: Consider using CDN for thumbnail delivery
3. **Backup Strategy**: Include thumbnails in backup procedures

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
BASE_URL=https://your-domain.com
MONGODB_URI=mongodb://production-server:27017/resumebuilder
```

### Monitoring

- Monitor thumbnail generation success rates
- Set up alerts for failed generations
- Track thumbnail file sizes and storage usage

## Future Enhancements

- **Lazy Loading**: Generate thumbnails on-demand
- **A/B Testing**: Multiple thumbnail variants
- **Social Media**: Generate thumbnails for social sharing
- **Animation**: Support for animated previews
- **Mobile Optimization**: Responsive thumbnail sizes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs for error messages
3. Test with a single template first
4. Ensure all dependencies are installed correctly 