const mongoose = require('mongoose');
const Template = require('../models/Template');
const OptimizedTemplateRenderer = require('../utils/templateRenderer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testTemplates = async () => {
  try {
    console.log('🧪 Testing Template Rendering System\n');
    
    // Initialize template renderer
    const renderer = new OptimizedTemplateRenderer();
    
    // Generate sample data
    const sampleData = renderer.generateSampleData();
    console.log('✅ Generated sample resume data');
    
    // Get all templates
    const templates = await Template.find({ 'availability.isActive': true });
    console.log(`📋 Found ${templates.length} active templates\n`);
    
    if (templates.length === 0) {
      console.log('❌ No templates found. Please run the seeder first:');
      console.log('npm run seed:templates');
      process.exit(1);
    }
    
    // Create output directory
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Test each template
    for (const template of templates) {
      console.log(`🎨 Testing template: ${template.name} (${template.category})`);
      
      // Render template
      const result = renderer.render(template, sampleData);
      
      if (result.success) {
        // Create complete HTML file with simplified styling
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sampleData.personalInfo.fullName} - Resume</title>
    <style>
        /* Basic reset and page setup */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root { 
            --template-bg: ${template.styling?.colors?.background || '#ffffff'}; 
        }
        
        body {
            margin: 0;
            padding: 0;
            background: var(--template-bg);
        }
        
        /* Template CSS from renderer */
        ${result.css}
        
        /* Resume container styling */
        .resume {
            margin: 0 auto;
            max-width: 8.5in;
            min-height: 100vh;
            background: var(--template-bg);
        }
        
        /* Default padding for templates without color block headers */
        .resume:not(.professional-corporate):not(.professional-executive):not(.bold-accent) {
            padding: 0.5in 0.35in;
        }
        
        /* No padding for color block header templates - they handle their own padding */
        .resume.professional-corporate,
        .resume.professional-executive,
        .resume.bold-accent {
            padding: 0;
        }
        
        /* Unified header spacing for all templates */
        .resume .header {
            margin-top: 0;
            padding-top: 0;
        }
        
        /* Ensure consistent top spacing for all templates */
        .resume > *:first-child {
            margin-top: 0;
            padding-top: 0;
        }
        
        /* Conditional page margins for multi-page PDFs with background color */
        @page :first {
            margin: 0in 0in 0.5in 0in; /* No top margin on first page */
            background-color: var(--template-bg);
        }
        
        @page {
            margin: 0.5in 0in 0.5in 0in; /* Top margin on subsequent pages */
            background-color: var(--template-bg);
        }
        
        /* Remove bottom spacing from the last element */
        .resume > *:last-child,
        .resume section:last-child,
        .resume .section:last-child,
        .resume .work-experience:last-child,
        .resume .education:last-child,
        .resume .skills:last-child,
        .resume .projects:last-child,
        .resume .achievements:last-child,
        .resume .certifications:last-child,
        .resume .languages:last-child,
        .resume .summary:last-child,
        .resume .custom-fields:last-child,
        .resume .main-content > *:last-child,
        .resume .sidebar > *:last-child,
        .resume .content-grid > *:last-child {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        
        /* Also remove bottom spacing from last items within sections */
        .resume .job-item:last-child,
        .resume .edu-item:last-child,
        .resume .project-item:last-child,
        .resume .cert-item:last-child,
        .resume .achievement-item:last-child,
        .resume .skill-category:last-child,
        .resume .language-item:last-child,
        .resume .custom-field:last-child {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
    </style>
</head>
<body>
    ${result.html}
</body>
</html>
        `;
        
        // Save rendered template
        const filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}_resume.html`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, fullHtml);
        
        console.log(`   ✅ Generated: ${filename}`);
        
        // Generate summary
        const htmlLength = result.html.length;
        const cssLength = result.css.length;
        console.log(`   📊 HTML: ${htmlLength} chars, CSS: ${cssLength} chars`);
        
        // Test with minimal data
        const minimalData = {
          personalInfo: {
            fullName: 'Jane Smith',
            email: 'jane.smith@email.com'
          },
          summary: 'Recent graduate seeking entry-level position.',
          workExperience: [],
          education: [{
            degree: 'Bachelor of Arts',
            institution: 'State University',
            startDate: '2019-09-01',
            endDate: '2023-05-30',
            isCurrentlyStudying: false
          }],
          skills: [],
          projects: [],
          achievements: [],
          certifications: [],
          languages: []
        };
        
        const minimalResult = renderer.render(template, minimalData);
        if (minimalResult.success) {
          console.log(`   ✅ Minimal data test passed`);
        } else {
          console.log(`   ❌ Minimal data test failed: ${minimalResult.error}`);
        }
        
      } else {
        console.log(`   ❌ Rendering failed: ${result.error}`);
      }
      
      console.log('');
    }
    
    // Generate a comparison HTML file
    const comparisonHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Templates Comparison</title>
    <style>
        body {
            font-family: Inter, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5rem;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2rem;
            color: #6b7280;
        }
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        .template-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .template-card:hover {
            transform: translateY(-2px);
        }
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .template-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
        }
        .template-category {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .template-description {
            color: #6b7280;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .template-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 15px;
        }
        .tag {
            background: #f3f4f6;
            color: #374151;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .template-link {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.2s;
        }
        .template-link:hover {
            background: #2563eb;
        }
        .tier-badge {
            background: #10b981;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .tier-badge.pro_monthly,
    .tier-badge.pro_yearly {
            background: #f59e0b;
        }
        .tier-badge.enterprise {
            background: #8b5cf6;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #3b82f6;
        }
        .stat-label {
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Resume Templates Gallery</h1>
            <p>Professional resume templates for every career stage</p>
        </div>
        
        <div class="templates-grid">
            ${templates.map(template => `
                <div class="template-card">
                    <div class="template-header">
                        <div class="template-name">${template.name}</div>
                        <div class="template-category">${template.category}</div>
                    </div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        <span class="tier-badge ${template.availability.tier}">${template.availability.tier}</span>
                    </div>
                    <a href="${template.name.replace(/\s+/g, '_').toLowerCase()}_resume.html" class="template-link">
                        View Template
                    </a>
                </div>
            `).join('')}
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${templates.length}</div>
                <div class="stat-label">Total Templates</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${templates.filter(t => t.availability.tier === 'free').length}</div>
                <div class="stat-label">Free Templates</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${templates.filter(t => t.availability.tier === 'pro_monthly' || t.availability.tier === 'pro_yearly').length}</div>
                <div class="stat-label">Pro Templates</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${[...new Set(templates.map(t => t.category))].length}</div>
                <div class="stat-label">Categories</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.875rem;">
            <p>All templates are generated with sample data for demonstration purposes.</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>
    `;
    
    const comparisonPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(comparisonPath, comparisonHtml);
    
    console.log('📊 Template Testing Summary:');
    console.log('==========================');
    console.log(`✅ Total templates tested: ${templates.length}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`🌐 Open index.html to view all templates`);
    console.log('');
    
    // Print template breakdown
    const categories = {};
    const tiers = {};
    
    templates.forEach(template => {
      categories[template.category] = (categories[template.category] || 0) + 1;
      tiers[template.availability.tier] = (tiers[template.availability.tier] || 0) + 1;
    });
    
    console.log('📋 Templates by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    console.log('');
    console.log('💎 Templates by Tier:');
    Object.entries(tiers).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count}`);
    });
    
    console.log('\n🎉 Template testing completed successfully!');
    console.log(`\nNext steps:`);
    console.log(`1. Open ${outputDir}/index.html in your browser`);
    console.log(`2. Review each template with the sample data`);
    console.log(`3. Templates are ready for production use`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing templates:', error);
    process.exit(1);
  }
};

// Run the test
testTemplates();