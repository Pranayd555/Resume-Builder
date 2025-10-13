import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CKEditorComponent from './CKEditor';
import AnimatedBackground from './AnimatedBackground';
import api, { apiHelpers } from '../services/api';
import './CreateTemplate.css';

const CreateTemplate = () => {
	const navigate = useNavigate();
	const [templateContent, setTemplateContent] = useState('<h2>Welcome to Your Resume Template Builder</h2>');
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	const handleGeneratePDF = async () => {
		if (!templateContent || templateContent.trim() === '') {
			alert('Please add some content to your template before generating PDF');
			return;
		}

		setIsGeneratingPDF(true);
		try {
			console.log('Making API call to createTemplate endpoint...');
			console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
			
			const response = await api.post('/createTemplate', {
				content: templateContent,
				title: 'Custom Template'
			}, {
				responseType: 'blob' // Important for PDF downloads
			});

			// Create blob from response data
			const blob = new Blob([response.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'custom-template.pdf';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Error generating PDF:', error);
			const errorMessage = apiHelpers.formatError(error);
			alert(`Failed to generate PDF: ${errorMessage}`);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="min-h-screen relative">
			<AnimatedBackground />
			<div className="relative z-10 container mx-auto px-4 pt-20 pb-8">
				<div className="max-w-6xl mx-auto">
					<div className="rounded-lg p-4 mb-6 relative z-[60]">
						<button
							onClick={() => navigate(-1)}
							className="flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Back
						</button>
					</div>
					
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
						Create Your Own Template
					</h1>
					<p className="text-white/80 text-base sm:text-lg mb-4">
						This is where you will create your custom resume template. Use the editor below to design your template.
					</p>
					<div className="bg-white dark:bg-white shadow-lg rounded-lg p-2 sm:p-4 lg:p-6 ckeditor-container overflow-x-auto w-full">
						<div className="main-container">
							<div className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-fullscreen w-full">
								<div className="editor-container__editor">
									<CKEditorComponent
										value={templateContent}
										onChange={setTemplateContent}
										placeholder="Start designing your template here..."
										configType="pro"
									/>
								</div>
							</div>
						</div>
					</div>
					
					<div className="mt-6 flex justify-center">
						<button
							onClick={handleGeneratePDF}
							disabled={isGeneratingPDF}
							className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
								isGeneratingPDF 
									? 'bg-gray-400 cursor-not-allowed' 
									: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
							}`}
						>
							{isGeneratingPDF ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Generating PDF...
								</>
							) : (
								<>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>Generate PDF</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateTemplate;