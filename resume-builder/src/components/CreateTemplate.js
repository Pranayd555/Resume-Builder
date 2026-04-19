import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnimatedBackground from './AnimatedBackground';
import AILoader from './annimations/AILoader';
import ResumePreviewLoader from './annimations/ResumePreviewLoader';
import { apiHelpers, resumeAPI } from '../services/api';
import CustomCKEditorComponent from './customCkeditor';

const CreateTemplate = () => {
	const navigate = useNavigate();
	const [templateContent, setTemplateContent] = useState(`
		<div style="background: #000000ff; color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0; font-size: 1.8rem;">John Smith</h2>
            <p style="margin: 5px 0; font-size: 1.1rem; opacity: 0.9;">Senior Software Engineer</p>
            <p style="margin: 5px 0; font-size: 1rem; opacity: 0.8;">mailto: john.smith@email.com | tel: (555) 123-4567 | <a style="color: white;" href="https://linkedin.com/in/johnsmith">linkedin.com/in/johnsmith</a></p>
          </div>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Profile Summary</h3>
          <p style="line-height: 1.6; color: #2c3e50;">
            Experienced software engineer with 5+ years of expertise in full-stack development, 
            cloud architecture, and team leadership. Proven track record of delivering scalable 
            solutions and driving technical innovation in fast-paced environments.
          </p>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Technical Skills</h3>
          <ul style="line-height: 1.6; color: #2c3e50;">
            <li><strong>Programming Languages:</strong> JavaScript, Python, Java, TypeScript</li>
            <li><strong>Frameworks:</strong> React, Node.js, Django, Spring Boot</li>
            <li><strong>Cloud & DevOps:</strong> AWS, Docker, Kubernetes, CI/CD</li>
            <li><strong>Databases:</strong> PostgreSQL, MongoDB, Redis</li>
          </ul>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Professional Experience</h3>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 1.2rem;">Senior Software Engineer</h4>
            <p style="margin: 0; color: #7f8c8d; font-style: italic;">TechCorp Inc. | 2021 - Present</p>
            <ul style="line-height: 1.6; color: #2c3e50; margin-top: 10px;">
              <li>Led development of microservices architecture serving 1M+ users</li>
              <li>Improved system performance by 40% through optimization initiatives</li>
              <li>Mentored junior developers and established coding best practices</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 1.2rem;">Software Engineer</h4>
            <p style="margin: 0; color: #7f8c8d; font-style: italic;">InnovateSoft Solutions | 2019 - 2021</p>
            <ul style="line-height: 1.6; color: #2c3e50; margin-top: 10px;">
              <li>Developed full-stack web applications using React and Node.js</li>
              <li>Collaborated with cross-functional teams to deliver high-quality software</li>
              <li>Implemented automated testing strategies reducing bugs by 30%</li>
            </ul>
          </div>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Education</h3>
          <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 1.2rem;">Bachelor of Science in Computer Science</h4>
            <p style="margin: 0; color: #7f8c8d; font-style: italic;">University of Technology | 2015 - 2019</p>
            <p style="margin: 5px 0 0 0; color: #2c3e50;">GPA: 3.8/4.0 | Magna Cum Laude</p>
          </div>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Key Achievements</h3>
          <ul style="line-height: 1.6; color: #2c3e50;">
            <li><strong>Awarded "Employee of the Year"</strong> for outstanding performance and innovation</li>
            <li><strong>Led team of 8 developers</strong> in successful product launch</li>
            <li><strong>Open source contributor</strong> with 500+ GitHub stars across projects</li>
            <li><strong>Technical speaker</strong> at 3 major industry conferences</li>
          </ul>`);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [isAILoading, setIsAILoading] = useState(false);
	const [isSavingDraft, setIsSavingDraft] = useState(false);

	// Fetch draft on mount
	React.useEffect(() => {
		const fetchDraft = async () => {
			try {
				setIsAILoading(true);
				const response = await resumeAPI.getDraftTemplate();
				if (response.success && response.data && response.data.content) {
					setTemplateContent(response.data.content);
					toast.success('Draft loaded successfully');
				}
			} catch (error) {
				console.error('Error fetching draft:', error);
			} finally {
				setIsAILoading(false);
			}
		};

		fetchDraft();
	}, []);

	const handleSaveDraft = async () => {
		if (!templateContent || templateContent.trim() === '') {
			toast.error('Cannot save empty template');
			return;
		}

		setIsSavingDraft(true);
		try {
			await resumeAPI.saveDraftTemplate({ content: templateContent });
			toast.success('Draft saved successfully');
		} catch (error) {
			console.error('Error saving draft:', error);
			toast.error('Failed to save draft');
		} finally {
			setIsSavingDraft(false);
		}
	};

	const handleGeneratePDF = async () => {
		if (!templateContent || templateContent.trim() === '') {
			toast.error('Please add some content to your template before generating PDF');
			return;
		}

		// Use DOMParser to safely remove CKEditor artifacts
		const parser = new DOMParser();
		const doc = parser.parseFromString(templateContent, 'text/html');

		// Remove the type-around widgets and other CKEditor artifacts
		const artifacts = doc.querySelectorAll('.ck.ck-reset_all.ck-widget__type-around, .ck-widget__type-around__fake-caret, .ck-widget__type-around__button');
		artifacts.forEach(el => el.remove());

		// Remove CKEditor wrapper divs (.template-block-widget and .template-block-content)
		// These add unwanted margins (margin:10px 0) to the PDF
		const templateWidgets = doc.querySelectorAll('.template-block-widget');
		templateWidgets.forEach(widget => {
			// Find the .template-block-content div inside
			const contentDiv = widget.querySelector('.template-block-content');
			if (contentDiv) {
				// Get the inner content (e.g., .a4-page)
				const innerContent = contentDiv.innerHTML;
				// Create a temporary div to hold the inner content
				const temp = doc.createElement('div');
				temp.innerHTML = innerContent;
				// Replace the entire widget with just the inner content
				while (temp.firstChild) {
					widget.parentNode.insertBefore(temp.firstChild, widget);
				}
			}
			// Remove the now-empty widget wrapper
			widget.remove();
		});

		const updatedContent = doc.body.innerHTML;
		console.log('Generating PDF...', updatedContent);
		setIsGeneratingPDF(true);
		try {
			// The API returns the Blob directly
			const blob = await resumeAPI.createTemplate(updatedContent);

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'custom-template.pdf';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			// Show success message
			toast.success('PDF generated successfully!');
		} catch (error) {
			console.error('Error generating PDF:', error);
			const errorMessage = apiHelpers.formatError(error);
			toast.error(errorMessage);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Handle AI content changes
	const handleAIContentChange = (newContent) => {
		setTemplateContent(newContent);
		setIsAILoading(false);
	};

	// Handle AI loading state
	const handleAILoading = (loading) => {
		setIsAILoading(loading);
	};

	// Back to dashboard function
	const handleBackToDashboard = () => {
		navigate('/dashboard');
	};

	return (
		<div className="min-h-screen relative">
			<AnimatedBackground />
			<div className="relative z-10 container mx-auto px-4 pt-20 pb-8">
				<div className="max-w-6xl mx-auto">
					{/* Back Button */}
					<div className="flex items-center gap-3 mb-6">
						<button
							onClick={handleBackToDashboard}
							className="flex items-center gap-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 transition-colors font-medium group"
						>
							<svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							<span className="text-sm sm:text-base">Back to Dashboard</span>
						</button>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
						Create Your Own Template
					</h1>
					<p className="dark:text-white/80 text-gray-600 text-base sm:text-lg mb-4">
						This is where you will create your custom resume template. Use the editor below to design your template.
					</p>
					<div className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-2">
						<CustomCKEditorComponent
							value={templateContent}
							onChange={setTemplateContent}
							placeholder="Start designing your template here..."
							configType="pro"
							showAIButton={true}
							isProMode={true}
							onAIContentChange={handleAIContentChange}
							onAILoading={handleAILoading}
						/>
					</div>

					<div className="mt-6 flex justify-center gap-4">
						<button
							onClick={handleSaveDraft}
							disabled={isSavingDraft || isGeneratingPDF}
							className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${isSavingDraft
								? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
								}`}
						>
							{isSavingDraft ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Saving...
								</>
							) : (
								<>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
									</svg>
									<span>Save Draft</span>
								</>
							)}
						</button>

						<button
							onClick={handleGeneratePDF}
							disabled={isGeneratingPDF || isSavingDraft}
							className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${isGeneratingPDF
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:scale-105'
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

			{/* AI Loader Modal */}
			{isAILoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white dark:bg-orange-50/90 rounded-2xl shadow-2xl max-w-md w-full mx-4">
						<AILoader
							title="AI is working on your template..."
							subtitle="Our advanced AI is analyzing and enhancing your content to create the perfect resume template."
							compact={false}
						/>
					</div>
				</div>
			)}

			{/* PDF Generation Loader */}
			{isGeneratingPDF && (
				<ResumePreviewLoader
					title="Generating Your PDF..."
					subtitle="Our digital elves are crafting your professional resume document."
				/>
			)}
		</div>
	);
};

export default CreateTemplate;