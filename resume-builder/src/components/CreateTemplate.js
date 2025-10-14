import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CKEditorComponent from './CKEditor';
import AnimatedBackground from './AnimatedBackground';
import api, { apiHelpers } from '../services/api';
import './CreateTemplate.css';

const CreateTemplate = () => {
	const navigate = useNavigate();
	const [templateContent, setTemplateContent] = useState(`<h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 2.5rem; font-weight: 700;">
            Professional Resume Template
          </h1>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0; font-size: 1.8rem;">John Smith</h2>
            <p style="margin: 5px 0; font-size: 1.1rem; opacity: 0.9;">Senior Software Engineer</p>
            <p style="margin: 5px 0; font-size: 1rem; opacity: 0.8;">📧 john.smith@email.com | 📱 (555) 123-4567 | 🌐 linkedin.com/in/johnsmith</p>
          </div>
          
          <h3 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 25px;">Professional Summary</h3>
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
            <li>🏆 <strong>Awarded "Employee of the Year"</strong> for outstanding performance and innovation</li>
            <li>📈 <strong>Led team of 8 developers</strong> in successful product launch</li>
            <li>🔧 <strong>Open source contributor</strong> with 500+ GitHub stars across projects</li>
            <li>📚 <strong>Technical speaker</strong> at 3 major industry conferences</li>
          </ul>`);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	const handleGeneratePDF = async () => {
		if (!templateContent || templateContent.trim() === '') {
			toast.error('Please add some content to your template before generating PDF');
			return;
		}
		console.log('Generating PDF...', templateContent);
		setIsGeneratingPDF(true);
		try {
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
					<p className="dark:text-white/80 text-gray-600 text-base sm:text-lg mb-4">
						This is where you will create your custom resume template. Use the editor below to design your template.
					</p>
					<div className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-2">
						<CKEditorComponent
							value={templateContent}
							onChange={setTemplateContent}
							placeholder="Start designing your template here..."
							configType="pro"
						/>
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