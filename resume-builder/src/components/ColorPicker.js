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

  const handleColorInputChange = (colorValue) => {
    onChange(colorValue);
    // Don't close the dropdown for color input changes
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
        // Don't close if clicking on a color input or its related elements
        if (event.target.type === 'color' || event.target.closest('input[type="color"]')) {
          return;
        }
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
          <div className="absolute z-50 mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[280px] backdrop-blur-sm bg-white/95">
            {/* Custom Color Input */}
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Custom Color</label>
              <div className="relative">
                <input
                  type="color"
                  value={value || '#3b82f6'}
                  onChange={(e) => handleColorInputChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-10 cursor-pointer border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    background: 'none',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                  style={{ 
                    background: `linear-gradient(45deg, ${value || '#3b82f6'} 0%, ${value || '#3b82f6'} 100%)`,
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
            </div>
            
            {/* Preset Colors */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 mb-3 block">Preset Colors</label>
              <div className="grid grid-cols-8 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-110 transition-all duration-200
                      ${value === color ? 'border-gray-800 shadow-lg scale-105' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    style={{ backgroundColor: color }}
                  >
                    {value === color && <CheckIcon className="w-3 h-3 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Close Button */}
            <div className="pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                Done
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
              style={{ backgroundColor: value || '#3b82f6' }}
            />
            <span className="text-gray-900">
              {getColorName(value)}
            </span>
          </div>
          <SwatchIcon className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl backdrop-blur-sm bg-white/95">
            <div className="p-4">
              {/* Custom Color Input */}
              <div className="mb-6" onClick={(e) => e.stopPropagation()}>
                <label className="text-sm font-semibold text-gray-800 mb-3 block">Custom Color</label>
                <div className="relative">
                  <input
                    type="color"
                    value={value || '#3b82f6'}
                    onChange={(e) => handleColorInputChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-12 cursor-pointer border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      background: 'none',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      padding: '0'
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                    style={{ 
                      background: `linear-gradient(45deg, ${value || '#3b82f6'} 0%, ${value || '#3b82f6'} 100%)`,
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </div>
              
              {/* Preset Colors */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-800 mb-3 block">Preset Colors</label>
                <div className="grid grid-cols-8 gap-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`
                        w-8 h-8 rounded-lg border-2 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-110 transition-all duration-200
                        ${value === color ? 'border-gray-800 shadow-lg scale-105' : 'border-gray-300 hover:border-gray-400'}
                      `}
                      style={{ backgroundColor: color }}
                    >
                      {value === color && <CheckIcon className="w-4 h-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Close Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
