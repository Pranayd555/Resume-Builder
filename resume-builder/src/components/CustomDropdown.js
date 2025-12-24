import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import './CustomDropdown.css';

const CustomDropdown = ({
  options = [],
  value = '',
  onChange,
  onBlur,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  hasError = false,
  className = "",
  name = "",
  id = "",
  showFontStyles = false,
  disableSearch = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find the selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    if (onBlur) {
      onBlur();
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus search input when opening
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      setSearchTerm('');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      default:
        // Handle other keys if needed
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown ${className} ${hasError ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
    >
      <div
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id || 'dropdown'}-menu`}
        aria-required={required}
        id={id}
        name={name}
        {...props}
      >
        <span className={`dropdown-value ${!selectedOption ? 'placeholder' : ''} w-full`}>
          {selectedOption ? (
            <div className="flex items-center justify-between w-full gap-2">
              {showFontStyles && selectedOption.fontFamily ? (
                <span style={{ fontFamily: selectedOption.fontFamily }}>
                  {selectedOption.label}
                </span>
              ) : (
                <span>{selectedOption.label}</span>
              )}
              {selectedOption.badge && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {selectedOption.badge}
                </div>
              )}
            </div>
          ) : (
            placeholder
          )}
        </span>
        <div className="dropdown-icon">
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu" id={`${id || 'dropdown'}-menu`}>
          {!disableSearch && options.length > 5 && (
            <div className="dropdown-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          )}

          <div className="dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    {showFontStyles && option.fontFamily ? (
                      <span style={{ fontFamily: option.fontFamily }}>
                        {option.label}
                      </span>
                    ) : (
                      <span>{option.label}</span>
                    )}
                    {option.badge && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100  text-yellow-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {option.badge}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-option no-results">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
