import React, { useEffect, useState, useMemo, useRef } from "react";
import Editor from "../ckeditor/ckeditor.js";
import AIButton from "./AIButton";
import TemplateDialog from "./TemplateDialog";
import "../plugins/TemplateBlocksPlugin.css";
// import "./CKEditor.css";

// Insert template into editor with type-around functionality
const insertTemplate = (editor, templateContent) => {
    // Get the current selection
    const selection = editor.model.document.selection;

    // Get the position where the cursor is currently located
    const position = selection.getFirstPosition();

    // Wrap template content with type-around functionality
    const wrappedTemplate = wrapTemplateWithTypeAround(templateContent);

    // Create a document fragment from the wrapped template content
    const viewFragment = editor.data.processor.toView(wrappedTemplate);

    // Convert view fragment to model fragment
    const modelFragment = editor.data.toModel(viewFragment);

    // Insert the template content at the current cursor position
    editor.model.insertContent(modelFragment, position);

    // Focus the editor after insertion
    editor.editing.view.focus();
};

// Wrap template content with type-around functionality
const wrapTemplateWithTypeAround = (templateContent) => {
    // Create the type-around button HTML
    const typeAroundButtons = `
    <div class="ck ck-reset_all ck-widget__type-around">
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block" aria-hidden="true" style="display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 14px; font-weight: 600; color: white; line-height: 1;">+</span>
      </div>
      <div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block" aria-hidden="true" style="display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 14px; font-weight: 600; color: white; line-height: 1;">+</span>
      </div>
      <div class="ck ck-widget__type-around__fake-caret"></div>
    </div>
  `;

    // Create selection handle HTML
    const selectionHandle = ``;

    // Wrap the template content with the widget structure
    const wrappedContent = `
    <div class="ck-widget template-block-widget" style="position: relative; margin: 10px 0;">
      ${selectionHandle}
      <div class="template-block-content" style="position: relative; z-index: 1;">
        ${templateContent}
      </div>
      ${typeAroundButtons}
    </div>
  `;

    return wrappedContent;
};

// Setup type-around button functionality
const setupTypeAroundButtons = (editor) => {
    // Function to handle type-around button clicks
    const handleTypeAroundClick = (event, position) => {
        event.preventDefault();
        event.stopPropagation();

        // Get the current selection
        const selection = editor.model.document.selection;
        const currentPosition = selection.getFirstPosition();

        // Create a new paragraph element
        const paragraphHtml = "<p>&nbsp;</p>";
        const viewFragment = editor.data.processor.toView(paragraphHtml);
        const modelFragment = editor.data.toModel(viewFragment);

        // Insert the paragraph at the specified position
        if (position === "before") {
            // Find the position before the current template block
            const templateBlock = currentPosition.parent;
            if (
                templateBlock &&
                (templateBlock.name === "figure" || templateBlock.name === "div")
            ) {
                const insertPosition = editor.model.createPositionBefore(templateBlock);
                editor.model.insertContent(modelFragment, insertPosition);
            }
        } else if (position === "after") {
            // Find the position after the current template block
            const templateBlock = currentPosition.parent;
            if (
                templateBlock &&
                (templateBlock.name === "figure" || templateBlock.name === "div")
            ) {
                const insertPosition = editor.model.createPositionAfter(templateBlock);
                editor.model.insertContent(modelFragment, insertPosition);
            }
        }

        // Focus the editor
        editor.editing.view.focus();
    };

    // Add event listeners for type-around buttons
    const addTypeAroundListeners = () => {
        const editorElement = document.querySelector(".ck-editor__editable");
        if (!editorElement) return;

        // Remove existing listeners to avoid duplicates
        editorElement.removeEventListener("click", handleTypeAroundClick);

        // Add new listeners
        editorElement.addEventListener("click", (event) => {
            const target = event.target;

            // Check if clicked element is a type-around button
            if (target.closest(".ck-widget__type-around__button_before")) {
                handleTypeAroundClick(event, "before");
            } else if (target.closest(".ck-widget__type-around__button_after")) {
                handleTypeAroundClick(event, "after");
            }
        });
    };

    // Setup listeners when editor is ready
    setTimeout(() => {
        addTypeAroundListeners();
    }, 100);

    // Re-setup listeners when content changes
    editor.model.document.on("change", () => {
        setTimeout(() => {
            addTypeAroundListeners();
        }, 50);
    });
};

