import React, { useEffect, useState, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import AIButton from './AIButton';
import './CKEditor.css';
import { API_BASE_URL } from '../config/api';

const LICENSE_KEY = API_BASE_URL.includes('localhost') ?
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTE5MzU5OTksImp0aSI6IjBiZjkyNDIxLTE1Y2UtNDI3Ny1hOWUzLTBhMWU5ZjIxZTgxNSIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIiwiRTJQIiwiRTJXIl0sInJlbW92ZUZlYXR1cmVzIjpbIlBCIiwiUkYiLCJTQ0giLCJUQ1AiLCJUTCIsIlRDUiIsIklSIiwiU1VBIiwiQjY0QSIsIkxQIiwiSEUiLCJSRUQiLCJQRk8iLCJXQyIsIkZBUiIsIkJLTSIsIkZQSCIsIk1SRSJdLCJ2YyI6IjJkYjI3M2U5In0.Flw0SF8GzKz1_VFPxIuDUn0fZl-EMfekTddDljh3GQ4apahLIe5H6pLeQFiR0GaRUrmPZvyxmRLmKqqYtousbw' : 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTE5MzU5OTksImp0aSI6IjJjYTdiYThmLWI4OWItNDUxNy1iMDRhLWMwYzVhMWVmMzk4OCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJkOGEzMzQzZSJ9.79PAxzpMDDpiXzn3nnzjf2cX3Eugwtdn7UDb1MnvRkQ5SGlKUz2PPO5XrPs4xkq4snIfxxo-IgBBoNFuYwij2Q';

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
      AutoLink,
      CloudServices
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
            'todoList',
            'outdent',
            'indent',
            '|',
            'link'
          ],
          shouldNotGroupWhenFull: true
        },
        plugins: [
          Alignment,
          AutoLink,
          Autosave,
          Bold,
          CloudServices,
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
      CloudServices,
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
      Fullscreen,
      Autoformat,
      TextTransformation,
      MediaEmbed,
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
            'fullscreen',
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
            'mediaEmbed',
            'insertTable',
            'highlight',
            'blockQuote',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
            '|',
            'imageUpload',
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
          CloudServices,
          Code,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          Fullscreen,
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
          MediaEmbed,
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
        fullscreen: {
          onEnterCallback: container =>
            container.classList.add(
              'editor-container',
              'editor-container_classic-editor',
              'editor-container_include-style',
              'editor-container_include-fullscreen',
              'main-container'
            )
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