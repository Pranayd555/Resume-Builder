import React, { useState } from 'react';
import AIService from '../services/aiService';
import { useTokenBalance } from '../hooks/useTokenBalance';
import './AIButton.css';

const AIButton = ({ editorInstance, onContentChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { tokenBalance, hasEnoughTokens, consumeTokens } = useTokenBalance();

  const handleAIAction = async (action) => {
    if (!editorInstance) {
      console.log('AIButton: Editor instance not available', { editorInstance });
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

    setIsLoading(true);
    setShowDropdown(false);

    try {
      let result;
      
      switch (action) {
        case 'summarize':
          result = await AIService.summarizeContent(editorContent, 150);
          break;
        case 'professional':
          result = await AIService.polishContent(editorContent, 'professional', 'achievement-focused');
          break;
        default:
          throw new Error('Unknown AI action');
      }
      
      // Replace the entire editor content with processed version
      const processedText = result.data.rewrittenContent || result.data.summary;
      replaceEditorContent(processedText);
      
      // Consume 1 token for successful AI processing
      consumeTokens(1);
      
      // Trigger content change event to update the editor
      if (onContentChange) {
        onContentChange(processedText);
      }
      
      showNotification('Content processed successfully!', 'success');
    } catch (error) {
      console.error('AI Action error:', error);
      showNotification(
        error.message || 'Failed to process content. Please try again.', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getEditorContent = () => {
    if (!editorInstance) return '';
    
    try {
      return editorInstance.getData();
    } catch (error) {
      console.error('Error getting editor content:', error);
      return '';
    }
  };

  const replaceEditorContent = (newText) => {
    if (!editorInstance) return;
    
    try {
      editorInstance.setData(newText);
    } catch (error) {
      console.error('Error setting editor content:', error);
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

  const menuItems = [
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
              AI Polish
              <span className="token-count">({tokenBalance})</span>
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
    </div>
  );
};

export default AIButton;
