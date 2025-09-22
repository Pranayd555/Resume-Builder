import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import ColorPicker from './ColorPicker';
import { CheckIcon } from '@heroicons/react/24/outline';

const ColorCustomization = ({ 
  resumeId, 
  currentColors, 
  onColorsUpdate, 
  onClose,
  disabled = false 
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
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleCancel}
          disabled={updating}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={updating}
          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              <span>Applying...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-3 h-3" />
              <span>Apply</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ColorCustomization;
