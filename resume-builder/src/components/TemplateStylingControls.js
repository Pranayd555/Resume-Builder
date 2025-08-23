import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import { 
  SwatchIcon, 
  ChevronUpDownIcon, 
  ArrowsPointingOutIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const TemplateStylingControls = ({ resumeId, currentStyling, onStylingUpdate, defaultStyling, onClose }) => {
  const [styling, setStyling] = useState({
    headerLevel: 'h3',
    headerFontSize: 18,
    fontSize: 14,
    lineSpacing: 1.3,
    sectionSpacing: 1
  });
  const [originalStyling, setOriginalStyling] = useState(null);
  const [pendingStyling, setPendingStyling] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize styling and check for changes
  useEffect(() => {
    let initialStyling = {
      headerLevel: 'h3',
      headerFontSize: 18,
      fontSize: 14,
      lineSpacing: 1.3,
      sectionSpacing: 1
    };

    // Use backend default styling if available and no current styling exists
    if (defaultStyling && (!currentStyling || !currentStyling.template)) {
      initialStyling = {
        headerLevel: defaultStyling.headerLevel || 'h3',
        headerFontSize: defaultStyling.headerFontSize || 18,
        fontSize: defaultStyling.fontSize || 14,
        lineSpacing: defaultStyling.lineSpacing || 1.3,
        sectionSpacing: defaultStyling.sectionSpacing || 1
      };
    }
    // Use current styling if available
    else if (currentStyling?.template) {
      initialStyling = {
        headerLevel: currentStyling.template.headerLevel || 'h3',
        headerFontSize: currentStyling.template.headerFontSize || 18,
        fontSize: currentStyling.template.fontSize || 14,
        lineSpacing: currentStyling.template.lineSpacing || 1.3,
        sectionSpacing: currentStyling.template.sectionSpacing || 1
      };
    }

    setStyling(initialStyling);
    setOriginalStyling(initialStyling);
    setPendingStyling(initialStyling);
  }, [currentStyling, defaultStyling]);

  // Check for changes when pending styling changes
  useEffect(() => {
    if (originalStyling && pendingStyling) {
      const changed = JSON.stringify(originalStyling) !== JSON.stringify(pendingStyling);
      setHasChanges(changed);
    }
  }, [originalStyling, pendingStyling]);

  // Prepare styling data in the correct format for backend
  const prepareStylingData = (stylingData) => {
    return {
      styling: {
        template: {
          headerLevel: stylingData.headerLevel,
          headerFontSize: stylingData.headerFontSize,
          fontSize: stylingData.fontSize,
          lineSpacing: stylingData.lineSpacing,
          sectionSpacing: stylingData.sectionSpacing
        }
      }
    };
  };

  // Handle styling changes (no real-time updates)
  const handleStylingChange = (key, value) => {
    const newPendingStyling = { ...pendingStyling, [key]: value };
    setPendingStyling(newPendingStyling);
    setStyling(newPendingStyling); // Update the display
  };

  // Apply changes
  const handleApply = async () => {
    if (!hasChanges) {
      toast.info('No changes to apply');
      return;
    }

    try {
      setUpdating(true);
      const stylingData = prepareStylingData(pendingStyling);
      const response = await resumeAPI.updateTemplateStyling(resumeId, stylingData);
      
      if (response.success) {
        // Update original styling to reflect applied changes
        setOriginalStyling(pendingStyling);
        setHasChanges(false);
        
        // Call the parent callback to update the preview
        if (onStylingUpdate) {
          onStylingUpdate(response.data.resume);
        }
        toast.success('Template styling applied successfully!');
        
        // Close popup if it's open (mobile popup)
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Failed to apply styling');
      }
    } catch (error) {
      console.error('Error applying template styling:', error);
      toast.error('Failed to apply template styling');
    } finally {
      setUpdating(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    if (hasChanges) {
      setPendingStyling(originalStyling);
      setStyling(originalStyling);
      setHasChanges(false);
    }
  };

  // Reset to template defaults
  const handleReset = () => {
    if (!defaultStyling) {
      toast.info('No default styling available for this template');
      return;
    }

    const defaultValues = {
      headerLevel: defaultStyling.headerLevel || 'h3',
      headerFontSize: defaultStyling.headerFontSize || 18,
      fontSize: defaultStyling.fontSize || 14,
      lineSpacing: defaultStyling.lineSpacing || 1.3,
      sectionSpacing: defaultStyling.sectionSpacing || 1
    };

    if(originalStyling.toString() === defaultValues.toString()) {
      return;
    }

    setPendingStyling(defaultValues);
    setStyling(defaultValues);
    setHasChanges(true);
  };

  const headerLevels = [
    { value: 'h1', label: 'H1', icon: 'H1' },
    { value: 'h2', label: 'H2', icon: 'H2' },
    { value: 'h3', label: 'H3', icon: 'H3' },
    { value: 'h4', label: 'H4', icon: 'H4' },
    { value: 'h5', label: 'H5', icon: 'H5' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <SwatchIcon className="w-5 h-5 text-purple-600" />
          Template Styling
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controls Grid */}
      <div className="space-y-3">
        {/* Header Level */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Header Level</label>
          <div className="grid grid-cols-5 gap-1">
            {headerLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => handleStylingChange('headerLevel', level.value)}
                disabled={updating}
                className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${
                  styling.headerLevel === level.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {level.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Font Sizes Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Header Font Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Header Size</label>
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{styling.headerFontSize}px</span>
                <span className="text-xs font-bold text-purple-600">H</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                value={styling.headerFontSize}
                onChange={(e) => handleStylingChange('headerFontSize', parseInt(e.target.value))}
                disabled={updating}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>12</span>
                <span>24</span>
              </div>
            </div>
          </div>

          {/* Content Font Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Content Size</label>
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{styling.fontSize}px</span>
                <span className="text-xs font-bold text-purple-600">Aa</span>
              </div>
              <input
                type="range"
                min="12"
                max="18"
                value={styling.fontSize}
                onChange={(e) => handleStylingChange('fontSize', parseInt(e.target.value))}
                disabled={updating}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>12</span>
                <span>18</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Line Spacing */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Line Spacing</label>
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{styling.lineSpacing}</span>
                <ChevronUpDownIcon className="w-3 h-3 text-purple-600" />
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={styling.lineSpacing}
                onChange={(e) => handleStylingChange('lineSpacing', parseFloat(e.target.value))}
                disabled={updating}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1.0</span>
                <span>3.0</span>
              </div>
            </div>
          </div>

          {/* Section Spacing */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Section Spacing</label>
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{styling.sectionSpacing}</span>
                <ArrowsPointingOutIcon className="w-3 h-3 text-purple-600" />
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={styling.sectionSpacing}
                onChange={(e) => handleStylingChange('sectionSpacing', parseFloat(e.target.value))}
                disabled={updating}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1.0</span>
                <span>5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Action Buttons */}
       <div className="mt-6 space-y-3">
                   <button
            onClick={handleApply}
            disabled={updating || !hasChanges}
            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
              hasChanges && !updating
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
           {updating ? (
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
           ) : (
             <CheckIcon className="w-4 h-4" />
           )}
           {updating ? 'Applying...' : 'Apply Changes'}
         </button>

         <div className="grid grid-cols-2 gap-3">
           <button
             onClick={handleCancel}
             disabled={updating || !hasChanges}
             className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
               hasChanges && !updating
                 ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                 : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
             }`}
           >
             <XMarkIcon className="w-4 h-4" />
             Cancel
           </button>

                       <button
              onClick={handleReset}
              disabled={updating || !defaultStyling}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
                defaultStyling && !updating
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
             <ArrowPathIcon className="w-4 h-4" />
             Reset
           </button>
         </div>
       </div>

      {/* Status Info */}
      
        <div className="mt-3 text-xs text-gray-600 bg-blue-50 rounded p-2 border border-blue-100">
          <div className="flex items-center gap-1">
            <InformationCircleIcon className="w-3 h-3 text-blue-600" />
            {hasChanges && <span>You have unsaved changes</span>}
            {!hasChanges && <span>No changes to apply</span>}
          </div>
        </div>

      <style jsx="true">{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
          border: 2px solid white;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default TemplateStylingControls;