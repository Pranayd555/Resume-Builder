import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AIService from "../services/aiService";

import { apiHelpers } from "../services/api";
import "./AIButton.css";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

const AIButton = ({
  editorInstance,
  onContentChange,
  isProMode = false,
  onAIContentChange = null,
  onAILoading = null,
  isMobile = false,
  originalText = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenExhausted, setIsTokenExhausted] = useState(false);
  const { user } = useAuth();


  // Get initial token balance
  useEffect(() => {
    if(!user.isOwnApiKey) {
      const balance = apiHelpers.getTokenBalance();
      setTokenBalance(balance);
      setIsTokenExhausted( balance <= 0);
    }
  }, [user.isOwnApiKey]);

  // Listen for token balance updates
  useEffect(() => {
    const handleTokenBalanceUpdate = (event) => {
      if(!user.isOwnApiKey) {
      const { balance } = event.detail;
      setTokenBalance(balance);
      setIsTokenExhausted(balance <= 0);
    };
    }

    window.addEventListener("tokenBalanceUpdated", handleTokenBalanceUpdate);
    return () =>
      window.removeEventListener(
        "tokenBalanceUpdated",
        handleTokenBalanceUpdate
      );
  }, [user.isOwnApiKey]);



  const handleAIAction = async (action) => {
    if (!editorInstance) {
      showNotification(
        "Editor not available. Please wait for the editor to load or refresh the page.",
        "warning"
      );
      return;
    }

    if (!user.isOwnApiKey && (isTokenExhausted || tokenBalance <= 0)) {
      showNotification(
        "AI tokens exhausted! Please purchase more tokens to continue using AI features.",
        "error"
      );
      return;
    }

    const editorContent = getEditorContent();

    if (!editorContent || editorContent.trim().length === 0) {
      showNotification(
        "Please add some content to the editor first.",
        "warning"
      );
      return;
    }

    if (editorContent.length < 20) {
      showNotification(
        "Content is too short. Please add at least 20 characters.",
        "warning"
      );
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
        case "summarize":
          result = await AIService.summarizeContent(editorContent, 150);
          break;
        case "professional":
          result = await AIService.polishContent(
            editorContent,
            "professional",
            "achievement-focused"
          );
          break;
        case "generatePDFTemplate":
          // For pro mode - generate PDF template from basic details
          result = await AIService.generatePDFTemplate(editorContent);
          break;
        case "restructureTemplate":
          // For pro mode - restructure current template (structured template required)
          result = await AIService.restructureTemplate(editorContent);
          break;
        default:
          throw new Error("Unknown AI action");
      }

      // Replace the entire editor content with processed version
      let processedText;
      if (action === "generatePDFTemplate") {
        processedText = result.data.templateContent;
      } else if (action === "restructureTemplate") {
        processedText = result.data.restructuredContent;
      } else {
        processedText = result.data.rewrittenContent || result.data.summary;
      }
      replaceEditorContent(processedText);
      originalText = result.data.originalContent

      // Trigger content change event to update the editor
      if (onContentChange) {
        onContentChange(processedText);
      }

      // Notify parent component about AI content change
      if (onAIContentChange) {
        onAIContentChange(processedText);
      }

      showNotification("Content processed successfully!", "success");
    } catch (error) {
      showNotification(
        error.message || "Failed to process content. Please try again.",
        "error"
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
    if (!editorInstance) return "";

    try {
      // Focus the editor to ensure any pending changes are committed
      // This fixes the issue where getData() returns stale content
      if (editorInstance.editing && editorInstance.editing.view) {
        editorInstance.editing.view.focus();
      }

      return editorInstance.getData();
    } catch (error) {
      console.error("Error getting editor content:", error);
      return "";
    }
  };

  const replaceEditorContent = (newText) => {
    if (!editorInstance) return;

    try {
      // Use setData to properly update the editor and trigger change events
      editorInstance.setData(newText || "");
      console.log("Editor content updated with:", newText);
    } catch (error) {
      console.error("Error updating editor content:", error);
      showNotification(
        "Failed to update editor content. Please try again.",
        "error"
      );
    }
  };

  const showNotification = (message, type = "info") => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".ai-notification");
    existingNotifications.forEach((notification) => notification.remove());

    // Create new notification
    const notification = document.createElement("div");
    notification.className = `ai-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  };

  const menuItems = isProMode
    ? [
      {
        label: "Generate PDF Template",
        action: "generatePDFTemplate",
        icon: "📋",
      },
      {
        label: "Restructure Template",
        action: "restructureTemplate",
        icon: "🔄",
      },
    ]
    : [
      { label: "Summarize", action: "summarize", icon: "📝" },
      { label: "Make Professional", action: "professional", icon: "💼" },
    ];

  function resetToDefault() {
    replaceEditorContent(originalText);

    // Trigger content change event to update the editor
    if (onContentChange) {
      onContentChange(originalText);
    }

    // Notify parent component about AI content change
    if (onAIContentChange) {
      onAIContentChange(originalText);
    }

    showNotification("Content processed successfully!", "success");
  }


  return (
    <div className={`ai-button-container ${!isProMode ? 'w-full' : ''}`}>
      <div className="ai-button-wrapper flex justify-between">
        <button
          className={`ai-button ${isLoading ? "loading" : ""} ${!editorInstance ? "disabled" : ""
            } ${isTokenExhausted ? "token-exhausted" : ""}`}
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading || !editorInstance || isTokenExhausted}
          title={
            !editorInstance
              ? "Editor not available"
              : isTokenExhausted
                ? "AI tokens exhausted - Buy more tokens to continue"
                : ""
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
              {isProMode ? "AI Pro Tools" : "AI Polish"}
            </>
          )}
        </button>

        {originalText && (<button
          onClick={() => {
            // setShowTemplateDialog(true);
            resetToDefault();
          }}
          className="ai-button template-button-simple"
          style={{
            background: "linear-gradient(to right, #1af916ff, #178104ff)",
            color: "white",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(41, 249, 22, 0.3)",
            margin: "0 0.5rem 0 0",
          }}

          onMouseEnter={(e) => {
            e.target.style.background =
              "linear-gradient(to right, #10c449ff, #08711fff)";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(22, 118, 30, 0.4)";
          }}
          
          onMouseLeave={(e) => {
            e.target.style.background =
              "linear-gradient(to right, #1af916ff, #178104ff)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(41, 249, 22, 0.3)";
          }}
        >
          <ArrowPathIcon className="w-5 h-5" />
          Reset
        </button>)}

        {showDropdown && (
          <div className="ai-dropdown">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`ai-dropdown-item ${isTokenExhausted ? "token-exhausted" : ""
                  }`}
                onClick={() => handleAIAction(item.action)}
                disabled={isLoading || isTokenExhausted}
                title={
                  isTokenExhausted
                    ? "AI tokens exhausted - Buy more tokens to continue"
                    : ""
                }
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
                <span className="text-red-500">⚠️</span>AI tokens exhausted!
                <Link
                  to="/payment"
                  className="text-blue-500 hover:text-blue-700 underline ml-1"
                >
                  Buy more tokens
                </Link>{" "}
                to continue using AI features.
              </>
            ) : (
              <>
                <span className="text-red-500">*</span>AI generated responses
                are not saved until you submit the form or save a draft.
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default AIButton;
