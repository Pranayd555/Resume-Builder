import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import { 
  SwatchIcon, 
  ChevronUpDownIcon, 
  ArrowsPointingOutIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const TemplateStylingControls = ({ resumeId, currentStyling, onStylingUpdate }) => {
  const [styling, setStyling] = useState({
    headerLevel: 'h3',
    headerFontSize: 18,
    fontSize: 14,
    lineSpacing: 1.3,
    sectionSpacing: 1
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentStyling?.template) {
      setStyling({
        headerLevel: currentStyling.template.headerLevel || 'h3',
        headerFontSize: currentStyling.template.headerFontSize || 18,
        fontSize: currentStyling.template.fontSize || 14,
        lineSpacing: currentStyling.template.lineSpacing || 1.3,
        sectionSpacing: currentStyling.template.sectionSpacing || 1
      });
    }
  }, [currentStyling]);

  const handleStylingChange = async (key, value) => {
    const newStyling = { ...styling, [key]: value };
    setStyling(newStyling);

    try {
      setUpdating(true);
      const response = await resumeAPI.updateTemplateStyling(resumeId, newStyling);
      
      if (response.success) {
        // Call the parent callback to update the preview
        if (onStylingUpdate) {
          onStylingUpdate(response.data.resume);
        }
        toast.success('Template styling updated!');
      } else {
        throw new Error(response.error || 'Failed to update styling');
      }
    } catch (error) {
      console.error('Error updating template styling:', error);
      toast.error('Failed to update template styling');
      // Revert the change
      setStyling(prev => ({ ...prev, [key]: styling[key] }));
    } finally {
      setUpdating(false);
    }
  };

  const headerLevels = [
    { value: 'h1', label: 'H1', icon: 'H1' },
    { value: 'h2', label: 'H2', icon: 'H2' },
    { value: 'h3', label: 'H3', icon: 'H3' },
    { value: 'h4', label: 'H4', icon: 'H4' },
    { value: 'h5', label: 'H5', icon: 'H5' }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 backdrop-blur-sm">
             <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
         <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md">
           <SwatchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
         </div>
         <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Edit Template</span>
       </h3>

                                                       {/* Header Level */}
         <div className="mb-4 sm:mb-6">
           <h4 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
             <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
             Header Level
           </h4>
           <div className="grid grid-cols-5 gap-2">
           {headerLevels.map((level) => (
             <button
               key={level.value}
               onClick={() => handleStylingChange('headerLevel', level.value)}
               disabled={updating}
                               className={`px-2 py-2 rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-sm font-bold min-h-[40px] transform hover:scale-105 active:scale-95 ${
                  styling.headerLevel === level.value
                    ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 shadow-sm hover:shadow-md'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {level.icon}
             </button>
           ))}
         </div>
       </div>

                                                       {/* Header Font Size */}
         <div className="mb-4 sm:mb-6">
           <h4 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
             <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
             Header Font Size (12-24px)
           </h4>
           <div className="space-y-2">
             <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
               <span className="text-sm font-medium text-gray-700">Size: {styling.headerFontSize}px</span>
               <span className="text-base font-bold text-purple-600">H</span>
             </div>
                                    <input
               type="range"
               min="12"
               max="24"
               value={styling.headerFontSize}
               onChange={(e) => handleStylingChange('headerFontSize', parseInt(e.target.value))}
               disabled={updating}
               className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider"
             />
             <div className="flex justify-between text-xs text-gray-500 font-medium">
               <span>12px</span>
               <span>24px</span>
             </div>
         </div>
       </div>

                                                       {/* Content Font Size */}
         <div className="mb-4 sm:mb-6">
           <h4 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
             <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
             Content Font Size (12-18px)
           </h4>
           <div className="space-y-2">
             <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
               <span className="text-sm font-medium text-gray-700">Size: {styling.fontSize}px</span>
               <span className="text-base font-bold text-purple-600">Aa</span>
             </div>
                                    <input
               type="range"
               min="12"
               max="18"
               value={styling.fontSize}
               onChange={(e) => handleStylingChange('fontSize', parseInt(e.target.value))}
               disabled={updating}
               className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider"
             />
             <div className="flex justify-between text-xs text-gray-500 font-medium">
               <span>12px</span>
               <span>18px</span>
             </div>
         </div>
       </div>

                                                       {/* Line Spacing */}
         <div className="mb-4 sm:mb-6">
           <h4 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
             <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
             Line Spacing (1-3)
           </h4>
           <div className="space-y-2">
             <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
               <span className="text-sm font-medium text-gray-700">Spacing: {styling.lineSpacing}</span>
               <ChevronUpDownIcon className="w-4 h-4 text-purple-600" />
             </div>
                                    <input
               type="range"
               min="1"
               max="3"
               step="0.1"
               value={styling.lineSpacing}
               onChange={(e) => handleStylingChange('lineSpacing', parseFloat(e.target.value))}
               disabled={updating}
               className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider"
             />
             <div className="flex justify-between text-xs text-gray-500 font-medium">
               <span>1.0</span>
               <span>3.0</span>
             </div>
         </div>
       </div>

                                                       {/* Section Spacing */}
         <div className="mb-4 sm:mb-6">
           <h4 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
             <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
             Section Spacing (1-5)
           </h4>
           <div className="space-y-2">
             <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
               <span className="text-sm font-medium text-gray-700">Spacing: {styling.sectionSpacing}</span>
               <ArrowsPointingOutIcon className="w-4 h-4 text-purple-600" />
             </div>
                                    <input
               type="range"
               min="1"
               max="5"
               step="0.1"
               value={styling.sectionSpacing}
               onChange={(e) => handleStylingChange('sectionSpacing', parseFloat(e.target.value))}
               disabled={updating}
               className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider"
             />
             <div className="flex justify-between text-xs text-gray-500 font-medium">
               <span>1.0</span>
               <span>5.0</span>
             </div>
         </div>
       </div>

                                                       {/* Info Text */}
                  <div className="text-sm text-gray-600 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100 shadow-sm">
             <div className="flex items-center gap-2">
               <InformationCircleIcon className="w-4 h-4 text-purple-600" />
               <p className="font-medium">Changes are applied instantly to your resume preview and saved automatically.</p>
             </div>
           </div>

                           <style jsx="true">{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            cursor: pointer;
            box-shadow: 0 3px 6px rgba(139, 92, 246, 0.3);
            border: 2px solid white;
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
          }
          .slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 3px 6px rgba(139, 92, 246, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
          }
          @media (max-width: 640px) {
            .slider::-webkit-slider-thumb {
              height: 20px;
              width: 20px;
            }
            .slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
            }
          }
        `}</style>
    </div>
  );
};

export default TemplateStylingControls; 