import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResumeTemplates() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('modern');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = {
    modern: [
      {
        id: 1,
        name: 'Sleek & Professional',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kK5gdk9tK44kSP5YFnYEaTC_rteb8VPu1yXTFiYrzLq8y7KQd3cPJ6k6Jj35YqJn1CgnRZqSDulZ00olt1sBfYIbuvCr-gqgKfydfndMyA5QEQNnYqa4c3lJOVw-c1QEeDh5OVDFBiVQDyj_wAJYOFjcnBzjzcE2XaDWL-rIThjBVbU4ROWtdJJ1uyp_8JvhJl6terEfG8tybNMHh7avwGGKTW1CrlF3EDXdhiWRCT4ntGmgvYnwrU-HpXGhboHbnhgf7GVrUn6F'
      },
      {
        id: 2,
        name: 'Minimalist Design',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9SW-I-E21JhsLyzmEzLBzSN3QTwaz4xbh5zmHoKA6t080zzJ6r5BZBGFulPaDsRQcSZ3bXufmJp1QCrod4PE1LMDLhfn7_94Qn3-SwILRC1liqtq4cJD0WmFL_GOrgC7zvaWJPW5GTRmzjcKCv6fBf0QpSFByK6EMJgfbegaB0Bn2JqIzcT1ofjK5xNQ6yDZGwuULUC1ECfmvQfthQG_-e2vPIXs7KkkaCryZNQcKHSUKcF7FKn8fjBtEuhmiq6qRiUtPmbt9DNui'
      },
      {
        id: 3,
        name: 'Bold & Modern',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYwMiPxm9dsPhx2oWfQsd8yPNEL9NvVX-qTRWZ9yN8djedbfx8AzwF3lLhIU9n9haj5njmMyFTyLwExKi6ERjfkYtuHogZ6kNMFTyn2Y8vCRMyYMXO3IWZVElRKZGG3Bz_mZBlCl-iMH8UGETSlkyXIqD74icFNxIv_e-duQ-doULURX5nWPP2bIX89--EkdvZhvqzD1pEsPCnNKYL-a9C87N953T20_RGzEYWeZx3hVvV4YPyvSjdHovDiOG7FkQcXI7wgxiXUoTa'
      }
    ],
    classic: [
      {
        id: 4,
        name: 'Traditional Classic',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kK5gdk9tK44kSP5YFnYEaTC_rteb8VPu1yXTFiYrzLq8y7KQd3cPJ6k6Jj35YqJn1CgnRZqSDulZ00olt1sBfYIbuvCr-gqgKfydfndMyA5QEQNnYqa4c3lJOVw-c1QEeDh5OVDFBiVQDyj_wAJYOFjcnBzjzcE2XaDWL-rIThjBVbU4ROWtdJJ1uyp_8JvhJl6terEfG8tybNMHh7avwGGKTW1CrlF3EDXdhiWRCT4ntGmgvYnwrU-HpXGhboHbnhgf7GVrUn6F'
      },
      {
        id: 5,
        name: 'Elegant Classic',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9SW-I-E21JhsLyzmEzLBzSN3QTwaz4xbh5zmHoKA6t080zzJ6r5BZBGFulPaDsRQcSZ3bXufmJp1QCrod4PE1LMDLhfn7_94Qn3-SwILRC1liqtq4cJD0WmFL_GOrgC7zvaWJPW5GTRmzjcKCv6fBf0QpSFByK6EMJgfbegaB0Bn2JqIzcT1ofjK5xNQ6yDZGwuULUC1ECfmvQfthQG_-e2vPIXs7KkkaCryZNQcKHSUKcF7FKn8fjBtEuhmiq6qRiUtPmbt9DNui'
      }
    ],
    creative: [
      {
        id: 6,
        name: 'Creative Portfolio',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYwMiPxm9dsPhx2oWfQsd8yPNEL9NvVX-qTRWZ9yN8djedbfx8AzwF3lLhIU9n9haj5njmMyFTyLwExKi6ERjfkYtuHogZ6kNMFTyn2Y8vCRMyYMXO3IWZVElRKZGG3Bz_mZBlCl-iMH8UGETSlkyXIqD74icFNxIv_e-duQ-doULURX5nWPP2bIX89--EkdvZhvqzD1pEsPCnNKYL-a9C87N953T20_RGzEYWeZx3hVvV4YPyvSjdHovDiOG7FkQcXI7wgxiXUoTa'
      },
      {
        id: 7,
        name: 'Artistic Design',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kK5gdk9tK44kSP5YFnYEaTC_rteb8VPu1yXTFiYrzLq8y7KQd3cPJ6k6Jj35YqJn1CgnRZqSDulZ00olt1sBfYIbuvCr-gqgKfydfndMyA5QEQNnYqa4c3lJOVw-c1QEeDh5OVDFBiVQDyj_wAJYOFjcnBzjzcE2XaDWL-rIThjBVbU4ROWtdJJ1uyp_8JvhJl6terEfG8tybNMHh7avwGGKTW1CrlF3EDXdhiWRCT4ntGmgvYnwrU-HpXGhboHbnhgf7GVrUn6F'
      }
    ]
  };

  const handleBack = () => {
    navigate('/resume-list');
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      console.log('Applying template:', selectedTemplate);
      navigate('/resume-form', { state: { template: selectedTemplate } });
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-orange-50/90 shadow-sm border-b border-gray-200 dark:border-orange-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Resume Templates</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-orange-50/90 border-b border-gray-200 dark:border-orange-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {Object.keys(templates).map((category) => (
              <button 
                key={category}
                className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === category 
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates[activeCategory].map((template) => (
            <div 
              key={template.id}
              className={`template-card cursor-pointer group ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview - A4 Aspect Ratio */}
              <div className="relative">
                <div className="template-image-container">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="template-image"
                    loading="lazy"
                  />
                </div>
                
                {/* Selection Indicator */}
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional resume template
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-orange-50/90 border-t border-gray-200 dark:border-orange-200/40 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              selectedTemplate 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedTemplate ? 'Apply Template' : 'Select a Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeTemplates;
