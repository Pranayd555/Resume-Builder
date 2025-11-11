import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AIService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { apiHelpers } from '../services/api';
import './AIButton.css';

const AIButton = ({ editorInstance, onContentChange, isProMode = false, onAIContentChange = null, onAILoading = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenExhausted, setIsTokenExhausted] = useState(false);
  const { user } = useAuth();

  // Get initial token balance
  useEffect(() => {
    const balance = apiHelpers.getTokenBalance();
    setTokenBalance(balance);
    setIsTokenExhausted(balance <= 0);
  }, []);

  // Listen for token balance updates
  useEffect(() => {
    const handleTokenBalanceUpdate = (event) => {
      const { balance } = event.detail;
      setTokenBalance(balance);
      setIsTokenExhausted(balance <= 0);
    };

    window.addEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
    return () => window.removeEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
  }, []);

  // Update token balance from user data if available
  useEffect(() => {
    if (user && user.tokens !== undefined) {
      setTokenBalance(user.tokens);
      setIsTokenExhausted(user.tokens <= 0);
    }
  }, [user]);

  const handleAIAction = async (action) => {
    if (!editorInstance) {
      showNotification('Editor not available. Please wait for the editor to load or refresh the page.', 'warning');
      return;
    }

    if (isTokenExhausted || tokenBalance <= 0) {
      showNotification('AI tokens exhausted! Please purchase more tokens to continue using AI features.', 'error');
      return;
    }


    const editorContent = getEditorContent();

    if (!editorContent || editorContent.trim().length === 0) {
      showNotification('Please add some content to the editor first.', 'warning');
      return;
    }

    if (editorContent.length < 20) {
      showNotification('Content is too short. Please add at least 20 characters.', 'warning');
      return;
    }

    setShowDropdown(false);
    setIsLoading(true);
    
    // Notify parent component about AI loading state
    if (onAILoading) {
      onAILoading(true);
    }

    try {
      let result;

      switch (action) {
        case 'summarize':
          result = await AIService.summarizeContent(editorContent, 150);
          break;
        case 'professional':
          result = await AIService.polishContent(editorContent, 'professional', 'achievement-focused');
          break;
        case 'generatePDFTemplate':
          // For pro mode - generate PDF template from basic details
          result = await AIService.generatePDFTemplate(editorContent);
          break;
        case 'restructureTemplate':
          // For pro mode - restructure current template (structured template required)
          result = await AIService.restructureTemplate(editorContent);
          break;
        default:
          throw new Error('Unknown AI action');
      }

      // Replace the entire editor content with processed version
      let processedText;
      if (action === 'generatePDFTemplate') {
        processedText = result.data.templateContent;
      } else if (action === 'restructureTemplate') {
        processedText = result.data.restructuredContent;
      } else {
        processedText = result.data.rewrittenContent || result.data.summary;
      }
      replaceEditorContent(processedText);


      // Trigger content change event to update the editor
      if (onContentChange) {
        onContentChange(processedText);
      }
      
      // Notify parent component about AI content change
      if (onAIContentChange) {
        onAIContentChange(processedText);
      }

      showNotification('Content processed successfully!', 'success');
    } catch (error) {
      showNotification(
        error.message || 'Failed to process content. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
      // Notify parent component that AI loading is complete
      if (onAILoading) {
        onAILoading(false);
      }
    }
  };

  const getEditorContent = () => {
    if (!editorInstance) return '';

    try {
      return editorInstance.getData();
    } catch (error) {
      return '';
    }
  };

  const replaceEditorContent = (newText) => {
    if (!editorInstance) return;

    try {
      editorInstance.setData(newText);
    } catch (error) {
      showNotification('Failed to update editor content. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.ai-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `ai-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  };

  const menuItems = isProMode ? [
    { label: 'Generate PDF Template', action: 'generatePDFTemplate', icon: '📋' },
    { label: 'Restructure Template', action: 'restructureTemplate', icon: '🔄' }
  ] : [
    { label: 'Summarize', action: 'summarize', icon: '📝' },
    { label: 'Make Professional', action: 'professional', icon: '💼' }
  ];

  return (
    <div className="ai-button-container">
      <div className="ai-button-wrapper">
        <button
          className={`ai-button ${isLoading ? 'loading' : ''} ${!editorInstance ? 'disabled' : ''} ${isTokenExhausted ? 'token-exhausted' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading || !editorInstance || isTokenExhausted}
          title={
            !editorInstance 
              ? 'Editor not available' 
              : isTokenExhausted 
                ? 'AI tokens exhausted - Buy more tokens to continue'
                : ''
          }
        >
          {isLoading ? (
            <>
              <span className="ai-spinner"></span>
              Processing...
            </>
          ) : isTokenExhausted ? (
            <>
              <span className="ai-icon">⚠️</span>
              Tokens Exhausted
            </>
          ) : (
            <>
              <span className="ai-icon">✨</span>
              {isProMode ? 'AI Pro Tools' : 'AI Polish'}
            </>
          )}
        </button>

        {showDropdown && (
          <div className="ai-dropdown">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`ai-dropdown-item ${isTokenExhausted ? 'token-exhausted' : ''}`}
                onClick={() => handleAIAction(item.action)}
                disabled={isLoading || isTokenExhausted}
                title={isTokenExhausted ? 'AI tokens exhausted - Buy more tokens to continue' : ''}
              >
                <span className="ai-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Info Text */}
      {!isProMode && (
        <div className="ai-info-text">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isTokenExhausted ? (
                <>
                  <span className='text-red-500'>⚠️</span>AI tokens exhausted! 
                  <Link to="/payment" className="text-blue-500 hover:text-blue-700 underline ml-1">
                    Buy more tokens
                  </Link> to continue using AI features.
                </>
            ) : (
              <>
                <span className='text-red-500'>*</span>AI generated responses are not saved until you submit the form or save a draft.
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default AIButton;
