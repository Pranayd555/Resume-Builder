# Resume Templates System

This document provides a comprehensive guide to the resume templates system, including template creation, rendering, and testing.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Template Varieties](#template-varieties)
3. [Quick Start](#quick-start)
4. [Template Structure](#template-structure)
5. [Available Templates](#available-templates)
6. [Testing Templates](#testing-templates)
7. [Creating Custom Templates](#creating-custom-templates)
8. [Template Rendering](#template-rendering)
9. [API Usage](#api-usage)

## 🎯 Overview

The resume templates system provides a flexible, scalable solution for creating professional resumes with various designs and layouts. Templates use Handlebars templating engine with custom helpers for formatting dates, calculations, and conditional rendering.

### Key Features

- **Multiple Categories**: Modern, Classic, Creative, Minimalist, Professional, Academic
- **Responsive Layouts**: Single-column, Two-column, Three-column, Sidebar layouts
- **Tier System**: Free, Pro, Enterprise templates
- **Dynamic Rendering**: Templates adapt to available data
- **Print-Ready**: Optimized for PDF generation
- **Customizable**: Colors, fonts, and spacing can be adjusted

## 🎨 Template Varieties

### Modern Templates
- **Modern Professional**: Clean two-column layout with blue accents
- **Modern Executive**: Sophisticated single-column with gold highlights

### Creative Templates
- **Creative Designer**: Vibrant sidebar layout with gradients and icons
- **Portfolio Showcase**: Project-focused with visual elements

### Classic Templates
- **Classic Traditional**: Timeless black and white format
- **Academic Research**: Formal layout for academic positions

### Minimalist Templates
- **Minimalist Clean**: Simple, content-focused design
- **Elegant Simple**: Clean lines with subtle styling

### Professional Templates
- **Professional Corporate**: Business-focused two-column layout
- **Executive Summary**: Leadership-oriented design

### Academic Templates
- **Academic Research**: Comprehensive layout for research positions
- **Scholar Format**: Publication-focused template

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment

```bash
cp env.template .env
# Configure your environment variables
```

### 3. Seed Templates

```bash
npm run seed:all-templates
```

### 4. Test Templates

```bash
npm run test:templates
```

This will generate HTML files in the `output/` directory that you can view in your browser.

## 🏗️ Template Structure

### Template Object Schema

```javascript
{
  name: "Template Name",
  description: "Template description",
  category: "modern|classic|creative|minimalist|professional|academic",
  layout: {
    type: "single-column|two-column|three-column|sidebar",
    sections: [
      {
        name: "personalInfo|summary|workExperience|education|skills|projects|achievements|certifications|languages",
        position: 1,
        isRequired: true,
        isVisible: true
      }
    ]
  },
  styling: {
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#0ea5e9",
      text: "#1f2937",
      background: "#ffffff"
    },
    fonts: {
      primary: "Inter",
      secondary: "Inter",
      sizes: {
        heading: 24,
        subheading: 18,
        body: 12,
        small: 10
      }
    }
  },
  availability: {
    tier: "free|pro|enterprise",
    isPublic: true,
    isActive: true
  },
  templateCode: {
    html: "Handlebars template HTML",
    css: "CSS styles"
  }
}
```

## 📄 Available Templates

### Free Templates (3)
- **Modern Professional**: Blue theme, two-column layout
- **Classic Traditional**: Black and white, single-column
- **Minimalist Clean**: Simple, content-focused

### Pro Templates (3)
- **Modern Executive**: Gold theme, sophisticated layout
- **Creative Designer**: Gradient sidebar, project-focused
- **Academic Research**: Comprehensive academic format

### Enterprise Templates (1)
- **Professional Corporate**: Advanced business layout

## 🧪 Testing Templates

### Run Template Tests

```bash
npm run test:templates
```

### Test Output

The test creates:
- Individual HTML files for each template
- `index.html` - Gallery view of all templates
- Template statistics and breakdown

### Test Data

Tests use both comprehensive sample data and minimal data to ensure templates work with various data completeness levels.

## 🎨 Creating Custom Templates

### 1. Define Template Structure

```javascript
const newTemplate = {
  name: 'Custom Template',
  description: 'Your custom template description',
  category: 'modern',
  layout: {
    type: 'single-column',
    sections: [
      { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
      { name: 'workExperience', position: 2, isRequired: false, isVisible: true }
    ]
  },
  templateCode: {
    html: `
      <div class="resume custom-template">
        <header>
          <h1>{{personalInfo.fullName}}</h1>
          <p>{{personalInfo.email}}</p>
        </header>
        {{#if workExperience}}
          <section class="experience">
            <h2>Experience</h2>
            {{#each workExperience}}
              <div class="job">
                <h3>{{jobTitle}}</h3>
                <p>{{company}}</p>
              </div>
            {{/each}}
          </section>
        {{/if}}
      </div>
    `,
    css: `
      .resume.custom-template {
        font-family: Arial, sans-serif;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 1in;
      }
      h1 { color: #333; }
      h2 { color: #666; }
    `
  }
};
```

### 2. Available Handlebars Helpers

```javascript
// Date formatting
{{formatDate startDate}}           // "Mar 2020"
{{formatDateFull startDate}}       // "March 15, 2020"

// Calculations
{{yearsOfExperience workExperience}}  // Total years
{{getEducationLevel education}}       // Highest degree

// Conditionals
{{#if summary}}...{{/if}}
{{#each workExperience}}...{{/each}}
{{#unless isCurrentJob}}...{{/unless}}

// String manipulation
{{capitalize jobTitle}}
{{uppercase degree}}
{{truncate description 100}}

// Utilities
{{formatPhoneNumber phone}}
{{formatUrl website}}
{{getInitials fullName}}
```

### 3. CSS Variables

Templates support CSS variables for consistent styling:

```css
.resume {
  color: var(--color-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
}
```

## 🔧 Template Rendering

### Using the Template Renderer

```javascript
const OptimizedTemplateRenderer = require('./utils/templateRenderer');
const renderer = new OptimizedTemplateRenderer();

// Render template with user data
const result = renderer.render(template, resumeData);

if (result.success) {
  console.log('HTML:', result.html);
  console.log('CSS:', result.css);
} else {
  console.error('Error:', result.error);
}
```

### Resume Data Structure

```javascript
const resumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "San Francisco, CA",
    website: "https://johndoe.com",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  },
  summary: "Profile Summary...",
  workExperience: [
    {
      jobTitle: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "2020-01-01",
      endDate: "2023-12-31",
      isCurrentJob: false,
      description: "Job description...",
      achievements: ["Achievement 1", "Achievement 2"]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California",
      location: "Berkeley, CA",
      startDate: "2016-09-01",
      endDate: "2020-05-30",
      isCurrentlyStudying: false,
      gpa: 3.8,
      description: "Relevant coursework..."
    }
  ],
  skills: [
    {
      category: "Programming Languages",
      items: [
        { name: "JavaScript", level: "expert" },
        { name: "Python", level: "advanced" }
      ]
    }
  ],
  projects: [
    {
      name: "Project Name",
      description: "Project description...",
      technologies: ["React", "Node.js"],
      url: "https://project.com",
      githubUrl: "https://github.com/user/project",
      startDate: "2020-01-01",
      endDate: "2020-06-30"
    }
  ],
  achievements: [
    {
      title: "Achievement Title",
      description: "Achievement description...",
      date: "2022-01-01",
      issuer: "Organization"
    }
  ],
  certifications: [
    {
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "2022-01-01",
      expiryDate: "2025-01-01",
      credentialId: "12345",
      url: "https://certification.com"
    }
  ],
  languages: [
    { name: "English", proficiency: "native" },
    { name: "Spanish", proficiency: "conversational" }
  ]
};
```

## 🌐 API Usage

### Get All Templates

```javascript
GET /api/templates
```

Query parameters:
- `category`: Filter by category
- `tier`: Filter by tier (free, pro, enterprise)
- `search`: Search by name or description
- `page`: Page number
- `limit`: Results per page

### Get Template by ID

```javascript
GET /api/templates/:id
```

### Create Template (Admin)

```javascript
POST /api/templates
```

### Apply Template to Resume

```javascript
POST /api/resumes/:id/apply-template
Body: { templateId: "template_id" }
```

### Export Resume

```javascript
GET /api/resumes/:id/export?format=pdf
```

## 📊 Template Statistics

After seeding, templates are loaded from `backend/assets/` into MongoDB and are available via the templates API. The exact count may change as new templates are added to the assets list.

## 🎯 Best Practices

### Template Design
1. **Mobile-First**: Ensure templates work on all screen sizes
2. **Print-Ready**: Use print-specific CSS for PDF generation
3. **Accessibility**: Use semantic HTML and proper contrast ratios
4. **Performance**: Optimize CSS and minimize template complexity

### Data Handling
1. **Graceful Degradation**: Templates should work with missing data
2. **Validation**: Validate data before rendering
3. **Error Handling**: Provide meaningful error messages
4. **Caching**: Cache rendered templates for performance

### Testing
1. **Multiple Data Sets**: Test with complete and minimal data
2. **Edge Cases**: Test with empty sections and long text
3. **Cross-Browser**: Ensure compatibility across browsers
4. **Print Testing**: Test PDF generation quality

## 🚀 Next Steps

1. **Seed Templates**: Run `npm run seed:all-templates`
2. **Test Templates**: Run `npm run test:templates`
3. **View Gallery**: Open `output/index.html` in your browser
4. **Customize**: Modify templates or create new ones
5. **Deploy**: Templates are ready for production use

## 📝 Notes

- Templates use Handlebars for dynamic content
- All templates are responsive and print-ready
- Custom helpers are available for common formatting needs
- Templates can be easily customized through the admin interface
- The system supports unlimited template creation and customization

---

**Happy Template Building!** 🎉 