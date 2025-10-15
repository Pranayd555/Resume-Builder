import React, { useEffect, useState, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import AIButton from './AIButton';
import '../plugins/TemplateBlocksPlugin.css';
import './CKEditor.css';

// Get CKEditor license key from environment variables
const getLicenseKey = () => {
  // Check for environment variable first (for production)
  if (process.env.REACT_APP_CKEDITOR_LICENSE_KEY) {
    return process.env.REACT_APP_CKEDITOR_LICENSE_KEY;
  }
};

const LICENSE_KEY = getLicenseKey();

// Template data structure
const templates = [
  {
    title: 'Two Column Block',
    content: `<div style="display: flex; gap: 10px; margin: 10px 0;"><div style="flex: 1; border: 1px dashed #ccc; padding: 10px; min-height: 50px;">Left Column</div><div style="flex: 1; border: 1px dashed #ccc; padding: 10px; min-height: 50px;">Right Column</div></div>`
  },
  {
    title: 'Highlighted Box',
    content: `<div style="border: 2px solid #f39c12; padding: 15px; background: #fff8e1; margin: 10px 0; border-radius: 4px;">Highlighted Text Here</div>`
  },
  {
    title: 'Centered Title Section',
    content: `<section style="text-align: center; padding: 20px; margin: 10px 0;"><h2>Section Title</h2><p>Write something here...</p></section>`
  },
  {
    title: 'Info Card',
    content: `<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 10px 0; background: #f9f9f9;"><h3 style="margin-top: 0;">Card Title</h3><p>Card content goes here...</p></div>`
  },
  {
    title: 'Three Column Layout',
    content: `<div style="display: flex; gap: 10px; margin: 10px 0;"><div style="flex: 1; border: 1px dashed #ccc; padding: 10px; min-height: 50px;">Column 1</div><div style="flex: 1; border: 1px dashed #ccc; padding: 10px; min-height: 50px;">Column 2</div><div style="flex: 1; border: 1px dashed #ccc; padding: 10px; min-height: 50px;">Column 3</div></div>`
  },
  {
    title: 'Call to Action Box',
    content: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: 10px 0; border-radius: 8px; text-align: center;"><h3 style="margin-top: 0; color: white;">Call to Action</h3><p>Your message here...</p></div>`
  }
];

// Initialize Template Blocks functionality
const initializeTemplateBlocks = (editor) => {
  // Create the toolbar button
  editor.ui.componentFactory.add('insertTemplate', locale => {
    const buttonView = editor.ui.componentFactory.create('button', locale);
    
    buttonView.set({
      label: 'Insert Template',
      icon: `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`,
      tooltip: true,
      isToggleable: false
    });

    // Execute command on click
    buttonView.on('execute', () => {
      showTemplateDialog(editor);
    });

    return buttonView;
  });
};

// Show template selection dialog
const showTemplateDialog = (editor) => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'template-blocks-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'template-blocks-modal';
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    position: relative;
  `;

  // Create header
  const header = document.createElement('div');
  header.className = 'template-blocks-header';
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
  `;

  const title = document.createElement('h3');
  title.className = 'template-blocks-title';
  title.textContent = 'Insert Template Block';
  title.style.cssText = 'margin: 0; color: #333; font-size: 20px; font-weight: 600;';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'template-blocks-close';
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  `;

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create template grid
  const grid = document.createElement('div');
  grid.className = 'template-blocks-grid';
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  `;

  // Create template items
  templates.forEach((template, index) => {
    const templateItem = document.createElement('div');
    templateItem.className = 'template-blocks-item';
    templateItem.style.cssText = `
      border: 2px solid #e8e8e8;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      position: relative;
      overflow: hidden;
    `;

    templateItem.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 16px;">${template.title}</div>
      <div style="font-size: 13px; color: #666; margin-bottom: 12px;">Click to insert</div>
      <div style="border: 1px dashed #ccc; padding: 12px; background: #fafafa; border-radius: 6px; font-size: 12px; color: #666; line-height: 1.4; min-height: 60px; display: flex; align-items: center; justify-content: center; text-align: center;">
        ${template.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
      </div>
    `;

    // Hover effects
    templateItem.addEventListener('mouseenter', () => {
      templateItem.style.borderColor = '#007cba';
      templateItem.style.boxShadow = '0 8px 25px rgba(0, 124, 186, 0.15)';
      templateItem.style.transform = 'translateY(-2px)';
    });

    templateItem.addEventListener('mouseleave', () => {
      templateItem.style.borderColor = '#e8e8e8';
      templateItem.style.boxShadow = 'none';
      templateItem.style.transform = 'translateY(0)';
    });

    // Click handler
    templateItem.addEventListener('click', () => {
      insertTemplate(editor, template.content);
      closeDialog(overlay);
    });

    grid.appendChild(templateItem);
  });

  // Close handlers
  const closeDialog = (overlay) => {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };
  
  closeBtn.addEventListener('click', () => closeDialog(overlay));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog(overlay);
  });

  // Escape key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeDialog(overlay);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(grid);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus management
  setTimeout(() => {
    const firstTemplate = grid.querySelector('div');
    if (firstTemplate) firstTemplate.focus();
  }, 100);
};

// Insert template into editor
const insertTemplate = (editor, templateContent) => {
  // Use the editor's insertContent method
  editor.model.change(writer => {
    const selection = editor.model.document.selection;
    const position = selection.getFirstPosition();
    
    // Insert HTML content directly
    const viewFragment = editor.data.processor.toView(templateContent);
    const modelFragment = editor.data.toModel(viewFragment);
    
    editor.model.insertContent(modelFragment, position);
  });
};

const CKEditorComponent = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  readOnly = false,
  configType = "base", // "base" or "pro"
  showAIButton = true, // Show AI button by default
  isProMode = false // Pro mode for different AI button functionality
}) => {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const cloud = useCKEditorCloud({ version: '47.0.0' });

  useEffect(() => {
    setIsLayoutReady(true);
    
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };
    
    checkMobile();
    
    // Mobile-specific fixes for CKEditor
    const handleMobileTouch = () => {
      // Force focus on mobile devices
      const editorElement = document.querySelector('.ck-editor__editable');
      if (editorElement) {
        editorElement.style.webkitUserSelect = 'text';
        editorElement.style.userSelect = 'text';
        editorElement.style.webkitTouchCallout = 'default';
        editorElement.style.touchAction = 'manipulation';
      }
    };
    
    // Add mobile touch event listeners
    const addMobileListeners = () => {
      const editorElement = document.querySelector('.ck-editor__editable');
      if (editorElement) {
        // Prevent default touch behaviors that interfere with text selection
        editorElement.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        }, { passive: true });
        
        editorElement.addEventListener('touchend', (e) => {
          e.stopPropagation();
          // Ensure focus on touch
          setTimeout(() => {
            if (editorElement) {
              editorElement.focus();
            }
          }, 100);
        }, { passive: true });
        
        // Fix for iOS Safari keyboard issues
        editorElement.addEventListener('focus', () => {
          editorElement.style.webkitUserSelect = 'text';
          editorElement.style.userSelect = 'text';
          editorElement.style.webkitTouchCallout = 'default';
        });
      }
    };
    
    // Apply mobile fixes after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      handleMobileTouch();
      addMobileListeners();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setIsLayoutReady(false);
    };
  }, []);

  // Base configuration with basic functionalities
  const createBaseConfig = useMemo(() => (plugins) => {
    const {
      ClassicEditor,
      Autosave,
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      FontColor,
      FontSize,
      List,
      TodoList,
      Indent,
      IndentBlock,
      Alignment,
      Link,
      AutoLink
    } = plugins;

    return {
      ClassicEditor,
      editorConfig: {
        toolbar: {
          items: [
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'fontSize',
            'fontColor',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'outdent',
            'indent',
            '|',
            'link',
            '|',
            'insertTemplate'
          ],
          shouldNotGroupWhenFull: true
        },
        plugins: [
          Alignment,
          AutoLink,
          Autosave,
          Bold,
          Essentials,
          FontColor,
          FontSize,
          Heading,
          Indent,
          IndentBlock,
          Italic,
          Link,
          List,
          Paragraph,
          TodoList,
          Underline
        ],
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 22],
          supportAllValues: true
        },
        fontColor: {
          colors: [
            { color: 'hsl(0, 0%, 0%)', label: 'Black' },
            { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
            { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
            { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
            { color: 'hsl(0, 75%, 60%)', label: 'Red' },
            { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
            { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
            { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 60%)', label: 'Green' },
            { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
            { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
            { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
            { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
            { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
          ]
        },
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
          ]
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://'
        },
        initialData: value || ` Welcome to Your Resume Template Builder `,
        placeholder: placeholder || 'Start designing your template here...',
        licenseKey: LICENSE_KEY,
        // Mobile-specific configuration
        mobile: {
          // Enable mobile-specific features
          enableMobileSupport: true,
          // Prevent zoom on double tap
          preventZoom: true
        },
        // Ensure HTML output format
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true
            }
          ]
        }
      }
    };
  }, [value, placeholder]);

  // Pro configuration with all plugins
  const createProConfig = useMemo(() => (plugins) => {
    const {
      ClassicEditor,
      Autosave,
      Essentials,
      Paragraph,
      ImageUtils,
      ImageEditing,
      Heading,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Subscript,
      Superscript,
      Code,
      BlockQuote,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Highlight,
      Indent,
      IndentBlock,
      Alignment,
      Link,
      AutoLink,
      HorizontalLine,
      ImageBlock,
      ImageToolbar,
      ImageInline,
      ImageInsertViaUrl,
      AutoImage,
      ImageUpload,
      ImageStyle,
      LinkImage,
      ImageCaption,
      ImageTextAlternative,
      List,
      TodoList,
      Table,
      TableToolbar,
      TableCaption,
      Style,
      GeneralHtmlSupport,
      Autoformat,
      TextTransformation,
      PlainTableOutput,
      SourceEditing,
      ShowBlocks,
      HtmlComment,
      TextPartLanguage
    } = plugins;

    return {
      ClassicEditor,
      editorConfig: {
        toolbar: {
          items: [
            'undo',
            'redo',
            '|',
            'sourceEditing',
            'showBlocks',
            'textPartLanguage',
            '|',
            'heading',
            'style',
            '|',
            'fontSize',
            'fontFamily',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'subscript',
            'superscript',
            'code',
            '|',
            'horizontalLine',
            'link',
            'insertTable',
            'highlight',
            'blockQuote',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'outdent',
            'indent',
            '|',
            'imageUpload',
            '|',
            'insertTemplate'
          ],
          shouldNotGroupWhenFull: true
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BlockQuote,
          Bold,
          Code,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          HtmlComment,
          ImageBlock,
          ImageCaption,
          ImageEditing,
          ImageInline,
          ImageInsertViaUrl,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          ImageUtils,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          Paragraph,
          PlainTableOutput,
          ShowBlocks,
          SourceEditing,
          Strikethrough,
          Style,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableToolbar,
          TextPartLanguage,
          TextTransformation,
          TodoList,
          Underline
        ],
        fontFamily: {
          supportAllValues: true
        },
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 22],
          supportAllValues: true
        },
        fontColor: {
          colors: [
            { color: 'hsl(0, 0%, 0%)', label: 'Black' },
            { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
            { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
            { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
            { color: 'hsl(0, 75%, 60%)', label: 'Red' },
            { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
            { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
            { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 60%)', label: 'Green' },
            { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
            { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
            { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
            { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
            { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
          ]
        },
        fontBackgroundColor: {
          colors: [
            { color: 'hsl(0, 0%, 0%)', label: 'Black' },
            { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
            { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
            { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
            { color: 'hsl(0, 75%, 60%)', label: 'Red' },
            { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
            { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
            { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 60%)', label: 'Green' },
            { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
            { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
            { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
            { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
            { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
          ]
        },
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
          ]
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true
            }
          ]
        },
        image: {
          toolbar: ['toggleImageCaption', 'imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText']
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file'
              }
            }
          }
        },
        style: {
          definitions: [
            { name: 'Article category', element: 'h3', classes: ['category'] },
            { name: 'Title', element: 'h2', classes: ['document-title'] },
            { name: 'Subtitle', element: 'h3', classes: ['document-subtitle'] },
            { name: 'Info box', element: 'p', classes: ['info-box'] },
            { name: 'CTA Link Primary', element: 'a', classes: ['button', 'button--green'] },
            { name: 'CTA Link Secondary', element: 'a', classes: ['button', 'button--black'] },
            { name: 'Marker', element: 'span', classes: ['marker'] },
            { name: 'Spoiler', element: 'span', classes: ['spoiler'] }
          ]
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        initialData: value || ` Welcome to Your Resume Template Builder `,
        placeholder: placeholder || 'Start designing your template here...',
        licenseKey: LICENSE_KEY,
        // Mobile-specific configuration
        mobile: {
          // Enable mobile-specific features
          enableMobileSupport: true,
          // Prevent zoom on double tap
          preventZoom: true
        }
      }
    };
  }, [value, placeholder]);

  const { ClassicEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== 'success' || !isLayoutReady) {
      return {};
    }

    const plugins = cloud.CKEditor;

    // Return configuration based on configType
    if (configType === "pro") {
      return createProConfig(plugins);
    } else {
      return createBaseConfig(plugins);
    }
  }, [cloud, isLayoutReady, configType, createBaseConfig, createProConfig]);

  return (
    <div className={`ckeditor-container ${isMobile ? 'mobile-editor' : ''} ${className}`} style={{ position: 'relative', overflow: 'visible' }}>
      {showAIButton && (
        <div className="mt-2 ml-2">
        <AIButton 
          editorInstance={editorInstance}
            onContentChange={onChange}
            isProMode={isProMode}
          />
        </div>
      )}
      {ClassicEditor && editorConfig && (
        <div style={{ position: 'relative', overflow: 'visible' }}>
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            onReady={editor => {
              setEditorInstance(editor);
              
              // Initialize Template Blocks Plugin
              initializeTemplateBlocks(editor);
              
              // Mobile-specific initialization
              const editorElement = editor.editing.view.document.getRoot();
              if (editorElement) {
                // Fix mobile keyboard focus
                editorElement.on('focus', () => {
                  const editableElement = document.querySelector('.ck-editor__editable');
                  if (editableElement) {
                    editableElement.style.webkitUserSelect = 'text';
                    editableElement.style.userSelect = 'text';
                    editableElement.style.webkitTouchCallout = 'default';
                    editableElement.style.touchAction = 'manipulation';
                  }
                });
              }
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              // Ensure we always get HTML format
              
              // Force HTML output if the data looks like markdown
              if (data.includes('##') || data.includes('**') || (data.includes('*') && !data.includes('<'))) {
                // Convert markdown to HTML as fallback
                const htmlData = data
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                  .replace(/\n/gim, '<br>');
                onChange(htmlData);
              } else {
                onChange(data);
              }
            }}
            onBlur={(event, editor) => {
            }}
            onFocus={(event, editor) => {
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CKEditorComponent;