const CustomCKEditorComponent = ({
    value,
    onChange,
    placeholder = "",
    className = "",
    readOnly = false,
    configType = "base", // "base" or "pro"
    showAIButton = true, // Show AI button by default
    isProMode = false, // Pro mode for different AI button functionality
    onAIContentChange = null, // Callback for AI content changes
    onAILoading = null, // Callback for AI loading state
    originalText = null // if original resumeData available
}) => {
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [editorInstance, setEditorInstance] = useState(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [lastValue, setLastValue] = useState(value);

    const editorRef = useRef(null);
    const editorInstanceRef = useRef(null);

    // Update lastValue when value prop changes
    useEffect(() => {
        setLastValue(value);
    }, [value]);

    // Handle value changes to update editor content
    useEffect(() => {
        if (editorInstance && value !== lastValue) {
            // Update editor content if value has changed
            if (value !== editorInstance.getData()) {
                editorInstance.setData(value || "");
            }
            setLastValue(value);
        }
    }, [value, editorInstance, lastValue]);

    useEffect(() => {
        setIsLayoutReady(true);

        // Detect mobile device
        const checkMobile = () => {
            const isMobileDevice =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                ) || window.innerWidth <= 768;
            setIsMobile(isMobileDevice);
            return isMobileDevice;
        };

        checkMobile();

        // Mobile-specific fixes for CKEditor
        const handleMobileTouch = () => {
            // Force focus on mobile devices
            const editorElement = document.querySelector(".ck-editor__editable");
            if (editorElement) {
                editorElement.style.webkitUserSelect = "text";
                editorElement.style.userSelect = "text";
                editorElement.style.webkitTouchCallout = "default";
                editorElement.style.touchAction = "manipulation";
            }
        };

        // Add mobile touch event listeners
        const addMobileListeners = () => {
            const editorElement = document.querySelector(".ck-editor__editable");
            if (editorElement) {
                // Prevent default touch behaviors that interfere with text selection
                editorElement.addEventListener(
                    "touchstart",
                    (e) => {
                        e.stopPropagation();
                    },
                    { passive: true }
                );

                editorElement.addEventListener(
                    "touchend",
                    (e) => {
                        e.stopPropagation();
                        // Ensure focus on touch
                        setTimeout(() => {
                            if (editorElement) {
                                editorElement.focus();
                            }
                        }, 100);
                    },
                    { passive: true }
                );

                // Fix for iOS Safari keyboard issues
                editorElement.addEventListener("focus", () => {
                    editorElement.style.webkitUserSelect = "text";
                    editorElement.style.userSelect = "text";
                    editorElement.style.webkitTouchCallout = "default";
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
    const editorConfig = useMemo(() => {
        const baseConfig = {
            toolbar: {
                items: [
                    "undo",
                    "redo",
                    "|",
                    "heading",
                    "|",
                    "fontSize",
                    "fontColor",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "|",
                    "alignment",
                    "|",
                    "bulletedList",
                    "numberedList",
                    "outdent",
                    "indent",
                    "|",
                    "link",
                ],
                shouldNotGroupWhenFull: true,
            },
            fontSize: {
                options: [10, 12, 14, "default", 18, 20, 22],
                supportAllValues: true,
            },
            fontColor: {
                colors: [
                    { color: "hsl(0, 0%, 0%)", label: "Black" },
                    { color: "hsl(0, 0%, 30%)", label: "Dim grey" },
                    { color: "hsl(0, 0%, 60%)", label: "Grey" },
                    { color: "hsl(0, 0%, 90%)", label: "Light grey" },
                    { color: "hsl(0, 0%, 100%)", label: "White", hasBorder: true },
                    { color: "hsl(0, 75%, 60%)", label: "Red" },
                    { color: "hsl(30, 75%, 60%)", label: "Orange" },
                    { color: "hsl(60, 75%, 60%)", label: "Yellow" },
                    { color: "hsl(90, 75%, 60%)", label: "Light green" },
                    { color: "hsl(120, 75%, 60%)", label: "Green" },
                    { color: "hsl(150, 75%, 60%)", label: "Aquamarine" },
                    { color: "hsl(180, 75%, 60%)", label: "Turquoise" },
                    { color: "hsl(210, 75%, 60%)", label: "Light blue" },
                    { color: "hsl(240, 75%, 60%)", label: "Blue" },
                    { color: "hsl(270, 75%, 60%)", label: "Purple" },
                ],
            },
            heading: {
                options: [
                    {
                        model: "paragraph",
                        title: "Paragraph",
                        class: "ck-heading_paragraph",
                    },
                    {
                        model: "heading1",
                        view: "h1",
                        title: "Heading 1",
                        class: "ck-heading_heading1",
                    },
                    {
                        model: "heading2",
                        view: "h2",
                        title: "Heading 2",
                        class: "ck-heading_heading2",
                    },
                    {
                        model: "heading3",
                        view: "h3",
                        title: "Heading 3",
                        class: "ck-heading_heading3",
                    },
                    {
                        model: "heading4",
                        view: "h4",
                        title: "Heading 4",
                        class: "ck-heading_heading4",
                    },
                    {
                        model: "heading5",
                        view: "h5",
                        title: "Heading 5",
                        class: "ck-heading_heading5",
                    },
                    {
                        model: "heading6",
                        view: "h6",
                        title: "Heading 6",
                        class: "ck-heading_heading6",
                    },
                ],
            },
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: "https://",
            },
            initialData: value || ``,
            placeholder: placeholder || "Start designing your template here...",
            htmlSupport: {
                allow: [
                    {
                        name: /.*/,
                        attributes: true,
                        classes: true,
                        styles: true
                    }
                ]
            },
            image: {
                upload: {
                    types: ['jpeg', 'png', 'jpg', 'gif'],
                }
            }
        };

        const proConfig = {
            toolbar: {
                items: [
                    'undo',
                    'redo',
                    '|',
                    'sourceEditing',
                    'showBlocks',
                    'findAndReplace',
                    'selectAll',
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
                    'removeFormat',
                    '|',
                    'specialCharacters',
                    'horizontalLine',
                    'pageBreak',
                    'insertImage',
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

                ],
                shouldNotGroupWhenFull: true
            },
            fontSize: {
                options: [10, 12, 14, "default", 18, 20, 22],
                supportAllValues: true,
            },
            fontColor: {
                colors: [
                    { color: "hsl(0, 0%, 0%)", label: "Black" },
                    { color: "hsl(0, 0%, 30%)", label: "Dim grey" },
                    { color: "hsl(0, 0%, 60%)", label: "Grey" },
                    { color: "hsl(0, 0%, 90%)", label: "Light grey" },
                    { color: "hsl(0, 0%, 100%)", label: "White", hasBorder: true },
                    { color: "hsl(0, 75%, 60%)", label: "Red" },
                    { color: "hsl(30, 75%, 60%)", label: "Orange" },
                    { color: "hsl(60, 75%, 60%)", label: "Yellow" },
                    { color: "hsl(90, 75%, 60%)", label: "Light green" },
                    { color: "hsl(120, 75%, 60%)", label: "Green" },
                    { color: "hsl(150, 75%, 60%)", label: "Aquamarine" },
                    { color: "hsl(180, 75%, 60%)", label: "Turquoise" },
                    { color: "hsl(210, 75%, 60%)", label: "Light blue" },
                    { color: "hsl(240, 75%, 60%)", label: "Blue" },
                    { color: "hsl(270, 75%, 60%)", label: "Purple" },
                ],
            },
            heading: {
                options: [
                    {
                        model: "paragraph",
                        title: "Paragraph",
                        class: "ck-heading_paragraph",
                    },
                    {
                        model: "heading1",
                        view: "h1",
                        title: "Heading 1",
                        class: "ck-heading_heading1",
                    },
                    {
                        model: "heading2",
                        view: "h2",
                        title: "Heading 2",
                        class: "ck-heading_heading2",
                    },
                    {
                        model: "heading3",
                        view: "h3",
                        title: "Heading 3",
                        class: "ck-heading_heading3",
                    },
                    {
                        model: "heading4",
                        view: "h4",
                        title: "Heading 4",
                        class: "ck-heading_heading4",
                    },
                    {
                        model: "heading5",
                        view: "h5",
                        title: "Heading 5",
                        class: "ck-heading_heading5",
                    },
                    {
                        model: "heading6",
                        view: "h6",
                        title: "Heading 6",
                        class: "ck-heading_heading6",
                    },
                ],
            },
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: "https://",
            },
            initialData: value || ``,
            placeholder: placeholder || "Start designing your template here...",
            htmlSupport: {
                allow: [
                    {
                        name: /.*/,
                        attributes: true,
                        classes: true,
                        styles: true
                    }
                ]
            },
        };

        // Return configuration based on configType
        return configType === "pro" ? proConfig : baseConfig;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholder, configType]); // Removed value from dependencies to prevent re-initialization

    const isInitializingRef = useRef(false);

    // Initialize CKEditor manually
    useEffect(() => {
        if (!isLayoutReady || !editorRef.current) return;

        // Prevent double initialization
        if (editorInstanceRef.current || isInitializingRef.current) return;

        isInitializingRef.current = true;
        console.log("Initializing CKEditor...");
        console.log("Editor class/object:", Editor);
        console.log("Editor.create type:", typeof Editor.create);
        console.log("Editor.builtinPlugins:", Editor.builtinPlugins);
        console.log("Editor.defaultConfig:", Editor.defaultConfig);
        console.log("window.CKEDITOR:", window.CKEDITOR);
        console.log("window.ClassicEditor:", window.ClassicEditor);
        console.log("Editor.prototype:", Editor.prototype);

        const createPromise = Editor.create(editorRef.current, editorConfig);
        console.log("Create promise:", createPromise);

        createPromise
            .then((editor) => {
                console.log("CKEditor initialized:", editor);

                // Fallback: Check if instance is attached to DOM
                if (!editor && editorRef.current && editorRef.current.ckeditorInstance) {
                    console.log("Found instance on DOM:", editorRef.current.ckeditorInstance);
                    editor = editorRef.current.ckeditorInstance;
                }

                if (!editor) {
                    console.error("CKEditor initialized but instance is undefined");
                    isInitializingRef.current = false;
                    return;
                }

                editorInstanceRef.current = editor;
                setEditorInstance(editor);
                isInitializingRef.current = false;

                // Mobile-specific initialization
                const editorElement = editor.editing.view.document.getRoot();
                if (editorElement) {
                    // Fix mobile keyboard focus
                    editorElement.on("focus", () => {
                        const editableElement = document.querySelector(
                            ".ck-editor__editable"
                        );
                        if (editableElement) {
                            editableElement.style.webkitUserSelect = "text";
                            editableElement.style.userSelect = "text";
                            editableElement.style.webkitTouchCallout = "default";
                            editableElement.style.touchAction = "manipulation";
                        }
                    });
                }

                // Add type-around button functionality
                setupTypeAroundButtons(editor);

                // Handle data change
                editor.model.document.on("change:data", () => {
                    const data = editor.getData();
                    if (onChange) {
                        onChange(data);
                    }
                });
            })
            .catch((error) => {
                console.error("CKEditor initialization error:", error);
                isInitializingRef.current = false;
            });

        return () => {
            if (editorInstanceRef.current) {
                console.log("Destroying CKEditor instance");
                editorInstanceRef.current
                    .destroy()
                    .then(() => {
                        editorInstanceRef.current = null;
                        setEditorInstance(null);
                    })
                    .catch((error) => {
                        console.error("CKEditor destroy error:", error);
                    });
            }
        };
    }, [isLayoutReady, editorConfig, onChange]); // Re-initialize if config changes

    return (
        <div
            className={`ckeditor-container ${isMobile ? "mobile-editor" : ""
                } ${className}`}
            style={{ position: "relative", overflow: "visible" }}
        >
            {showAIButton && (
                <div
                    className="mt-2 ml-2"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <AIButton
                        editorInstance={editorInstance}
                        onContentChange={onChange}
                        isProMode={isProMode}
                        onAIContentChange={onAIContentChange}
                        onAILoading={onAILoading}
                        originalText={originalText === value ? null : originalText}
                        isMobile={isMobile}
                    />
                    {isProMode && (
                        <button
                            onClick={() => {
                                setShowTemplateDialog(true);
                            }}
                            className="template-button-simple"
                            style={{
                                background: "linear-gradient(to right, #f97316, #dc2626)",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 16px",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
                                height: "40px",
                                minWidth: "120px",
                                justifyContent: "center",
                                marginBottom: "10px",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background =
                                    "linear-gradient(to right, #ea580c, #b91c1c)";
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(249, 115, 22, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background =
                                    "linear-gradient(to right, #f97316, #dc2626)";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 2px 8px rgba(249, 115, 22, 0.3)";
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                />
                            </svg>
                            Template
                        </button>
                    )}
                </div>
            )}
            {isLayoutReady && (
                <div style={{ position: "relative", overflow: "visible" }}>
                    <div ref={editorRef} />
                </div>
            )}

            {/* Template Dialog */}
            <TemplateDialog
                isOpen={showTemplateDialog}
                onClose={() => setShowTemplateDialog(false)}
                onInsertTemplate={(templateContent) => {
                    if (editorInstance) {
                        insertTemplate(editorInstance, templateContent);
                    }
                }}
            />
        </div>
    );
};

export default CustomCKEditorComponent;
