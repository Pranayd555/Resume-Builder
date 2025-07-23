import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateAPI, resumeAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';

function TemplateSelection() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Add ref to prevent duplicate API calls during StrictMode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls during React StrictMode in development
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      
      if (response.success) {
        const templates = response.data.templates || [];
        setTemplates(templates);
      } else {
        throw new Error(response.error || 'Failed to fetch templates');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    try {
      setSelecting(true);
      setSelectedTemplate(template._id);
      
      const response = await resumeAPI.selectTemplate(resumeId, {
        templateId: template._id
      });
      
      if (response.success) {
        toast.success('Template selected successfully!');
        navigate(`/resume-preview/${resumeId}`);
      } else {
        throw new Error(response.error || 'Failed to select template');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setSelecting(false);
      setSelectedTemplate(null);
    }
  };

  const filteredTemplates = templates.filter(template => 
    filterCategory === 'all' || template.category === filterCategory
  );

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'professional', label: 'Professional' },
    { value: 'academic', label: 'Academic' }
  ];

  const getTemplateColor = (category) => {
    switch (category) {
      case 'modern':
        return 'from-blue-400 to-blue-600';
      case 'classic':
        return 'from-gray-400 to-gray-600';
      case 'creative':
        return 'from-pink-400 to-pink-600';
      case 'minimalist':
        return 'from-green-400 to-green-600';
      case 'professional':
        return 'from-purple-400 to-purple-600';
      case 'academic':
        return 'from-indigo-400 to-indigo-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Templates...</h3>
          <p className="text-gray-600">Please wait while we fetch available templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Template
          </h1>
          <p className="text-gray-600 text-lg">Select a professional template that matches your style</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setFilterCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterCategory === category.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:bg-white/90 border border-white/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>



        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template._id}
              className={`backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group ${
                selectedTemplate === template._id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview */}
              <div className="relative">
                <div className={`w-full h-48 bg-gradient-to-br ${getTemplateColor(template.category)} flex items-center justify-center`}>
                  {template.preview?.thumbnail?.url ? (
                    <img 
                      src={template.preview.thumbnail.url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs mt-1 opacity-75">No thumbnail URL</p>
                    </div>
                  )}
                </div>

                {/* Tier Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTierBadgeColor(template.availability?.tier)}`}>
                    {template.availability?.tier?.toUpperCase() || 'FREE'}
                  </span>
                </div>

                {/* Loading Overlay */}
                {selectedTemplate === template._id && selecting && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm">Selecting...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {template.description || 'Professional resume template'}
                </p>
                
                {/* Category Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {template.category?.charAt(0).toUpperCase() + template.category?.slice(1) || 'Template'}
                  </span>
                  
                  {/* Select Button */}
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
                    <span>Select</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-600 mb-4">
              {filterCategory === 'all' 
                ? 'No templates are available at the moment.' 
                : `No templates found in the "${filterCategory}" category.`
              }
            </p>
            {filterCategory !== 'all' && (
              <button
                onClick={() => setFilterCategory('all')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Templates
              </button>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/resume-form', { state: { resumeId, editMode: true } })}
            disabled={selecting}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelection; 