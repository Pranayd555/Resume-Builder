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
      navigate('/resume-editor', { state: { template: selectedTemplate } });
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <div 
            className="text-[#111818] flex size-12 shrink-0 items-center cursor-pointer"
            onClick={handleBack}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </div>
          <h2 className="text-[#111818] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Resume Templates</h2>
        </div>
        <div className="pb-3">
          <div className="flex border-b border-[#dbe6e6] px-4 gap-8">
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeCategory === 'modern' 
                  ? 'border-b-[#111818] text-[#111818]' 
                  : 'border-b-transparent text-[#608a8a]'
              }`}
              onClick={() => setActiveCategory('modern')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeCategory === 'modern' ? 'text-[#111818]' : 'text-[#608a8a]'
              }`}>Modern</p>
            </button>
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeCategory === 'classic' 
                  ? 'border-b-[#111818] text-[#111818]' 
                  : 'border-b-transparent text-[#608a8a]'
              }`}
              onClick={() => setActiveCategory('classic')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeCategory === 'classic' ? 'text-[#111818]' : 'text-[#608a8a]'
              }`}>Classic</p>
            </button>
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeCategory === 'creative' 
                  ? 'border-b-[#111818] text-[#111818]' 
                  : 'border-b-transparent text-[#608a8a]'
              }`}
              onClick={() => setActiveCategory('creative')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeCategory === 'creative' ? 'text-[#111818]' : 'text-[#608a8a]'
              }`}>Creative</p>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {templates[activeCategory].map((template) => (
            <div 
              key={template.id}
              className={`flex flex-col gap-3 pb-3 cursor-pointer ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-[#0cf2f2] rounded-xl' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl"
                style={{ backgroundImage: `url("${template.image}")` }}
              ></div>
              <p className="text-[#111818] text-base font-medium leading-normal">{template.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 text-[#111818] text-base font-bold leading-normal tracking-[0.015em] ${
              selectedTemplate ? 'bg-[#0cf2f2]' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="truncate">Apply Template</span>
          </button>
        </div>
        <div className="h-5 bg-white"></div>
      </div>
    </div>
  );
}

export default ResumeTemplates;
