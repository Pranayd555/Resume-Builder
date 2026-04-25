import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { createPortfolioCustomizationModel } from '../../models/dataModels';

const PortfolioCustomization = ({ portfolioData, onSave, onClose }) => {
  const [customization, setCustomization] = useState(
    portfolioData.customization || createPortfolioCustomizationModel()
  );
  const [saving, setSaving] = useState(false);

  const handleColorChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionColorChange = (section, value) => {
    setCustomization(prev => ({
      ...prev,
      sectionColors: {
        ...prev.sectionColors,
        [section]: value
      }
    }));
  };

  const handleFontChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleSection = (section) => {
    setCustomization(prev => ({
      ...prev,
      visibleSections: {
        ...prev.visibleSections,
        [section]: !prev.visibleSections[section]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(customization);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Blue', primaryColor: '#3B82F6', secondaryColor: '#1E40AF', accentColor: '#0EA5E9' },
    { name: 'Purple', primaryColor: '#8B5CF6', secondaryColor: '#6D28D9', accentColor: '#A78BFA' },
    { name: 'Green', primaryColor: '#10B981', secondaryColor: '#047857', accentColor: '#34D399' },
    { name: 'Red', primaryColor: '#EF4444', secondaryColor: '#991B1B', accentColor: '#F87171' },
    { name: 'Indigo', primaryColor: '#4F46E5', secondaryColor: '#312E81', accentColor: '#818CF8' },
  ];

  const fonts = [
    { name: 'Inter', value: 'InterVar, system-ui, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier', value: '"Courier New", monospace' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customize Portfolio Design
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Color Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Color Presets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {colorPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleColorChange('primaryColor', preset.primaryColor) || handleColorChange('secondaryColor', preset.secondaryColor) || handleColorChange('accentColor', preset.accentColor)}
                  className="group relative"
                >
                  <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition">
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Colors
            </h3>
            <div className="grid gridcols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customization.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customization.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Section Colors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(customization.sectionColors).map(([section, color]) => (
                <div key={section}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleSectionColorChange(section, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleSectionColorChange(section, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Typography
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Font
                </label>
                <select
                  value={customization.primaryFont}
                  onChange={(e) => handleFontChange('primaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {fonts.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Font
                </label>
                <select
                  value={customization.secondaryFont}
                  onChange={(e) => handleFontChange('secondaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {fonts.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heading Font Size
                </label>
                <select
                  value={customization.headingFontSize}
                  onChange={(e) => handleFontChange('headingFontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Font Size
                </label>
                <select
                  value={customization.bodyFontSize}
                  onChange={(e) => handleFontChange('bodyFontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spacing
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section Spacing
              </label>
              <select
                value={customization.spacing}
                onChange={(e) => handleFontChange('spacing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>

          {/* Section Visibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Visible Sections
            </h3>
            <div className="space-y-3">
              {Object.entries(customization.visibleSections).map(([section, isVisible]) => (
                <label key={section} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => handleToggleSection(section)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCustomization;
