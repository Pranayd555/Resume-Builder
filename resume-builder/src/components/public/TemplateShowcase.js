import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateAPI, apiHelpers } from '../../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useAuth } from '../../contexts/AuthContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Custom styles for pagination dots
const customPaginationStyles = `
  .template-showcase-swiper .swiper-pagination-bullet {
    background: rgba(59, 130, 246, 0.5) !important;
    opacity: 0.5 !important;
    transition: all 0.3s ease !important;
    width: 8px !important;
    height: 8px !important;
  }
  
  .template-showcase-swiper .swiper-pagination-bullet-active {
    background: #3b82f6 !important;
    opacity: 1 !important;
    transform: scale(1.2) !important;
  }
  
  .dark .template-showcase-swiper .swiper-pagination-bullet {
    background: rgba(255, 255, 255, 0.6) !important;
  }
  
  .dark .template-showcase-swiper .swiper-pagination-bullet-active {
    background: #ffffff !important;
  }
`;

function TemplateShowcase() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add ref to prevent duplicate API calls during StrictMode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls during React StrictMode in development
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchTemplates();
  }, []);

  // Inject custom pagination styles
  useEffect(() => {
    const styleId = 'template-showcase-pagination-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = customPaginationStyles;
    
    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplatesPublic();
      
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
          };
        });
        setTemplates(templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Professional Templates
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Choose from our collection of professionally designed resume templates. 
            Each template is crafted to help you stand out and land your dream job.
          </p>
        </div>

        {/* Templates Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom',
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="template-showcase-swiper"
          >
            {templates.map((template) => (
              <SwiperSlide key={template._id}>
                 <div className="backdrop-blur-md bg-white/70 dark:bg-white/70 rounded-xl shadow-xl border border-white/20 dark:border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:rounded-xl mt-4">
                  {/* Template Preview */}
                   <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                      src={template.preview.thumbnail.url}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400/64748b/ffffff?text=Template+Preview';
                      }}
                    />
                    
                    {/* Template Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        template.availability.tier === 'free' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {template.availability.tier === 'free' ? 'Free' : 'Pro'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-600 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-600 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {template.usage?.totalUses || 0} uses
                      </span>
                      <span className="capitalize">{template.category}</span>
                    </div>

                    {/* View Template Button */}
                    <button
                      onClick={handleGetStarted}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {isAuthenticated ? 'Use Template' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

           {/* Custom Navigation Buttons - Hidden on mobile */}
           <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 hidden md:flex">
             <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
           </button>
           
           <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 hidden md:flex">
             <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
           </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination-custom flex justify-center mt-8 space-x-2"></div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8 sm:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-500 mb-4">
              Ready to Create Your Professional Resume?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of professionals who have already created stunning resumes with our templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              <button
                onClick={() => navigate('/contact-us')}
                className="bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-400 font-semibold py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TemplateShowcase;
