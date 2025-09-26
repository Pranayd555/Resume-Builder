import React, { useState, useEffect, useRef } from 'react';
import { SwatchIcon } from '@heroicons/react/24/outline';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  className = "",
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const dropdownRef = useRef(null);

  // Sync tempValue with value prop when it changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Apply border-radius to SketchPicker inputs after render
  useEffect(() => {
    if (isOpen) {
      const applyStyles = () => {
        const inputs = document.querySelectorAll('.custom-sketch-picker input');
        inputs.forEach(input => {
          input.style.borderRadius = '0.25rem';
          input.style.textAlign = 'center';
        });
      };
      
      applyStyles();
      const timeoutId = setTimeout(applyStyles, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const getColorName = (colorValue) => {
    if (!colorValue) return 'No color selected';
    return 'Custom Color';
  };

  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempValue(value);
    setIsOpen(false);
  };

  const handleColorChange = (color) => {
    setTempValue(color.hex);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center space-x-2 px-2 py-1 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ 
                backgroundColor: value || 'transparent',
                backgroundImage: value ? 'none' : 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            />
            <span className="text-gray-700">{getColorName(value)}</span>
        </button>

        {isOpen && (
          <div className="mt-2 space-y-3">
            <SketchPicker
              color={tempValue || '#000000'}
              onChange={handleColorChange}
              disableAlpha={true}
              width="100%"
              styles={{
                default: {
                  picker: {
                    boxShadow: 'none',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    width: '90%'
                  },
                  input: {
                    backgroundColor: '#f9fafb',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    textAlign: 'center'
                  }
                }
              }}
              className="dark:sketch-picker-dark custom-sketch-picker"
            />
            
            {/* Apply and Reset buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md
            bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ 
                backgroundColor: value || 'transparent',
                backgroundImage: value ? 'none' : 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            />
            <span className="text-gray-900">
              {getColorName(value)}
            </span>
          </div>
          <SwatchIcon className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="mt-2 space-y-3">
            <SketchPicker
              color={tempValue || '#000000'}
              onChange={handleColorChange}
              disableAlpha={true}
              width="100%"
              styles={{
                default: {
                  picker: {
                    boxShadow: 'none',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    width: '90%'
                  },
                  input: {
                    backgroundColor: '#f9fafb',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    textAlign: 'center'
                  }
                }
              }}
              className="dark:sketch-picker-dark custom-sketch-picker"
            />
            
            {/* Apply and Reset buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
