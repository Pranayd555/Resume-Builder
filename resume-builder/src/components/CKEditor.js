import React, { useEffect, useRef, useState } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import AIButton from './AIButton';
import './CKEditor.css';

const CKEditor = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  readOnly = false
}) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [editorInstance, setEditorInstance] = useState(null);

  // Update the ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize editor only once
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      ClassicEditor
        .create(editorRef.current, {
          toolbar: {
            items: [
              'bold',
              'italic',
              '|',
              'bulletedList',
              'numberedList'
            ]
          },
          placeholder: placeholder,
          readOnly: readOnly
        })
        .then(editor => {
          editorInstanceRef.current = editor;
          setEditorInstance(editor); // Update state to trigger re-render
          console.log('CKEditor: Editor instance created and set', { editor });
          
          // Set initial content
          if (value) {
            editor.setData(value);
          }
          
          // Listen for changes
          editor.model.document.on('change:data', () => {
            const data = editor.getData();
            onChangeRef.current(data);
          });
        })
        .catch(error => {
          console.error('CKEditor initialization error:', error);
        });
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
        setEditorInstance(null); // Clear state
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once - we intentionally don't include placeholder, readOnly, value to avoid recreating editor

  // Handle value updates separately
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getData()) {
      // Only update if the editor is not currently focused to avoid interrupting user input
      if (!editorInstanceRef.current.editing.view.document.isFocused) {
        editorInstanceRef.current.setData(value || '');
      }
    }
  }, [value]);

  return (
    <div className={`ckeditor-container ${className}`}>
      <AIButton 
        editorInstance={editorInstance}
        onContentChange={onChange}
      />
      <div ref={editorRef}></div>
    </div>
  );
};

export default CKEditor;
