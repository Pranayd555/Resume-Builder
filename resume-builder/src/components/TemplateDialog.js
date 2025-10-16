import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Template data structure - PDF-compatible styles
const templates = [
  {
    title: 'Right Heavy Two Block',
    content: `<div style="margin: 5px 0; display: flex; gap: 2%;">
    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Left Column</h3>
      <p style="color: #555;">Add your content here. You can replace this with text, lists, or images.</p>
    </div>
    <div style="flex: 2; background: #ffffff; border: 1px solid #eee; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Right Column</h3>
      <p style="color: #555;">This section can hold additional details or visuals.</p>
    </div>
  </div>`
  },
  {
    title: 'Left Heavy Two Block',
    content: `<div style="margin: 5px 0; display: flex; gap: 2%;">
    <div style="flex: 2; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Left Column</h3>
      <p style="color: #555;">Add your content here. You can replace this with text, lists, or images.</p>
    </div>
    <div style="flex: 1; background: #ffffff; border: 1px solid #eee; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Right Column</h3>
      <p style="color: #555;">This section can hold additional details or visuals.</p>
    </div>
  </div>`
  },
  {
    title: 'Equal Two Block',
    content: `<div style="margin: 5px 0; display: flex; gap: 2%;">
    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Left Column</h3>
      <p style="color: #555;">Add your content here. You can replace this with text, lists, or images.</p>
    </div>
    <div style="flex: 1; background: #ffffff; border: 1px solid #eee; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Right Column</h3>
      <p style="color: #555;">This section can hold additional details or visuals.</p>
    </div>
  </div>`
  },
  {
    title: 'Highlighted Box',
    content: `<div style="background: #fff7e5; border-left: 6px solid #f39c12; padding: 5px; border-radius: 6px; margin: 5px 0;">
      <strong style="color: #e67e22;">Note:</strong> You can use this section to highlight important information or warnings.
    </div>
`
  },
  {
    title: 'Centered Title Section',
    content: `<div class="template-block" style="text-align: center; padding: 5px; margin: 5px 0;"><h2>Section Title</h2><p>Write something here...</p></div>
`
  },
  {
    title: 'Info Card',
    content: `<div class="template-block" style="border: 1px solid #e0e0e0; padding: 5px; margin: 5px 0; background: #f9f9f9;"><h3 style="margin-top: 0;">Card Title</h3><p>Card content goes here...</p></div>
`
  },
  {
    title: 'Three Column Layout',
    content: `<div style="margin: 5px 0; display: flex; gap: 2%;">
    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Column 1</h3>
      <p style="color: #555;">Add your content here. You can replace this with text, lists, or images.</p>
    </div>
    <div style="flex: 1; background: #ffffff; border: 1px solid #eee; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Column 2</h3>
      <p style="color: #555;">This section can hold additional details or visuals.</p>
    </div>
    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Column 3</h3>
      <p style="color: #555;">Use this space for more content or information.</p>
    </div>
  </div>`
  },
  {
    title: 'Call to Action Box',
    content: `<div class="template-block" style="background: #e9ecef; color: #666; padding: 5px; margin: 5px 0; text-align: left;"><h3 style="margin-top: 0; color: #666;">Call to Action</h3><p>Your message here...</p></div>
`
  },
  {
    title: 'Quote/Testimonial Block',
    content: `<div style="border-left: 4px solid #3498db; padding: 5px 10px; margin: 5px 0; background: #f8fbff; border-radius: 6px;">
    <p style="font-style: italic; color: #555;">"This is a sample quote or testimonial block that looks elegant and clean."</p>
    <p style="text-align: right; font-weight: 600; color: #2c3e50;">– Author Name</p>
    </div>
`
  },
  {
    title: 'Section header Divider',
    content: `<div style="margin: 5px 0; text-align: center;">
      <h2 style="display: inline-block; background: #f1f3f4; padding: 8px 20px; border-radius: 25px; font-weight: 600; color: #333;">
        Section Title
      </h2>
    </div>
`
  },
  {
    title: 'Info Card Grid',
    content: `<div style="margin: 5px 0; display: flex; gap: 2%;">
    <div style="flex: 1; background: #f8f9fa; border-radius: 10px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <h4 style="margin-top: 0;">Card 1</h4>
      <p style="color: #555;">Small description or feature detail goes here.</p>
    </div>
    <div style="flex: 1; background: #f8f9fa; border-radius: 10px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <h4 style="margin-top: 0;">Card 2</h4>
      <p style="color: #555;">Use these to show benefits, points, or key info.</p>
    </div>
    <div style="flex: 1; background: #f8f9fa; border-radius: 10px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <h4 style="margin-top: 0;">Card 3</h4>
      <p style="color: #555;">Easily editable in CKEditor content area.</p>
    </div>
  </div>
`
  },
  {
    title: 'Highlighted Statistics Banner',
    content: `<div style="background: #2563eb; color: white; padding: 5px; border-radius: 12px; text-align: center; margin: 5px 0;">
    <h2 style="margin: 0;">75% Growth This Quarter 🚀</h2>
    <p style="margin: 8px 0 0;">Great results achieved through teamwork and innovation.</p>
  </div>
`
  }
];

const TemplateDialog = ({ isOpen, onClose, onInsertTemplate }) => {

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    onInsertTemplate(template.content);
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="template-dialog-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="template-dialog-modal"
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: 'min(90vw, 800px)',
          maxHeight: '85vh',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 24px 16px 24px',
            borderBottom: '2px solid #f0f0f0',
            background: 'white',
            borderRadius: '12px 12px 0 0',
            flexShrink: 0
          }}
        >
          <h3 style={{ margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' }}>
            Insert Template Block
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              padding: 0,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f5f5f5';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#666';
            }}
          >
            ×
          </button>
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 #f7fafc'
          }}
        >
          {templates.map((template, index) => (
            <div
              key={index}
              onClick={() => handleTemplateSelect(template)}
              style={{
                border: '2px solid #e8e8e8',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#007cba';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 124, 186, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e8e8e8';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '16px' }}>
                {template.title}
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Click to insert
              </div>
              <div style={{
                border: '1px dashed #ccc',
                padding: '12px',
                background: '#fafafa',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#666',
                lineHeight: '1.4',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                {template.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>
        {`
          .template-dialog-modal > div:last-child::-webkit-scrollbar {
            width: 8px;
          }
          .template-dialog-modal > div:last-child::-webkit-scrollbar-track {
            background: #f7fafc;
            border-radius: 4px;
          }
          .template-dialog-modal > div:last-child::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
          }
          .template-dialog-modal > div:last-child::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
          
          /* Responsive styles for template content */
          @media (max-width: 768px) {
            .template-dialog-modal > div:last-child {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              padding: 16px !important;
            }
            .template-dialog-modal {
              margin: 10px !important;
              max-width: calc(100vw - 20px) !important;
            }
            .template-dialog-modal > div:first-child {
              padding: 16px 16px 12px 16px !important;
            }
            
            /* Make flex layouts stack on mobile */
            [style*="display: flex"] {
              flex-direction: column !important;
            }
            [style*="display: flex"] > div {
              flex: none !important;
              width: 100% !important;
              margin-bottom: 10px !important;
            }
          }
          @media (max-width: 480px) {
            .template-dialog-modal {
              margin: 5px !important;
              max-width: calc(100vw - 10px) !important;
            }
            .template-dialog-modal > div:last-child {
              gap: 8px !important;
              padding: 12px !important;
            }
            .template-dialog-modal > div:first-child {
              padding: 12px 12px 8px 12px !important;
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
};

export default TemplateDialog;
