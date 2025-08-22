const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const OptimizedTemplateRenderer = require('../utils/templateRenderer');

// Test data
const testResumeData = {
  title: 'Test Resume',
  personalInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  },
  summary: 'Experienced software developer with 5 years of experience.',
  workExperience: [
    {
      jobTitle: 'Senior Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2023-01-01'),
      description: 'Led development of web applications.',
      achievements: ['Improved performance by 50%', 'Mentored junior developers']
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      location: 'New York, NY',
      startDate: new Date('2015-09-01'),
      endDate: new Date('2019-05-01'),
      gpa: '3.8'
    }
  ],
  skills: [
    {
      category: 'Programming Languages',
      items: [
        { name: 'JavaScript', level: 'expert' },
        { name: 'Python', level: 'advanced' }
      ]
    }
  ]
};

const testStylingOptions = [
  {
    name: 'Default Styling',
    template: {
      headerLevel: 'h3',
      headerFontSize: 18,
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 3
    }
  },
  {
    name: 'Large Headers',
    template: {
      headerLevel: 'h2',
      headerFontSize: 24,
      fontSize: 16,
      lineSpacing: 1.8,
      sectionSpacing: 4
    }
  },
  {
    name: 'Compact Layout',
    template: {
      headerLevel: 'h4',
      headerFontSize: 14,
      fontSize: 12,
      lineSpacing: 1.2,
      sectionSpacing: 2
    }
  }
];

async function testTemplateStyling() {
  try {
    console.log('🧪 Testing Template Styling Functionality...\n');

    // Test 1: Validate Resume Model Schema
    console.log('1. Testing Resume Model Schema...');
    const testResume = new Resume({
      ...testResumeData,
      user: new mongoose.Types.ObjectId(),
      styling: {
        template: testStylingOptions[0].template
      }
    });
    
    await testResume.validate();
    console.log('✅ Resume model validation passed');

    // Test 2: Test different styling combinations
    console.log('\n2. Testing different styling combinations...');
    
    for (const stylingOption of testStylingOptions) {
      console.log(`\n   Testing: ${stylingOption.name}`);
      console.log(`   - Header Level: ${stylingOption.template.headerLevel}`);
      console.log(`   - Header Font Size: ${stylingOption.template.headerFontSize}px`);
      console.log(`   - Content Font Size: ${stylingOption.template.fontSize}px`);
      console.log(`   - Line Spacing: ${stylingOption.template.lineSpacing}`);
      console.log(`   - Section Spacing: ${stylingOption.template.sectionSpacing}`);
      
      // Validate the styling options
      const testStyling = new Resume({
        styling: { template: stylingOption.template }
      });
      
      try {
        await testStyling.validate();
        console.log('   ✅ Styling validation passed');
      } catch (error) {
        console.log('   ❌ Styling validation failed:', error.message);
      }
    }

    // Test 3: Test Template Renderer
    console.log('\n3. Testing Template Renderer...');
    
    const renderer = new OptimizedTemplateRenderer();
    const mockTemplate = {
      templateCode: {
        html: '<div class="resume">{{personalInfo.fullName}}</div>',
        css: '.resume { font-family: Arial; }'
      }
    };

    const testData = {
      ...testResumeData,
      styling: {
        template: testStylingOptions[0].template
      }
    };

    try {
      const renderResult = renderer.render(mockTemplate, testData, 'test-unique-id');
      console.log('✅ Template rendering successful');
      console.log('   Generated CSS length:', renderResult.css.length);
      console.log('   Generated HTML length:', renderResult.html.length);
    } catch (error) {
      console.log('❌ Template rendering failed:', error.message);
    }

    // Test 4: Test API validation rules
    console.log('\n4. Testing API validation rules...');
    
    const validationTests = [
      { headerFontSize: 11, expected: 'fail', description: 'Header font size below minimum (12)' },
      { headerFontSize: 25, expected: 'fail', description: 'Header font size above maximum (24)' },
      { headerFontSize: 18, expected: 'pass', description: 'Header font size within range' },
      { fontSize: 11, expected: 'fail', description: 'Content font size below minimum (12)' },
      { fontSize: 19, expected: 'fail', description: 'Content font size above maximum (18)' },
      { fontSize: 14, expected: 'pass', description: 'Content font size within range' },
      { sectionSpacing: 0.5, expected: 'fail', description: 'Section spacing below minimum (1)' },
      { sectionSpacing: 6, expected: 'fail', description: 'Section spacing above maximum (5)' },
      { sectionSpacing: 3, expected: 'pass', description: 'Section spacing within range' },
      { lineSpacing: 0.5, expected: 'fail', description: 'Line spacing below minimum (1)' },
      { lineSpacing: 4, expected: 'fail', description: 'Line spacing above maximum (3)' },
      { lineSpacing: 1.5, expected: 'pass', description: 'Line spacing within range' }
    ];

    for (const test of validationTests) {
      const testStyling = new Resume({
        styling: { template: test }
      });
      
      try {
        await testStyling.validate();
        if (test.expected === 'pass') {
          console.log(`   ✅ ${test.description}`);
        } else {
          console.log(`   ❌ ${test.description} - should have failed`);
        }
      } catch (error) {
        if (test.expected === 'fail') {
          console.log(`   ✅ ${test.description}`);
        } else {
          console.log(`   ❌ ${test.description} - should have passed`);
        }
      }
    }

    console.log('\n🎉 All template styling tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection if it was opened
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTemplateStyling();
}

module.exports = { testTemplateStyling };
