import React, { useState, useRef, useEffect } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './CKEditor.css';

const CreateTemplate = () => {
  const [templateContent, setTemplateContent] = useState('<p>Hello from CKEditor 5!</p>');
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      ClassicEditor
        .create(editorRef.current, {
          toolbar: {
            items: [
              'heading',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'bulletedList',
              'numberedList',
              'todoList',
              '|',
              'outdent',
              'indent',
              '|',
              'link',
              'blockquote',
              'imageUpload',
              'insertTable',
              'mediaEmbed',
              '|',
              'undo',
              'redo',
              '|',
              'alignment',
              'fontColor',
              'fontBackgroundColor',
              'highlight',
              'fontSize',
              'fontFamily'
            ]
          },
          placeholder: "Start designing your template here..."
        })
        .then(editor => {
          editorInstanceRef.current = editor;
          console.log('CKEditor: Editor instance created and set', { editor });

          // Set initial content
          if (templateContent) {
            editor.setData(templateContent);
          }

          // Listen for changes
          editor.model.document.on('change:data', () => {
            const data = editor.getData();
            setTemplateContent(data);
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
      }
    };
  }, [templateContent]); // Add templateContent to dependency array

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Create Your Own Template
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">
          This is where you will create your custom resume template. Use the editor below to design your template.
        </p>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ckeditor-container">
          <div ref={editorRef}></div>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;