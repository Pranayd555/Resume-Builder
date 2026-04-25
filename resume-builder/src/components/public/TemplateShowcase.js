import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateAPI, apiHelpers } from '../../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, FreeMode, EffectCoverflow } from 'swiper/modules';
import { useAuth } from '../../contexts/AuthContext';
import { AttentionSeeker, Fade, Flip } from 'react-awesome-reveal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

// Custom styles for pagination dots and navigation buttons matching TemplateSelection
const customPaginationStyles = `
  .template-showcase-swiper {
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
    margin: 0 4px;
    border-radius: 50%;
  }
  
  .swiper-pagination-bullet-active {
    background: #3b82f6;
    opacity: 1;
    transform: scale(1.2);
  }
  
  @media (max-width: 640px) {
    .template-showcase-swiper {
      padding: 10px 0;
    }
    
    .swiper-button-prev,
    .swiper-button-next {
      display: none !important;
    }
  }
`;

function TemplateShowcase() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add ref to prevent duplicate API calls during StrictMode
  const hasFetchedRef = useRef(false);
  const swiperRef = useRef(null);

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
        const templatesData = response.data.templates.map(t => {
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

        // Preload images
        const imagePromises = templatesData.map(template => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = template.preview.thumbnail.url;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve even on error to avoid blocking
          });
        });

        // Wait for all images to load or a timeout of 5 seconds
        await Promise.race([
          Promise.all(imagePromises),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);

        setTemplates(templatesData);
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
        <Flip direction="vertical" duration={3000}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Professional Templates
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose from our collection of professionally designed resume templates.
              Each template is crafted to help you stand out and land your dream job.
            </p>
          </div>
        </Flip>

        {/* Templates Carousel */}
        <div className="relative">
          <Swiper
            ref={swiperRef}
            effect="coverflow"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 1,
              scale: 0.95,
              slideShadows: false,
            }}
            modules={[Navigation, Pagination, Autoplay, FreeMode, EffectCoverflow]}
            spaceBetween={24}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            grabCursor={true}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
                centeredSlides: true,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
                centeredSlides: true,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 16,
                centeredSlides: true,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 20,
                centeredSlides: true,
              }
            }}
            className="template-showcase-swiper"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {templates.map((template) => (
              <SwiperSlide key={template._id}>
                <div className="backdrop-blur-md bg-white/20 dark:bg-white/70 rounded-xl shadow-xl border border-white/20 dark:border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:rounded-xl mt-4">
                  {/* Template Preview */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                      src={template.preview.thumbnail.url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400/64748b/ffffff?text=Template+Preview';
                      }}
                    />

                    {/* Template Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.availability.tier === 'free'
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

        {/* Call to Action */}
        <Fade direction="down">
          <div className="text-center mt-12 sm:mt-16">
            <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8 sm:p-12 max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-500 mb-4">
                Ready to Create Your Professional Resume?
              </h3>
              <div className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                
              <p className="font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Your key, your control, zero cost.
              </p>
              Join thousands of professionals who have already created stunning resumes with our templates.
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AttentionSeeker duration={3000}>
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  </button>
                </AttentionSeeker>
                <button
                  onClick={() => navigate('/contact-us')}
                  className="bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-400 font-semibold py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </Fade>

      </div>
    </section>
  );
}

export default TemplateShowcase;
