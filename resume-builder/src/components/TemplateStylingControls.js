import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';

const TemplateStylingControls = ({ resumeId, currentStyling, onStylingUpdate }) => {
  const [styling, setStyling] = useState({
    headerLevel: 'h3',
    headerFontSize: 18,
    fontSize: 14,
    lineSpacing: 1.5,
    sectionSpacing: 3
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentStyling?.template) {
      setStyling({
        headerLevel: currentStyling.template.headerLevel || 'h3',
        headerFontSize: currentStyling.template.headerFontSize || 18,
        fontSize: currentStyling.template.fontSize || 14,
        lineSpacing: currentStyling.template.lineSpacing || 1.5,
        sectionSpacing: currentStyling.template.sectionSpacing || 3
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Edit Template
      </h3>

      {/* Header Level */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Header Level</h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
          {headerLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleStylingChange('headerLevel', level.value)}
              disabled={updating}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium min-h-[40px] sm:min-h-[44px] ${
                styling.headerLevel === level.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {level.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Header Font Size */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Header Font Size (12-24px)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">Size: {styling.headerFontSize}px</span>
            <span className="text-xs sm:text-sm text-gray-500">H</span>
          </div>
          <input
            type="range"
            min="12"
            max="24"
            value={styling.headerFontSize}
            onChange={(e) => handleStylingChange('headerFontSize', parseInt(e.target.value))}
            disabled={updating}
            className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>12</span>
            <span>24</span>
          </div>
        </div>
      </div>

      {/* Content Font Size */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Content Font Size (12-18px)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">Size: {styling.fontSize}px</span>
            <span className="text-xs sm:text-sm text-gray-500">Aa</span>
          </div>
          <input
            type="range"
            min="12"
            max="18"
            value={styling.fontSize}
            onChange={(e) => handleStylingChange('fontSize', parseInt(e.target.value))}
            disabled={updating}
            className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>12</span>
            <span>18</span>
          </div>
        </div>
      </div>

      {/* Line Spacing */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Line Spacing (1-3)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">Spacing: {styling.lineSpacing}</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={styling.lineSpacing}
            onChange={(e) => handleStylingChange('lineSpacing', parseFloat(e.target.value))}
            disabled={updating}
            className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>3</span>
          </div>
        </div>
      </div>

      {/* Section Spacing */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Section Spacing (1-5)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">Spacing: {styling.sectionSpacing}</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={styling.sectionSpacing}
            onChange={(e) => handleStylingChange('sectionSpacing', parseFloat(e.target.value))}
            disabled={updating}
            className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>5</span>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="mb-2"><strong>Styling Guide:</strong></p>
        <ul className="space-y-1">
          <li>• <strong>Header Level:</strong> Controls the HTML heading tag (H1-H5)</li>
          <li>• <strong>Header Font Size:</strong> Sets the size of section headers (12-24px)</li>
          <li>• <strong>Content Font Size:</strong> Sets the size of body text (12-18px)</li>
          <li>• <strong>Line Spacing:</strong> Controls spacing between lines within elements</li>
          <li>• <strong>Section Spacing:</strong> Adds space between sections and subsections</li>
        </ul>
        <p className="mt-2">Changes are applied instantly to your resume preview and saved automatically.</p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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