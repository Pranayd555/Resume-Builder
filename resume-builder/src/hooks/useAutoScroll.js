import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for automatic scrolling to elements
 * @param {boolean} trigger - When true, scrolling is triggered
 * @param {Object} options - Scrolling options
 * @returns {Object} - Object containing ref and scroll function
 */
export const useAutoScroll = (trigger = false, options = {}) => {
  const elementRef = useRef(null);
  
  const defaultOptions = useMemo(() => ({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    delay: 100,
    offset: 0,
    ...options
  }), [options]);

  const scrollToElement = useCallback((customOptions = {}) => {
    const finalOptions = { ...defaultOptions, ...customOptions };
    
    if (elementRef.current) {
      const timer = setTimeout(() => {
        // If offset is provided, scroll to element with offset
        if (finalOptions.offset !== 0) {
          const elementRect = elementRef.current.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = elementRect.top + scrollTop + finalOptions.offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: finalOptions.behavior
          });
        } else {
          // Use standard scrollIntoView
          elementRef.current.scrollIntoView({
            behavior: finalOptions.behavior,
            block: finalOptions.block,
            inline: finalOptions.inline
          });
        }
      }, finalOptions.delay);
      
      return () => clearTimeout(timer);
    }
    return null;
  }, [defaultOptions]);

  // Auto-scroll when trigger becomes true
  useEffect(() => {
    if (trigger) {
      const cleanup = scrollToElement();
      return cleanup;
    }
  }, [trigger, scrollToElement]);

  return {
    ref: elementRef,
    scrollToElement
  };
};

/**
 * Hook for scrolling to top of page
 * @param {boolean} trigger - When true, scrolling is triggered
 * @param {Object} options - Scrolling options
 */
export const useScrollToTop = (trigger = false, options = {}) => {
  const defaultOptions = useMemo(() => ({
    behavior: 'smooth',
    delay: 100,
    ...options
  }), [options]);

  const scrollToTop = useCallback((customOptions = {}) => {
    const finalOptions = { ...defaultOptions, ...customOptions };
    
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: finalOptions.behavior
      });
    }, finalOptions.delay);
    
    return () => clearTimeout(timer);
  }, [defaultOptions]);

  useEffect(() => {
    if (trigger) {
      const cleanup = scrollToTop();
      return cleanup;
    }
  }, [trigger, scrollToTop]);

  return { scrollToTop };
};

/**
 * Hook for scrolling to a specific section by ID
 * @param {boolean} trigger - When true, scrolling is triggered
 * @param {string} targetId - ID of the target element
 * @param {Object} options - Scrolling options
 */
export const useScrollToId = (trigger = false, targetId = '', options = {}) => {
  const defaultOptions = useMemo(() => ({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    delay: 100,
    ...options
  }), [options]);

  const scrollToId = useCallback((id = targetId, customOptions = {}) => {
    const finalOptions = { ...defaultOptions, ...customOptions };
    
    const timer = setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: finalOptions.behavior,
          block: finalOptions.block,
          inline: finalOptions.inline
        });
      }
    }, finalOptions.delay);
    
    return () => clearTimeout(timer);
  }, [defaultOptions, targetId]);

  useEffect(() => {
    if (trigger && targetId) {
      const cleanup = scrollToId();
      return cleanup;
    }
  }, [trigger, targetId, scrollToId]);

  return { scrollToId };
};

/**
 * Hook for form navigation scrolling
 * Scrolls to first error field or next/previous sections
 * @param {Object} formErrors - Object containing form errors
 * @param {Array} fieldOrder - Array of field names in order
 */
export const useFormScroll = (formErrors = {}, fieldOrder = []) => {
  const scrollToFirstError = (customOptions = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      delay: 100,
      ...customOptions
    };

    const errorFields = Object.keys(formErrors);
    if (errorFields.length === 0) return;

    // Find the first error field in the defined order
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field)) || errorFields[0];
    
    const timer = setTimeout(() => {
      const element = document.getElementById(firstErrorField) || 
                     document.querySelector(`[name="${firstErrorField}"]`) ||
                     document.querySelector(`[data-field="${firstErrorField}"]`);
      
      if (element) {
        element.scrollIntoView({
          behavior: defaultOptions.behavior,
          block: defaultOptions.block,
          inline: defaultOptions.inline
        });
        
        // Focus the element if it's focusable
        if (element.focus && typeof element.focus === 'function') {
          element.focus();
        }
      }
    }, defaultOptions.delay);
    
    return () => clearTimeout(timer);
  };

  const scrollToField = (fieldName, customOptions = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      delay: 100,
      ...customOptions
    };

    const timer = setTimeout(() => {
      const element = document.getElementById(fieldName) || 
                     document.querySelector(`[name="${fieldName}"]`) ||
                     document.querySelector(`[data-field="${fieldName}"]`);
      
      if (element) {
        element.scrollIntoView({
          behavior: defaultOptions.behavior,
          block: defaultOptions.block,
          inline: defaultOptions.inline
        });
      }
    }, defaultOptions.delay);
    
    return () => clearTimeout(timer);
  };

  return {
    scrollToFirstError,
    scrollToField
  };
};

/**
 * Hook for automatically scrolling to top when route changes
 * @param {Object} options - Scrolling options
 */
export const useRouteScrollToTop = (options = {}) => {
  const location = useLocation();
  const lastPathnameRef = useRef(null);
  
  const defaultOptions = useMemo(() => ({
    behavior: 'smooth',
    delay: 100,
    ...options
  }), [options]);

  useEffect(() => {
    // Only scroll if the pathname has actually changed
    if (lastPathnameRef.current !== location.pathname) {
      lastPathnameRef.current = location.pathname;
      
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: defaultOptions.behavior
        });
      }, defaultOptions.delay);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, defaultOptions.behavior, defaultOptions.delay]);
};

export default useAutoScroll; 