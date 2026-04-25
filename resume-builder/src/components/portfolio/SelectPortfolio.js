import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { portfolioAPI } from '../../services/api';
import { PORTFOLIO_TEMPLATE_DESCRIPTIONS, PORTFOLIO_TEMPLATES } from '../../models/dataModels';
import AuthLoader from '../annimations/AuthLoader';

const SelectPortfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(PORTFOLIO_TEMPLATES.MODERN_INTERACTIVE);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const templates = [
    {
      id: PORTFOLIO_TEMPLATES.MODERN_INTERACTIVE,
      name: PORTFOLIO_TEMPLATE_DESCRIPTIONS['modern-interactive'].name,
      description: PORTFOLIO_TEMPLATE_DESCRIPTIONS['modern-interactive'].description,
      features: ['Smooth animations', 'Interactive elements', 'Modern design', 'Fully responsive'],
      color: 'from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800',
      borderColor: 'border-blue-300 dark:border-blue-600'
    },
    {
      id: PORTFOLIO_TEMPLATES.MINIMALIST_PRO,
      name: PORTFOLIO_TEMPLATE_DESCRIPTIONS['minimalist-pro'].name,
      description: PORTFOLIO_TEMPLATE_DESCRIPTIONS['minimalist-pro'].description,
      features: ['Clean layout', 'Content focused', 'Professional', 'Elegant design'],
      color: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
      borderColor: 'border-gray-300 dark:border-gray-600'
    },
    {
      id: PORTFOLIO_TEMPLATES.CREATIVE_DEVELOPER,
      name: PORTFOLIO_TEMPLATE_DESCRIPTIONS['creative-developer'].name,
      description: PORTFOLIO_TEMPLATE_DESCRIPTIONS['creative-developer'].description,
      features: ['Bold design', 'Creative layout', 'Tech-focused', 'Eye-catching'],
      color: 'from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800',
      borderColor: 'border-purple-300 dark:border-purple-600'
    },
    {
      id: PORTFOLIO_TEMPLATES.CORPORATE_EXECUTIVE,
      name: PORTFOLIO_TEMPLATE_DESCRIPTIONS['corporate-executive'].name,
      description: PORTFOLIO_TEMPLATE_DESCRIPTIONS['corporate-executive'].description,
      features: ['Executive style', 'Formal design', 'Professional tone', 'Business ready'],
      color: 'from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800',
      borderColor: 'border-amber-300 dark:border-amber-600'
    }
  ];

  const handleSelectTemplate = async () => {
    try {
      setLoading(true);

      // Get the portfolio ID from location state or fetch current portfolio
      let portfolioData;
      if (location.state?.portfolioData) {
        portfolioData = location.state.portfolioData;
      } else {
        const response = await portfolioAPI.getPortfolio();
        if (!response.success) {
          toast.error('Portfolio not found');
          navigate('/portfolio/edit');
          return;
        }
        portfolioData = response.data;
      }

      // Update portfolio with selected template
      const updateResponse = await portfolioAPI.updatePortfolio(portfolioData.id, {
        template: selectedTemplate
      });

      if (updateResponse.success) {
        toast.success('Template selected successfully!');
        // Navigate to view portfolio for customization
        navigate('/portfolio/view', { state: { portfolioId: updateResponse.data.id } });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to select template');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = () => {
    // Navigate to a preview page to see how the template looks
    navigate('/portfolio/view', { state: { template: selectedTemplate } });
  };

  if (loading) {
    return <AuthLoader />;
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Portfolio Template
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select a design that best represents your professional brand
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 transform ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-blue-400'
              }`}
            >
              {/* Template Preview Container */}
              <div className={`h-80 bg-gradient-to-br ${template.color} p-6 flex flex-col justify-between `}>
                {/* Template Name & Description */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-1">
                  {template.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                      <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Checkmark */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2">
                  <CheckIcon className="w-5 h-5" />
                </div>
              )}

              {/* Hover Overlay */}
              {hoveredTemplate === template.id && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewTemplate();
                  }}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2 text-white">
                    <EyeIcon className="w-6 h-6" />
                    <span className="font-medium">Preview</span>
                  </div>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/portfolio/edit')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Back to Edit
          </button>

          <button
            onClick={handleSelectTemplate}
            disabled={loading}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            {loading ? 'Selecting...' : 'Select Template'}
          </button>
        </div>

        {/* Template Info */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Template Selection Tips
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>• <strong>Modern Interactive:</strong> Best for tech professionals and creative roles</li>
            <li>• <strong>Minimalist Professional:</strong> Perfect for corporate and traditional industries</li>
            <li>• <strong>Creative Developer:</strong> Ideal for designers, developers, and creative professionals</li>
            <li>• <strong>Corporate Executive:</strong> Great for managers, executives, and business professionals</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-4">
            You can customize colors, fonts, and layout after selecting a template
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectPortfolio;