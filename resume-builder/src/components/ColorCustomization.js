import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import ColorPicker from './ColorPicker';
import { CheckIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ColorCustomization = ({ 
  resumeId, 
  currentColors, 
  onColorsUpdate, 
  onClose,
  disabled = false,
  templateDefaultColors = null
}) => {
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#6b7280', 
    accent: '#0ea5e9',
    text: '#1f2937'
  });
  const [originalColors, setOriginalColors] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Initialize colors from current resume data
  useEffect(() => {
    if (currentColors) {
      setColors(currentColors);
      setOriginalColors(currentColors);
    }
  }, [currentColors]);

 

  // Handle color changes
  const handleColorChange = (colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  // Apply color changes
  const handleApply = async () => {
    try {
      setUpdating(true);
      const response = await resumeAPI.updateColors(resumeId, colors);
      
      if (response.success) {
        setOriginalColors(colors);
        
        // Call the parent callback to update the preview
        if (onColorsUpdate) {
          onColorsUpdate(response.data.resume);
        }
        
        toast.success('Colors updated successfully!');
        
        // Close popup if it's open
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Failed to update colors');
      }
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('Failed to update colors');
    } finally {
      setUpdating(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    if (originalColors) {
      setColors(originalColors);
    }
    if (onClose) {
      onClose();
    }
  };

  // Reset colors to template defaults
  const handleReset = async () => {
    try {
      setUpdating(true);
      
      // Call API to reset colors (set to null to use template defaults)
      const response = await resumeAPI.updateColors(resumeId, null);
      
      if (response.success) {
        // Update local state to template defaults
        if (templateDefaultColors) {
          setColors(templateDefaultColors);
          setOriginalColors(templateDefaultColors);
        } else {
          // Fallback to default colors if template colors not available
          const defaultColors = {
            primary: '#3b82f6',
            secondary: '#6b7280',
            accent: '#0ea5e9',
            text: '#1f2937'
          };
          setColors(defaultColors);
          setOriginalColors(defaultColors);
        }
        
        // Call the parent callback to update the preview
        if (onColorsUpdate) {
          onColorsUpdate(response.data.resume);
        }
        
        toast.success('Colors reset to template defaults!');
        
        // Close popup if it's open
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Failed to reset colors');
      }
    } catch (error) {
      console.error('Error resetting colors:', error);
      toast.error('Failed to reset colors');
    } finally {
      setUpdating(false);
    }
  };


  return (
    <div className="space-y-4">
      {/* Individual Color Pickers with Descriptions */}
      <div className="space-y-3">
        <ColorPicker
          label="Primary Color"
          value={colors.primary}
          onChange={(value) => handleColorChange('primary', value)}
          disabled={disabled || updating}
          compact
        />
        <div className="text-xs text-gray-500 ml-2">• Headings, titles, and important elements</div>

        <ColorPicker
          label="Secondary Color"
          value={colors.secondary}
          onChange={(value) => handleColorChange('secondary', value)}
          disabled={disabled || updating}
          compact
        />
        <div className="text-xs text-gray-500 ml-2">• Body text, descriptions, and secondary content</div>

        <ColorPicker
          label="Accent Color"
          value={colors.accent}
          onChange={(value) => handleColorChange('accent', value)}
          disabled={disabled || updating}
          compact
        />
        <div className="text-xs text-gray-500 ml-2">• Links, dates, company names, and highlights</div>

        <ColorPicker
          label="Text Color"
          value={colors.text}
          onChange={(value) => handleColorChange('text', value)}
          disabled={disabled || updating}
          compact
        />
        <div className="text-xs text-gray-500 ml-2">• Main content text and paragraphs</div>

      </div>

      {/* Action Buttons - Always visible */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleApply}
          disabled={updating}
          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
            !updating
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Applying...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Apply Colors</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCancel}
            disabled={updating}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
              !updating
                ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleReset}
            disabled={updating}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] ${
              !updating
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Reset to template default colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomization;
