# Resume Template Catalog

This document describes all available resume templates in the system, organized by category.

## Template Categories

### 🔸 MODERN TEMPLATES (4 templates)

**1. Modern Professional** (Free)
- Clean, modern template perfect for professionals
- Two-column layout with professional styling
- Color scheme: Blue primary, gray secondary
- Sections: Personal Info, Summary, Work Experience, Education, Skills, Projects

**2. Modern Executive** (Pro Monthly)
- Sophisticated modern design for senior professionals and executives
- Single-column layout with executive styling
- Color scheme: Dark gray primary, amber accent
- Sections: Personal Info, Summary, Work Experience, Achievements, Education, Skills

**3. Modern Minimalist** (Free)
- Clean, minimalist design with bold typography and subtle color accents
- Two-column layout with sidebar for skills and certifications
- Color scheme: Blue primary, green accent
- Sections: Personal Info, Summary, Skills, Work Experience, Education, Projects, Certifications

**4. Modern Tech** (Free)
- Tech-focused modern design with clean lines and bold accents
- Single-column layout with dedicated tech stack header
- Color scheme: Cyan primary, purple accent
- Sections: Personal Info, Summary, Skills, Work Experience, Projects, Education, Certifications

### 🔸 CLASSIC TEMPLATES (3 templates)

**1. Classic Traditional** (Free)
- Timeless, traditional resume template
- Single-column layout with classic styling
- Color scheme: Black primary, conservative styling
- Sections: Personal Info, Summary, Work Experience, Education, Skills

**2. Classic Serif** (Free)
- Traditional serif typography with timeless appeal
- Single-column layout with formal styling
- Color scheme: Black primary, traditional serif fonts
- Sections: Personal Info, Summary, Work Experience, Education, Skills, Achievements

**3. Classic Professional** (Free)
- Traditional professional template with conservative styling
- Single-column layout with formal business styling
- Color scheme: Dark gray primary, conservative design
- Sections: Personal Info, Summary, Work Experience, Education, Skills, Certifications

### 🔸 PROFESSIONAL TEMPLATES (3 templates)

**1. Professional Corporate** (Free)
- Clean, corporate design perfect for business professionals
- Two-column layout with skills sidebar
- Color scheme: Blue primary, green accent
- Sections: Personal Info, Summary, Work Experience, Education, Skills, Certifications, Projects

**2. Professional Executive** (Pro Yearly)
- Executive-level professional template with sophisticated design
- Single-column layout with executive header
- Color scheme: Navy blue primary, red accent
- Sections: Personal Info, Summary, Work Experience, Achievements, Education, Skills, Certifications

### 🔸 CREATIVE TEMPLATES (2 templates)

**1. Creative Designer** (Pro Monthly)
- Vibrant, creative design for designers and creative professionals
- Two-column layout with colorful accents
- Color scheme: Multiple vibrant colors, gradient backgrounds
- Sections: Personal Info, Summary, Skills, Projects, Work Experience, Education

**2. Creative Portfolio** (Pro Yearly)
- Vibrant, creative design for artists, designers, and creative professionals
- Two-column layout with creative visual elements
- Color scheme: Pink primary, purple secondary, amber accent
- Sections: Personal Info, Summary, Skills, Projects, Work Experience, Education, Achievements

### 🔸 ACADEMIC TEMPLATES (1 template)

**1. Academic Research** (Pro Monthly)
- Formal academic template for researchers and scholars
- Single-column layout with academic formatting
- Color scheme: Gray primary, purple accent
- Sections: Personal Info, Education, Work Experience, Projects, Skills, Certifications, Achievements

### 🔸 MINIMALIST TEMPLATES (1 template)

**1. Minimalist Clean** (Free)
- Simple, clean design with minimal styling
- Single-column layout with subtle accents
- Color scheme: Minimal black and white with subtle accents
- Sections: Personal Info, Summary, Work Experience, Education, Skills

## Template Features

### Layout Types
- **Single-column**: Traditional layout with sections stacked vertically
- **Two-column**: Modern layout with sidebar for skills/contact info
- **Three-column**: Advanced layout with multiple sidebars (future)

### Availability Tiers
- **Free**: Available to all users
- **Pro Monthly**: Requires premium monthly subscription
- **Pro Yearly**: Requires premium yearly subscription
- **Enterprise**: For enterprise accounts (future)

### Supported Sections
All templates support the following data sections:
- Personal Information (name, email, phone, address, LinkedIn, GitHub, website)
- Professional Summary
- Work Experience (with responsibilities and achievements)
- Education (with GPA support)
- Skills (categorized with proficiency levels)
- Projects (with technologies and descriptions)
- Achievements
- Certifications
- Languages
- Custom Fields

### Template Customization
- **Colors**: Primary, secondary, accent, text, and background colors
- **Fonts**: Primary and secondary font families with size variations
- **Spacing**: Margins, padding, and section spacing
- **Borders**: Style, width, color, and radius options

## Template Usage Statistics

Templates can be monitored for:
- Total usage count
- Monthly usage statistics
- User ratings and reviews
- Performance metrics

## Adding New Templates

To add new templates:
1. Create template definition in `scripts/seed-templates.js`
2. Define HTML structure with Handlebars variables
3. Create corresponding CSS styles
4. Set layout configuration and section ordering
5. Configure availability and pricing tier
6. Run seeding script to add to database

## Template Variables

All templates use Handlebars templating engine with these variables:
- `{{personalInfo.fullName}}` - User's full name
- `{{personalInfo.email}}` - Email address
- `{{personalInfo.phone}}` - Phone number
- `{{personalInfo.address}}` - Physical address
- `{{personalInfo.linkedin}}` - LinkedIn profile URL
- `{{personalInfo.github}}` - GitHub profile URL
- `{{personalInfo.website}}` - Personal website URL
- `{{summary}}` - Professional summary
- `{{workExperience}}` - Array of work experience objects
- `{{education}}` - Array of education objects
- `{{skills}}` - Array of skill category objects
- `{{projects}}` - Array of project objects
- `{{achievements}}` - Array of achievement strings
- `{{certifications}}` - Array of certification objects
- `{{languages}}` - Array of language objects

## Template Quality Standards

All templates must meet these standards:
- **Responsive Design**: Must work on different page sizes
- **Print Friendly**: Must render correctly when printed
- **ATS Compatible**: Must work with Applicant Tracking Systems
- **Professional Appearance**: Must maintain professional standards
- **Data Completeness**: Must handle missing or incomplete data gracefully
- **Accessibility**: Must meet basic accessibility requirements

Last Updated: ${new Date().toLocaleDateString()}
Total Templates: 13