import React, { useState } from 'react';
import AIService from '../services/aiService';
import { useTokenBalance } from '../hooks/useTokenBalance';
import './AIButton.css';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const AIButton = ({ editorInstance, onContentChange, isProMode = false, onAIContentChange = null, onAILoading = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { tokenBalance, hasEnoughTokens, consumeTokens } = useTokenBalance();

  // Token balance is automatically fetched by useTokenBalance hook

  const handleAIAction = async (action) => {
    if (!editorInstance) {
      showNotification('Editor not available. Please wait for the editor to load or refresh the page.', 'warning');
      return;
    }

    // Check if user has enough tokens
    if (!hasEnoughTokens(1)) {
      showNotification('Insufficient tokens. Please purchase more tokens to use AI features.', 'warning');
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

      // Consume 1 token for successful AI processing
      consumeTokens(1);

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
          className={`ai-button ${isLoading ? 'loading' : ''} ${!editorInstance ? 'disabled' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading || !editorInstance}
          title={!editorInstance ? 'Editor not available' : ''}
        >
          {isLoading ? (
            <>
              <span className="ai-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <span className="ai-icon">✨</span>
              {isProMode ? 'AI Pro Tools' : 'AI Polish'}
              <span className="token-info">
                <span className="token-cost-display">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />1
                </span>
                <span className="token-count">({tokenBalance} left)</span>
              </span>
            </>
          )}
        </button>

        {showDropdown && (
          <div className="ai-dropdown">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="ai-dropdown-item"
                onClick={() => handleAIAction(item.action)}
                disabled={isLoading}
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
            <span className='text-red-500'>*</span>AI generated responses are not saved until you submit the form or save a draft.
          </span>
        </div>
      )}
    </div>
  );
};

export default AIButton;
