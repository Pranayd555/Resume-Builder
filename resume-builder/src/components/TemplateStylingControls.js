import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';

const TemplateStylingControls = ({ resumeId, currentStyling, onStylingUpdate }) => {
  const [styling, setStyling] = useState({
    headerLevel: 'h3',
    fontSize: 16,
    lineSpacing: 1.5,
    sectionSpacing: 5
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentStyling?.template) {
      setStyling({
        headerLevel: currentStyling.template.headerLevel || 'h3',
        fontSize: currentStyling.template.fontSize || 16,
        lineSpacing: currentStyling.template.lineSpacing || 1.5,
        sectionSpacing: currentStyling.template.sectionSpacing || 5
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Edit Template
      </h3>

      {/* Header Level */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Header</h4>
        <div className="grid grid-cols-5 gap-2">
          {headerLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleStylingChange('headerLevel', level.value)}
              disabled={updating}
              className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium ${
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

      {/* Font Size */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fonts (1-30)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Size: {styling.fontSize}px</span>
            <span className="text-xs text-gray-500">Aa</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={styling.fontSize}
            onChange={(e) => handleStylingChange('fontSize', parseInt(e.target.value))}
            disabled={updating}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>30</span>
          </div>
        </div>
      </div>

      {/* Line Spacing */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Line Spacing (1-10)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Spacing: {styling.lineSpacing}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={styling.lineSpacing}
            onChange={(e) => handleStylingChange('lineSpacing', parseFloat(e.target.value))}
            disabled={updating}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Section Spacing */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Section Spacing (1-10)</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Spacing: {styling.sectionSpacing}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={styling.sectionSpacing}
            onChange={(e) => handleStylingChange('sectionSpacing', parseFloat(e.target.value))}
            disabled={updating}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        Changes are applied instantly to your resume preview. All styling options are saved automatically.
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default TemplateStylingControls; 