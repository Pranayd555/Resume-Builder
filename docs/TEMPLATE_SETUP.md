# Template Setup Guide

## Quick Fix for "No default template available" Error

The error occurs because there are no templates in the database yet. Follow these steps to resolve it:

### Option 1: Seed Default Templates (Recommended)

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Create an admin user** (if you haven't already):
   - Register a new user through the frontend
   - In MongoDB, update the user's role to 'admin':
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" }, 
     { $set: { role: "admin" } }
   )
   ```

3. **Seed default templates**:
   ```bash
   # Login as admin and get your JWT token, then:
   curl -X POST http://localhost:5000/api/templates/seed \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   Or use Postman/Thunder Client:
   - Method: POST
   - URL: `http://localhost:5000/api/templates/seed`
   - Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Option 2: Manual Database Insert

If you prefer to insert templates directly into MongoDB:

```javascript
// Connect to your MongoDB database and run:
db.templates.insertMany([
  {
    name: "Modern Professional",
    description: "A clean, modern template perfect for professionals",
    category: "modern",
    preview: {
      thumbnail: {
        url: "https://via.placeholder.com/300x400/2563eb/ffffff?text=Modern+Professional"
      }
    },
    layout: {
      type: "two-column",
      sections: [
        { name: "personalInfo", position: 1, isRequired: true, isVisible: true },
        { name: "summary", position: 2, isRequired: false, isVisible: true },
        { name: "workExperience", position: 3, isRequired: false, isVisible: true },
        { name: "education", position: 4, isRequired: false, isVisible: true },
        { name: "skills", position: 5, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        text: "#1f2937",
        background: "#ffffff"
      },
      fonts: {
        primary: "Inter",
        secondary: "Inter",
        sizes: { heading: 24, subheading: 18, body: 12 }
      }
    },
    availability: {
      tier: "free",
      isPublic: true,
      isActive: true
    },
    templateCode: {
      html: "<div class='resume modern-professional'><header><h1>{{personalInfo.fullName}}</h1></header></div>",
      css: ".resume.modern-professional { font-family: Inter, sans-serif; }"
    },
    creator: ObjectId("YOUR_ADMIN_USER_ID"),
    tags: ["professional", "modern", "clean"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // Add more templates as needed
]);
```

### What This Fixes:

1. **Form Data Saving**: Now works without requiring a template
2. **Template Selection**: Users will have templates to choose from
3. **Complete Flow**: Form → Template Selection → Preview → Download

### Default Templates Created:

1. **Modern Professional** (Free) - Clean, two-column layout
2. **Classic Traditional** (Free) - Traditional single-column format  
3. **Creative Designer** (Pro) - Creative sidebar layout with gradients

### Verification:

After setup, verify templates are available:
```bash
curl http://localhost:5000/api/templates
```

You should see the templates in the response. Now users can:
1. ✅ Fill out the resume form (no more template error!)
2. ✅ Select from available templates
3. ✅ Preview their resume
4. ✅ Download in PDF/DOCX format

### Next Steps:

- The resume form will now save successfully
- Users will see template options in the template selection step
- You can add more templates using the admin interface or API 