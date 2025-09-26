import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import ColorPicker from './ColorPicker';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ColorCustomization = ({ 
  resumeId, 
  currentColors, 
  onColorsUpdate, 
  onClose,
  disabled = false,
  templateDefaultColors = null
}) => {
  const [colors, setColors] = useState({
    primary: null,
    secondary: null, 
    accent: null,
    text: null
  });
  const [originalColors, setOriginalColors] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Initialize colors from current resume data
  useEffect(() => {
    if (currentColors) {
      setColors(currentColors);
      setOriginalColors(currentColors);
    } else {
      // No colors set - keep as null
      const noColors = {
        primary: null,
        secondary: null,
        accent: null,
        text: null
      };
      setColors(noColors);
      setOriginalColors(noColors);
    }
  }, [currentColors]);

 


  // Apply individual color changes when Apply is clicked
  const handleColorChange = async (colorType, value) => {
    const newColors = {
      ...colors,
      [colorType]: value
    };
    
    setColors(newColors);
    
    try {
      setUpdating(true);
      const response = await resumeAPI.updateIndividualColor(resumeId, colorType, value);
      
      if (response.success) {
        setOriginalColors(newColors);
        
        // Call the parent callback to update the preview
        if (onColorsUpdate) {
          onColorsUpdate(response.data.resume);
        }
        
        toast.success(`${colorType.charAt(0).toUpperCase() + colorType.slice(1)} color updated!`);
      } else {
        throw new Error(response.error || 'Failed to update color');
      }
    } catch (error) {
      console.error('Error updating color:', error);
      toast.error('Failed to update color');
      
      // Revert the color change on error
      setColors(colors);
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

      {/* Action Buttons - Only Reset and Cancel */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
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
