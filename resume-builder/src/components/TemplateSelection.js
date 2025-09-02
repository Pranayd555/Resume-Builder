import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateAPI, resumeAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  const swiperRef = useRef(null);

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
        const templates = response.data.templates.map(t => {
          return {
            ...t,
            preview: {
              ...t.preview,
              thumbnail: {
                ...t.preview.thumbnail,
                url: apiHelpers.normalizeUrl(t.preview.thumbnail.url)
              }
            }
          }
        }) || [];
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
    { value: 'academic', label: 'Academic' },
    { value: 'executive', label: 'Executive' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'tech', label: 'Tech' },
    { value: 'design', label: 'Design' }
  ];

  const getTemplateColor = (category) => {
    switch (category) {
      case 'modern':
        return '#3b82f6'; // Blue-500
      case 'classic':
        return '#6b7280'; // Gray-500
      case 'creative':
        return '#ec4899'; // Pink-500
      case 'minimalist':
        return '#10b981'; // Green-500
      case 'professional':
        return '#8b5cf6'; // Purple-500
      case 'academic':
        return '#6366f1'; // Indigo-500
      case 'executive':
        return '#059669'; // Emerald-600
      case 'corporate':
        return '#dc2626'; // Red-600
      case 'tech':
        return '#0ea5e9'; // Sky-500
      case 'design':
        return '#f59e0b'; // Amber-500
      default:
        return '#3b82f6'; // Blue-500
    }
  };

  const getTemplateGradient = (category) => {
    switch (category) {
      case 'modern':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'classic':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'creative':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'minimalist':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'professional':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'academic':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      case 'executive':
        return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
      case 'corporate':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      case 'tech':
        return 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)';
      case 'design':
        return 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getTemplateGradientLight = (category) => {
    switch (category) {
      case 'modern':
        return 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)';
      case 'classic':
        return 'linear-gradient(135deg, #fce4ec 0%, #fff3e0 100%)';
      case 'creative':
        return 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)';
      case 'minimalist':
        return 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)';
      case 'professional':
        return 'linear-gradient(135deg, #fce4ec 0%, #fff8e1 100%)';
      case 'academic':
        return 'linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%)';
      case 'executive':
        return 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)';
      case 'corporate':
        return 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)';
      case 'tech':
        return 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)';
      case 'design':
        return 'linear-gradient(135deg, #fce4ec 0%, #fff8e1 100%)';
      default:
        return 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)';
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
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Templates...</h3>
          <p className="text-gray-600">Please wait while we fetch available templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Select a professional template that matches your style</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setFilterCategory(category.value)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                  filterCategory === category.value
                    ? 'text-white transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  background: filterCategory === category.value 
                    ? getTemplateGradient(category.value === 'all' ? 'modern' : category.value)
                    : undefined
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Carousel */}
        <div className="relative mb-8">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            loopFillGroupWithBlank={true}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
                centeredSlides: true,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 32,
                centeredSlides: true,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
                centeredSlides: true,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40,
                centeredSlides: true,
              }
            }}
            className="template-swiper"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {filteredTemplates.map((template) => (
              <SwiperSlide key={template._id}>
                <div 
                  className={`template-card bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group ${
                    selectedTemplate === template._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    borderColor: `${getTemplateColor(template.category)}20`,
                    boxShadow: selectedTemplate === template._id 
                      ? `0 25px 50px -12px ${getTemplateColor(template.category)}40`
                      : undefined
                  }}
                >
                  {/* Template Preview - A4 Aspect Ratio (1:1.414) */}
                  <div className="relative">
                    <div 
                      className="template-image-container" 
                      style={{background: getTemplateGradient(template.category)}}
                    >
                      {template.preview?.thumbnail?.url ? (
                        <div className="relative">
                          <img 
                            src={template.preview.thumbnail.url} 
                            alt={template.name}
                            className="template-image rounded-lg shadow-lg"
                            loading="lazy"
                          />
                          
                          {/* Subtle overlay for depth */}
                          <div className="absolute inset-0 rounded-lg bg-black bg-opacity-5 pointer-events-none"></div>
                        </div>
                      ) : (
                        <div className="text-white text-center p-4 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-medium">{template.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Tier Badge */}
                    <div className="absolute top-6 right-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border-2 shadow-lg ${
                        template.availability?.tier === 'free' 
                          ? 'bg-green-500 text-green-100 border-green-200 ' 
                          : template.availability?.tier === 'pro'
                          ? 'bg-blue-500 text-blue-100 border-blue-200'
                          : 'bg-purple-500 text-purple-100 border-purple-200'
                      }`}>
                        {template.availability?.tier?.toUpperCase() || 'FREE'}
                      </span>
                    </div>

                    {/* Loading Overlay */}
                    {selectedTemplate === template._id && selecting && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm">Selecting...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div 
                    className="p-6"
                    style={{
                      background: getTemplateGradientLight(template.category)
                    }}
                  >
                    <h3 className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 text-lg">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                      {template.description || 'Professional resume template'}
                    </p>
                    
                    {/* Category Tag */}
                    <div className="flex items-center justify-between">
                      <span 
                        className={`category-tag text-xs font-semibold px-3 py-2 rounded-full shadow-sm`}
                        style={{
                          color: getTemplateColor(template.category),
                          backgroundColor: `${getTemplateColor(template.category)}15`,
                          border: `1px solid ${getTemplateColor(template.category)}30`
                        }}
                      >
                        {template.category?.charAt(0).toUpperCase() + template.category?.slice(1) || 'Template'}
                      </span>
                      
                      {/* Select Button */}
                      <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-700 transition-colors duration-200">
                        <span>Select</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <div className="swiper-button-prev !w-10 !h-10 !bg-white !rounded-full !shadow-lg !border !border-gray-200 !text-gray-600 hover:!text-blue-600 hover:!shadow-xl !transition-all !duration-200 !top-1/2 !-translate-y-1/2 !left-2 sm:!left-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swiper-button-next !w-10 !h-10 !bg-white !rounded-full !shadow-lg !border !border-gray-200 !text-gray-600 hover:!text-blue-600 hover:!shadow-xl !transition-all !duration-200 !top-1/2 !-translate-y-1/2 !right-2 sm:!right-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Pagination */}
          <div className="swiper-pagination !bottom-2 !static !mt-6"></div>
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
            Edit Your Resume
          </button>
        </div>
      </div>

      {/* Custom CSS for Swiper */}
      <style jsx>{`
        .template-swiper {
          padding: 20px 0;
        }
        
        .swiper-button-prev::after,
        .swiper-button-next::after {
          display: none;
        }
        
        .swiper-pagination-bullet {
          background: rgba(59, 130, 246, 0.5);
          opacity: 0.5;
          transition: all 0.3s ease;
          width: 8px;
          height: 8px;
        }
        
        .swiper-pagination-bullet-active {
          background: #3b82f6;
          opacity: 1;
          transform: scale(1.2);
        }
        
        .swiper-slide {
          transition: transform 0.3s ease;
        }
        
        .swiper-slide-active {
          transform: scale(1.02);
        }
        
        /* Template image styling */
        .template-image {
          width: 100%;
          height: auto;
          object-fit: cover;
          transition: all 0.3s ease;
        }
        
        .template-image-container {
          position: relative;
          overflow: hidden;
        }
        
        /* Enhanced card shadows and borders */
        .template-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .template-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Category tag enhancements */
        .category-tag {
          transition: all 0.2s ease;
        }
        
        .category-tag:hover {
          transform: scale(1.05);
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .template-swiper {
            padding: 10px 0;
          }
          
          .swiper-button-prev,
          .swiper-button-next {
            display: none !important;
          }
          
          .template-card:hover {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}

export default TemplateSelection; 