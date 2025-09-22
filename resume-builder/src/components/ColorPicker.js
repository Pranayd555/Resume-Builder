import React, { useState, useEffect, useRef } from 'react';
import { SwatchIcon, CheckIcon } from '@heroicons/react/24/outline';

const ColorPicker = ({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  className = "",
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Simple color presets
  const colorPresets = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6b7280', '#64748b',
    '#71717a', '#78716c', '#000000', '#ffffff'
  ];

  const handleColorSelect = (colorValue) => {
    onChange(colorValue);
    setIsOpen(false);
  };

  const getColorName = (colorValue) => {
    const colorMap = {
      '#3b82f6': 'Blue', '#6366f1': 'Indigo', '#8b5cf6': 'Purple', '#ec4899': 'Pink',
      '#ef4444': 'Red', '#f97316': 'Orange', '#eab308': 'Yellow', '#22c55e': 'Green',
      '#14b8a6': 'Teal', '#06b6d4': 'Cyan', '#6b7280': 'Gray', '#64748b': 'Slate',
      '#71717a': 'Zinc', '#78716c': 'Stone', '#000000': 'Black', '#ffffff': 'White'
    };
    return colorMap[colorValue] || 'Custom';
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
            style={{ backgroundColor: value || '#3b82f6' }}
          />
          <span className="text-gray-700">{getColorName(value)}</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg p-2">
            <div className="grid grid-cols-8 gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    ${value === color ? 'border-gray-800' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  style={{ backgroundColor: color }}
                >
                  {value === color && <CheckIcon className="w-3 h-3 text-white" />}
                </button>
              ))}
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
              style={{ backgroundColor: value || '#3b82f6' }}
            />
            <span className="text-gray-900">
              {getColorName(value)}
            </span>
          </div>
          <SwatchIcon className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-3">
              <div className="grid grid-cols-8 gap-1">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`
                      w-6 h-6 rounded border-2 flex items-center justify-center
                      ${value === color ? 'border-gray-800' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    style={{ backgroundColor: color }}
                  >
                    {value === color && <CheckIcon className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
