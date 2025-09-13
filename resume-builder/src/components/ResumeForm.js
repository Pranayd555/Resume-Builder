import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resumeAPI, apiHelpers, uploadAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validators } from '../models/dataModels';
import { useFormScroll, useScrollToTop } from '../hooks/useAutoScroll';
import { useAuth } from '../contexts/AuthContext';
import CKEditor from './CKEditor';
import { ensureHtmlContent } from '../utils/htmlUtils';

import { 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Utility functions
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return '';
  }
};

// Reusable components
const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  onBlur, 
  required = false, 
  placeholder = "", 
  error = null, 
  readOnly = false,
  className = "",
  ...props 
}) => {
  const baseClasses = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";
  const errorClasses = error ? "border-red-300 focus:border-red-500" : "border-gray-300";
  const readOnlyClasses = readOnly ? "bg-gray-50 cursor-not-allowed" : "";
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        className={`${baseClasses} ${errorClasses} ${readOnlyClasses} ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

const TextAreaField = ({ 
  label, 
  value, 
  onChange, 
  rows = 3, 
  placeholder = "", 
  className = ""
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <CKEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8 text-gray-500">
    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icon}
    </svg>
    <p>{message}</p>
  </div>
);


const ErrorBanner = ({ message }) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center gap-2">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      <p className="text-red-700 text-sm font-medium">{message}</p>
    </div>
  </div>
);

// Local storage utility
const saveToLocalStorage = (formData, currentStep, isEditMode) => {
  if (isEditMode) return;
  
  try {
    const dataToSave = {
      formData,
      currentStep,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('resume_form_data', JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving form data:', error);
  }
};

function ResumeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const hasInitializedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    title: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    workExperience: [],
    isFresher: false, // Toggle for fresher status
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    languages: [],
    extractedText: '' // Store extracted text from uploaded resume
  });

  const [technologiesInput, setTechnologiesInput] = useState({});
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);

  const totalSteps = 8;
  
  const fieldOrder = [
    'title', 'fullName', 'email', 'phone', 'address',
    'workExperience_0_jobTitle', 'workExperience_0_company', 'workExperience_0_startDate',
    'education_0_degree', 'education_0_institution', 'education_0_startDate'
  ];
  
  const { scrollToFirstError } = useFormScroll(validationErrors, fieldOrder);
  const { scrollToTop } = useScrollToTop();

  // Resume upload functions
  const validateResumeFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!validateResumeFile(file)) {
      event.target.value = '';
      return;
    }
    
    try {
      setUploadingResume(true);
      setUploadedFileName(file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');
      
      const response = await uploadAPI.uploadResume(formData);
      
      if (response.success) {
        // Store the extracted text data
        const extractedText = response.data.originalText;
        const parsedData = response.data.parsedData;
        
        if (extractedText) {
          // Store the extracted text in form data for reference
          setFormData(prev => ({
            ...prev,
            extractedText: extractedText
          }));
          
          // If AI parsed data is available, auto-fill the form
          if (parsedData) {
            setFormData(prev => ({
              ...prev,
              extractedText: extractedText,
              parsedData: parsedData, // Store the parsed data
              personalInfo: {
                ...prev.personalInfo,
                ...parsedData.personalInfo
              },
              summary: parsedData.summary || prev.summary,
              workExperience: parsedData.workExperience || prev.workExperience,
              education: parsedData.education || prev.education,
              skills: parsedData.skills || prev.skills,
              projects: parsedData.projects || prev.projects,
              achievements: parsedData.achievements || prev.achievements,
              certifications: parsedData.certifications || prev.certifications,
              languages: parsedData.languages || prev.languages,
              customFields: parsedData.customFields || prev.customFields
            }));
            
            toast.success('Resume parsed and auto-filled successfully!');
          } else {
            toast.success('Resume text extracted successfully!');
          }
        } else {
          toast.info('Resume processed successfully! Please fill in your resume details.');
        }
      } else {
        throw new Error(response.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
      setUploadedFileName('');
    } finally {
      setUploadingResume(false);
      event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedFile = () => {
    setUploadedFileName('');
    setIsDragOver(false);
    setDragCounter(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsDragOver(false);
      }
      return newCount;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateResumeFile(file)) {
        // Create a synthetic event to reuse existing handleResumeUpload logic
        const syntheticEvent = {
          target: {
            files: [file],
            value: ''
          }
        };
        handleResumeUpload(syntheticEvent);
      }
    }
  };

  // Helper functions
  const loadProfileData = () => {
    try {
      const userData = apiHelpers.getCurrentUserData();
      if (userData) {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        const email = userData.email || '';
        const phone = userData.phone || '';
        
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName, email, phone
          }
        }));
        
        return { fullName, email, phone };
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    return { fullName: '', email: '', phone: '' };
  };

  const validateProfileData = () => {
    const errors = {};
    const userData = apiHelpers.getCurrentUserData();
    
    if (!userData) {
      errors.fullName = 'Update your profile to populate full name';
      errors.email = 'Update your profile to populate email';
      errors.phone = 'Update your profile to populate phone number';
      return errors;
    }
    
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    const email = userData.email || '';
    const phone = userData.phone || '';
    
    if (!fullName) errors.fullName = 'Update your profile to populate full name';
    if (!email) errors.email = 'Update your profile to populate email';
    if (!phone) errors.phone = 'Update your profile to populate phone number';
    
    return errors;
  };

  // Process form data loaded from localStorage to ensure HTML content is properly handled
  const processLoadedFormData = (data) => {
    return {
      ...data,
      summary: ensureHtmlContent(data.summary || ''),
      workExperience: (data.workExperience || []).map(exp => ({
        ...exp,
        description: ensureHtmlContent(exp.description || '')
      })),
      isFresher: data.isFresher || false,
      education: (data.education || []).map(edu => ({
        ...edu,
        description: ensureHtmlContent(edu.description || '')
      })),
      projects: (data.projects || []).map(proj => ({
        ...proj,
        description: ensureHtmlContent(proj.description || '')
      })),
      achievements: (data.achievements || []).map(ach => ({
        ...ach,
        description: ensureHtmlContent(ach.description || '')
      }))
    };
  };

  const formatValidationErrors = (apiErrors) => {
    const formattedErrors = {};
    apiErrors.forEach(error => {
      if (error.path === 'personalInfo.fullName') {
        formattedErrors.fullName = error.msg;
      } else if (error.path === 'personalInfo.email') {
        formattedErrors.email = error.msg;
      } else if (error.path === 'title') {
        formattedErrors.title = error.msg;
      } else {
        formattedErrors[error.path] = error.msg;
      }
    });
    return formattedErrors;
  };

  const validateForm = (isDraft = false) => {
    const errors = {};
    
    // Check title
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Resume title is required';
    }
    
    // Check profile data availability
    const profileErrors = validateProfileData();
    Object.assign(errors, profileErrors);
    
    // Email validation
    if (!profileErrors.email && formData.personalInfo.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.personalInfo.email)) {
        errors.email = 'Please provide a valid email';
      }
    }

    if (!isDraft) {
      // Additional validation for final submission
      if (!formData.personalInfo.address || formData.personalInfo.address.trim() === '') {
        errors.address = 'Address is required';
      }

      // Work experience validation (skip if user is a fresher)
      if (!formData.isFresher) {
        let hasValidWorkExperience = false;
        formData.workExperience.forEach((exp) => {
          if (exp.jobTitle && exp.company && exp.startDate) {
            hasValidWorkExperience = true;
          }
        });
        if (!hasValidWorkExperience) {
          errors.workExperience = 'At least one work experience entry is required (Job Title, Company, and Start Date)';
        }
      }

      // Education validation
      let hasValidEducation = false;
      formData.education.forEach((edu) => {
        if (edu.degree && edu.institution && edu.startDate && edu.gpa) {
          hasValidEducation = true;
        }
      });
      if (!hasValidEducation) {
        errors.education = 'At least one education entry is required (Degree, Institution, Start Date, and GPA)';
      }

      // Certification validation
      formData.certifications.forEach((cert, index) => {
        const hasStartedCertification = cert.name || cert.issuer || cert.date || cert.expiryDate || cert.credentialId || cert.url;
        
        if (hasStartedCertification) {
          if (!validators.required(cert.name)) {
            errors[`certifications_${index}_name`] = 'Certification name is required';
          }
          if (!validators.required(cert.issuer)) {
            errors[`certifications_${index}_issuer`] = 'Issuer is required';
          }
        }
      });
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Event handlers
  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newFormData = (() => {
        if (section === 'root') {
          return { ...prev, [field]: value };
        } else if (index !== null) {
          const newArray = [...prev[section]];
          newArray[index] = { ...newArray[index], [field]: value };
          return { ...prev, [section]: newArray };
        } else {
          return {
            ...prev,
            [section]: { ...prev[section], [field]: value }
          };
        }
      })();
      
      // Save to localStorage
      setTimeout(() => saveToLocalStorage(newFormData, currentStep, isEditMode), 0);
      
      return newFormData;
    });
    
    // Clear validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      
      if (section === 'root') {
        delete newErrors[field];
      } else if (index !== null) {
        const errorKey = `${section}_${index}_${field}`;
        delete newErrors[errorKey];
        if (field === 'startDate' || field === 'endDate') {
          delete newErrors[`${section}_${index}_dateRange`];
        }
      } else {
        delete newErrors[field];
      }
      
      return newErrors;
    });
  };

  const handleInputBlur = (section, field, index = null) => {
    const errors = {};
    
    if (section === 'root') {
      if (field === 'title') {
        if (!validators.required(formData.title)) {
          errors.title = 'Resume title is required';
        } else {
          // Clear title error if it's now valid
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.title;
            return newErrors;
          });
          return; // Early return to avoid setting errors
        }
      }
    } else if (section === 'personalInfo') {
      // Always validate profile data for name, email, phone since they are read-only
      if ((field === 'fullName' || field === 'email' || field === 'phone') && currentStep >= 2) {
        const profileErrors = validateProfileData();
        if (profileErrors[field]) {
          errors[field] = profileErrors[field];
        } else if (field === 'email' && formData.personalInfo.email && !validators.email(formData.personalInfo.email)) {
          errors.email = 'Please enter a valid email';
        } else {
          // Clear the error if field is now valid
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
          return; // Early return to avoid setting errors
        }
      }
      if (field === 'address') {
        if (!validators.required(formData.personalInfo.address)) {
          errors.address = 'Address is required';
        } else {
          // Clear address error if it's now valid
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.address;
            return newErrors;
          });
          return; // Early return to avoid setting errors
        }
      }
    } else if (index !== null) {
      if (section === 'workExperience') {
        // Skip validation if user is a fresher
        if (!formData.isFresher) {
          const exp = formData.workExperience[index];
          if (field === 'jobTitle' && !validators.required(exp.jobTitle)) {
            errors[`workExperience_${index}_jobTitle`] = 'Job title is required';
          }
          if (field === 'company' && !validators.required(exp.company)) {
            errors[`workExperience_${index}_company`] = 'Company name is required';
          }
          if (field === 'startDate' && !validators.required(exp.startDate)) {
            errors[`workExperience_${index}_startDate`] = 'Start date is required';
          }
          if ((field === 'startDate' || field === 'endDate') && exp.startDate && exp.endDate && !exp.isCurrentJob) {
            if (!validators.dateRange(exp.startDate, exp.endDate)) {
              errors[`workExperience_${index}_dateRange`] = 'End date must be after start date';
            }
          }
        }
      } else if (section === 'education') {
        const edu = formData.education[index];
        if (field === 'degree' && !validators.required(edu.degree)) {
          errors[`education_${index}_degree`] = 'Degree is required';
        }
        if (field === 'institution' && !validators.required(edu.institution)) {
          errors[`education_${index}_institution`] = 'Institution is required';
        }
        if (field === 'startDate' && !validators.required(edu.startDate)) {
          errors[`education_${index}_startDate`] = 'Start date is required';
        }
        if (field === 'gpa' && !validators.required(edu.gpa)) {
          errors[`education_${index}_gpa`] = 'GPA is required';
        } else if (field === 'gpa' && edu.gpa) {
          const gpaValue = parseFloat(edu.gpa);
          if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 10) {
            errors[`education_${index}_gpa`] = 'GPA must be between 0 and 10';
          } else {
            const decimalPlaces = edu.gpa.toString().split('.')[1]?.length || 0;
            if (decimalPlaces > 2) {
              errors[`education_${index}_gpa`] = 'GPA can have maximum 2 decimal places';
            }
          }
        }
        if ((field === 'startDate' || field === 'endDate') && edu.startDate && edu.endDate && !edu.isCurrentlyStudying) {
          if (!validators.dateRange(edu.startDate, edu.endDate)) {
            errors[`education_${index}_dateRange`] = 'End date must be after start date';
          }
        }
      } else if (section === 'certifications') {
        const cert = formData.certifications[index];
        const hasStartedCertification = cert.name || cert.issuer || cert.date || cert.expiryDate || cert.credentialId || cert.url;
        
        if (hasStartedCertification) {
          if (field === 'name' && !validators.required(cert.name)) {
            errors[`certifications_${index}_name`] = 'Certification name is required';
          }
          if (field === 'issuer' && !validators.required(cert.issuer)) {
            errors[`certifications_${index}_issuer`] = 'Issuer is required';
          }
        }
      }
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
  };

  const addArrayItem = (section, defaultItem) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [section]: [...prev[section], defaultItem]
      };
      
      if (section === 'projects') {
        const newIndex = prev[section].length;
        setTechnologiesInput(prevTech => ({
          ...prevTech,
          [newIndex]: ''
        }));
      }
      
      setTimeout(() => saveToLocalStorage(newFormData, currentStep, isEditMode), 0);
      return newFormData;
    });
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      };
      
      if (section === 'projects') {
        setTechnologiesInput(prevTech => {
          const newTech = { ...prevTech };
          delete newTech[index];
          
          const reindexedTech = {};
          Object.keys(newTech).forEach(key => {
            const numKey = parseInt(key);
            if (numKey > index) {
              reindexedTech[numKey - 1] = newTech[key];
            } else {
              reindexedTech[key] = newTech[key];
            }
          });
          
          return reindexedTech;
        });
      }
      
      setTimeout(() => saveToLocalStorage(newFormData, currentStep, isEditMode), 0);
      return newFormData;
    });
  };

  // Detect edit mode and load existing resume data
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode in development
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    const checkEditMode = async () => {
      const state = location.state;
      if (state && state.editMode && state.resumeId) {
        setIsEditMode(true);
        setEditingResumeId(state.resumeId);
        setLoading(true);
        
        try {
          const response = await resumeAPI.getResumeById(state.resumeId);
          if (response.success && response.data.resume) {
            const resumeData = response.data.resume;
            
            // Map data with proper date handling
            const mappedFormData = {
              title: resumeData.title || '',
              personalInfo: {
                fullName: resumeData.personalInfo?.fullName || '',
                email: resumeData.personalInfo?.email || '',
                phone: resumeData.personalInfo?.phone || '',
                address: resumeData.personalInfo?.address || '',
                website: resumeData.personalInfo?.website || '',
                linkedin: resumeData.personalInfo?.linkedin || '',
                github: resumeData.personalInfo?.github || ''
              },
              summary: ensureHtmlContent(resumeData.summary || ''),
              workExperience: (resumeData.workExperience || []).map(exp => ({
                jobTitle: exp.jobTitle || '',
                company: exp.company || '',
                location: exp.location || '',
                startDate: formatDateForInput(exp.startDate),
                endDate: formatDateForInput(exp.endDate),
                isCurrentJob: exp.isCurrentJob || false,
                description: ensureHtmlContent(exp.description || ''),
                achievements: exp.achievements || []
              })),
              isFresher: resumeData.isFresher || false,
              education: (resumeData.education || []).map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
                location: edu.location || '',
                startDate: formatDateForInput(edu.startDate),
                endDate: formatDateForInput(edu.endDate),
                isCurrentlyStudying: edu.isCurrentlyStudying || false,
                gpa: edu.gpa || '',
                description: ensureHtmlContent(edu.description || '')
              })),
              skills: (resumeData.skills || []).map(skill => ({
                category: skill.category || '',
                items: (skill.items || []).map(item => ({
                  name: item.name || '',
                  level: item.level || 'intermediate'
                }))
              })),
              projects: (resumeData.projects || []).map(proj => ({
                name: proj.name || '',
                description: ensureHtmlContent(proj.description || ''),
                technologies: proj.technologies || [],
                url: proj.url || '',
                githubUrl: proj.githubUrl || '',
                startDate: formatDateForInput(proj.startDate),
                endDate: formatDateForInput(proj.endDate)
              })),
              achievements: (resumeData.achievements || []).map(ach => ({
                title: ach.title || '',
                description: ensureHtmlContent(ach.description || ''),
                date: formatDateForInput(ach.date),
                issuer: ach.issuer || ''
              })),
              certifications: (resumeData.certifications || []).map(cert => ({
                name: cert.name || '',
                issuer: cert.issuer || '',
                date: formatDateForInput(cert.date),
                expiryDate: formatDateForInput(cert.expiryDate),
                credentialId: cert.credentialId || '',
                url: cert.url || ''
              })),
              languages: (resumeData.languages || []).map(lang => ({
                name: lang.name || '',
                proficiency: lang.proficiency || ''
              }))
            };
            
            setFormData(mappedFormData);
            
            // Check for AI-enhanced data from localStorage
            if (state.fromAIEnhancement) {
              try {
                const aiEnhancedData = localStorage.getItem('ai_enhanced_resume_data');
                if (aiEnhancedData) {
                  const parsedAIData = JSON.parse(aiEnhancedData);
                  
                  // Apply AI-enhanced data to the form
                  setFormData(prev => {
                    const updatedData = { ...prev };
                    
                    // Update summary if provided
                    if (parsedAIData.summary) {
                      updatedData.summary = ensureHtmlContent(parsedAIData.summary);
                    }
                    
                    // Update work experience if provided
                    if (parsedAIData.workExperience && Array.isArray(parsedAIData.workExperience)) {
                      updatedData.workExperience = updatedData.workExperience.map((exp, index) => {
                        const aiExp = parsedAIData.workExperience[index];
                        if (aiExp) {
                          return {
                            ...exp,
                            description: ensureHtmlContent(aiExp.description || exp.description)
                          };
                        }
                        return exp;
                      });
                    }
                    
                    // Handle legacy experience format (for adjust-tone)
                    if (parsedAIData.experience && Array.isArray(parsedAIData.experience)) {
                      updatedData.workExperience = updatedData.workExperience.map((exp, index) => {
                        const aiExp = parsedAIData.experience[index];
                        if (aiExp) {
                          return {
                            ...exp,
                            description: ensureHtmlContent(aiExp.description || exp.description)
                          };
                        }
                        return exp;
                      });
                    }
                    
                    // Update projects if provided
                    if (parsedAIData.projects && Array.isArray(parsedAIData.projects)) {
                      updatedData.projects = updatedData.projects.map((proj, index) => {
                        const aiProj = parsedAIData.projects[index];
                        if (aiProj) {
                          return {
                            ...proj,
                            description: ensureHtmlContent(aiProj.description || proj.description)
                          };
                        }
                        return proj;
                      });
                    }
                    
                    // Update skills if provided
                    if (parsedAIData.skills && Array.isArray(parsedAIData.skills)) {
                      // For enhance keywords, replace the entire skills structure
                      updatedData.skills = parsedAIData.skills.map(skillCategory => ({
                        category: skillCategory.category || '',
                        items: (skillCategory.items || []).map(item => ({
                          name: item.name || '',
                          level: item.level || 'intermediate'
                        }))
                      }));
                    }
                    
                    return updatedData;
                  });
                  
                  // Show success message based on enhancement type
                  const enhancementType = parsedAIData._enhancementType;
                  if (enhancementType === 'adjust-tone') {
                    toast.success('Resume tone has been adjusted! Review and save your changes.');
                  } else if (enhancementType === 'enhance-keywords') {
                    toast.success('Keywords have been enhanced! Review and save your changes.');
                  }
                  
                  // Clear the AI enhanced data from localStorage
                  localStorage.removeItem('ai_enhanced_resume_data');
                }
              } catch (error) {
                console.error('Error applying AI-enhanced data:', error);
                toast.error('Failed to apply AI enhancements. Please try again.');
              }
            }
            
            // Initialize technologies input state for edit mode
            const techInputState = {};
            (mappedFormData.projects || []).forEach((proj, index) => {
              techInputState[index] = proj.technologies?.join(', ') || '';
            });
            setTechnologiesInput(techInputState);
            
            // Always load profile data to update name, email, phone fields
            loadProfileData();
            
            toast.success('Resume data loaded for editing!');
          } else {
            throw new Error('Resume not found');
          }
        } catch (error) {
          const errorMessage = apiHelpers.formatError(error);
          toast.error(errorMessage);
          navigate('/resume-list');
        } finally {
          setLoading(false);
        }
              } else {
          // Not in edit mode, check if we should load from localStorage
          // Only load if there's no explicit state indicating a fresh start
          const state = location.state;
          const shouldLoadFromStorage = !state || !state.freshStart;
          
          if (shouldLoadFromStorage) {
            const savedData = localStorage.getItem('resume_form_data');
            if (savedData) {
              try {
                const parsedData = JSON.parse(savedData);
                const processedFormData = processLoadedFormData(parsedData.formData || {});
                setFormData(prev => ({ ...prev, ...processedFormData }));
                setCurrentStep(parsedData.currentStep || 1);
                toast.info('Your previous form data has been restored.');
              } catch (error) {
                console.error('Error loading saved form data:', error);
                localStorage.removeItem('resume_form_data');
              }
            }
          } else {
            // Fresh start - ensure form is completely reset
            setFormData({
              title: '',
              personalInfo: {
                fullName: '',
                email: '',
                phone: '',
                address: '',
                website: '',
                linkedin: '',
                github: ''
              },
              summary: '',
              workExperience: [],
              isFresher: false,
              education: [],
              skills: [],
              projects: [],
              achievements: [],
              certifications: [],
              languages: []
            });
            setCurrentStep(1);
            setValidationErrors({});
            setTechnologiesInput({});
          }
          
          // Load profile data for read-only fields
          loadProfileData();
        }
    };

    checkEditMode();
  }, [location.state, navigate]); // Added navigate to dependencies to fix eslint warning

  // Clear validation errors when moving to step 1 (only title validation is relevant)
  useEffect(() => {
    if (currentStep === 1) {
      setValidationErrors(prev => {
        const newErrors = {};
        // Only keep title validation error if it exists
        if (prev.title) {
          newErrors.title = prev.title;
        }
        return newErrors;
      });
    }
  }, [currentStep]);

  // Validate profile data when user data changes (always validate since name, email, phone are read-only)
  useEffect(() => {
    if (user && currentStep >= 2) {
      const profileErrors = validateProfileData();
      if (Object.keys(profileErrors).length > 0) {
        setValidationErrors(prev => ({ ...prev, ...profileErrors }));
      } else {
        // Clear profile-related errors if profile data is available
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.fullName;
          delete newErrors.email;
          delete newErrors.phone;
          return newErrors;
        });
      }
    }
  }, [user, currentStep]);

  // Function to clean data before sending to backend
  const cleanFormDataForBackend = (data) => {
    const cleanedData = JSON.parse(JSON.stringify(data)); // Deep clone
    
    // Clean skills - remove items with null level
    if (cleanedData.skills) {
      cleanedData.skills = cleanedData.skills.map(skillCategory => ({
        ...skillCategory,
        items: skillCategory.items ? skillCategory.items.filter(item => item.level !== null) : []
      })).filter(skillCategory => skillCategory.items.length > 0);
    }
    
    // Clean languages - remove items with null proficiency
    if (cleanedData.languages) {
      cleanedData.languages = cleanedData.languages.filter(lang => lang.proficiency !== null);
    }
    
    // Clean other null values that might cause issues
    if (cleanedData.personalInfo) {
      Object.keys(cleanedData.personalInfo).forEach(key => {
        if (cleanedData.personalInfo[key] === null) {
          cleanedData.personalInfo[key] = '';
        }
      });
    }
    
    return cleanedData;
  };

  // Manual save functionality
  const saveDraft = async () => {
    try {
      // Check if form has minimal required content for draft saving
      const validation = validateForm();
      if (!validation.isValid) {
        // setValidationErrors(validation.errors);
        
        // Check if there are any basic field errors (title, fullName, email)
        const basicFieldErrors = ['title', 'fullName', 'email'];
        const hasBasicFieldErrors = Object.keys(validation.errors).some(errorKey => 
          basicFieldErrors.includes(errorKey)
        );
        
        if (hasBasicFieldErrors) {
          toast.warning('Please add Title, Full Name and Email before saving a draft');
        } else {
          toast.warning('Please fill missing fields before saving draft');
        }
        
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
        return;
      }

      // Clean the data before sending to backend
      const cleanedFormData = cleanFormDataForBackend(formData);
      const response = await resumeAPI.autoSaveDraft(cleanedFormData, editingResumeId);
      
      if (response.success) {
        // Update the editing resume ID if this is a new draft
        if (!editingResumeId && response.data.resumeId) {
          setEditingResumeId(response.data.resumeId);
        }
        setLastSaved(new Date());
        toast.success('Draft saved successfully!');
        
        // Route to resume list page after successful draft save
        setTimeout(() => {
          navigate('/resumes-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Save failed:', error);
      
      // Handle subscription limit exceeded error
      if (error?.response?.data?.limitReached) {
        const errorData = error.response.data;
        toast.error(errorData.error);
        
        // Navigate to subscription page if limit is reached
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
        return;
      }
      
      // Handle validation errors
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const formattedErrors = formatValidationErrors(validationErrors);
        setValidationErrors(formattedErrors);
        
        // Show toast with first error message
        const firstError = validationErrors[0];
        if (firstError) {
          toast.error(firstError.msg);
        }
        
        // Scroll to first error
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
      } else {
        toast.error('Failed to save draft. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form before submission with comprehensive requirements
      const validation = validateForm();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Please complete all required fields before submitting');
        
        // Scroll to first error after a short delay
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
        
        setLoading(false);
        return;
      }
      
      // Clear validation errors if form is valid
      setValidationErrors({});
      
      let response;
      let resumeId = editingResumeId;

      // Clean the data before sending to backend
      const cleanedFormData = cleanFormDataForBackend(formData);

      if (isEditMode && editingResumeId) {
        // Update existing resume
        response = await resumeAPI.updateResume(editingResumeId, cleanedFormData);
      } else {
        // Create new resume
        response = await resumeAPI.saveFormData(cleanedFormData);
        resumeId = response.data.resumeId;
      }
      
      if (response.success) {
        // Mark resume as completed
        try {
          await resumeAPI.markAsCompleted(resumeId);
        } catch (error) {
          console.error('Failed to mark resume as completed:', error);
          
          // Handle subscription limit exceeded error
          if (error?.response?.data?.limitReached) {
            const errorData = error.response.data;
            toast.error(errorData.error);
            
            // Navigate to subscription page if limit is reached
            setTimeout(() => {
              navigate('/subscription');
            }, 2000);
            return;
          }
          
          // Continue anyway as the main save was successful for other errors
        }

        // Clear localStorage after successful submission (only when not in edit mode)
        if (!isEditMode) {
          localStorage.removeItem('resume_form_data');
        }
        
        if (isEditMode) {
          toast.success('Resume completed successfully!');
          navigate(`/resume-preview/${editingResumeId}`);
        } else {
          toast.success('Resume completed successfully!');
          navigate(`/template-selection/${response.data.resumeId}`);
        }
      } else {
        throw new Error(response.error || 'Failed to save resume details');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step before proceeding
      const validation = validateCurrentStep();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Please fix the validation errors before continuing');
        
        // Scroll to first error after a short delay
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
        return;
      }
      
      // Clear validation errors if step is valid
      setValidationErrors({});
      
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveToLocalStorage(formData, newStep, isEditMode);
      
      // Scroll to top when moving to next step
      scrollToTop();
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveToLocalStorage(formData, newStep, isEditMode);
    }
  };

  const clearFormData = () => {
    setShowClearModal(true);
  };

  const confirmClearFormData = () => {
    localStorage.removeItem('resume_form_data');
    setFormData({
      title: '',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        linkedin: '',
        github: ''
      },
      summary: '',
      workExperience: [],
      isFresher: false,
      education: [],
      skills: [],
      projects: [],
      achievements: [],
      certifications: [],
      languages: []
    });
    setCurrentStep(1);
    setShowClearModal(false);
    toast.success('Form data cleared successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderPersonalInfo();
      case 3:
        return renderWorkExperience();
      case 4:
        return renderEducation();
      case 5:
        return renderSkills();
      case 6:
        return renderProjects();
      case 7:
        return renderAchievements();
      case 8:
        return renderCertificationsAndLanguages();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <>
      {/* Resume Upload Section - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
              Parse Existing Resume
              <SparklesIcon className="w-4 h-4 text-purple-500" />
            </h4>
            <p className="text-xs text-gray-600">
              Upload PDF/Word to auto-populate fields
            </p>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleResumeUpload}
          className="hidden"
        />
        
        {/* Upload button or file info */}
        {!uploadedFileName ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full px-3 py-4 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-center cursor-pointer ${
              isDragOver 
                ? 'border-blue-500 bg-blue-100 text-blue-700' 
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600'
            }`}
            onClick={triggerFileUpload}
          >
            {uploadingResume ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium text-sm">Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-medium text-sm">
                  {isDragOver ? 'Drop resume here' : 'Choose File or Drag & Drop'}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-green-800 truncate">{uploadedFileName}</span>
            </div>
            <button
              onClick={removeUploadedFile}
              className="text-green-600 hover:text-green-800 transition-colors p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center mt-2">
          PDF, DOCX, DOC (Max 10MB)
        </p>
      </div>
      
      {/* Basic Information Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
        <FormField
          label="Resume Title"
          type="text"
          value={formData.title}
          onChange={(e) => {
            handleInputChange('root', 'title', e.target.value);
            // Clear title validation error when user starts typing
            if (validationErrors.title && e.target.value.trim() !== '') {
              setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.title;
                return newErrors;
              });
            }
          }}
          onBlur={() => handleInputBlur('root', 'title')}
          required
          placeholder="e.g., Senior Software Engineer Resume"
          error={validationErrors.title}
        />
        <TextAreaField
          label="Professional Summary"
          value={formData.summary}
          onChange={(value) => handleInputChange('root', 'summary', value)}
          rows={4}
          placeholder="Write a brief summary of your professional background and key achievements..."
        />
        
        {/* Extracted Text Reference - Only show when parsedData is NOT available */}
        {formData.extractedText && !formData.parsedData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Extracted Resume Content</h4>
              <button
                onClick={() => setFormData(prev => ({ ...prev, extractedText: '', parsedData: null }))}
                className="text-gray-400 hover:text-gray-600"
                title="Clear extracted text and parsed data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {formData.extractedText.length > 500 
                  ? `${formData.extractedText}` 
                  : formData.extractedText
                }
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use this extracted content as reference while filling the form fields above.
            </p>
          </div>
        )}

        {/* Parsed Data Success Message - Show when parsedData is available */}
        {formData.parsedData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-medium text-green-900">AI Parsed Successfully</h4>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, parsedData: null }))}
                className="text-green-400 hover:text-green-600"
                title="Clear parsed data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-green-700">
              Your resume has been automatically parsed and filled in above. Please review and edit the information as needed.
            </p>
          </div>
        )}
       
      </div>
    </>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
      
      {/* Profile Data Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Profile Data</h3>
            <p className="text-sm text-blue-700">
              Your <strong>Full Name</strong>, <strong>Email</strong>, and <strong>Phone</strong> are automatically populated from your profile. 
              To update these details, please visit your <a href="/profile" className="underline hover:text-blue-800">profile page</a>.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          type="text"
          value={formData.personalInfo.fullName}
          required
          readOnly={true}
          placeholder="John Doe"
          error={validationErrors.fullName}
        />
        <FormField
          label="Email"
          type="email"
          value={formData.personalInfo.email}
          required
          readOnly={true}
          placeholder="john.doe@email.com"
          error={validationErrors.email}
        />
        <FormField
          label="Phone"
          type="tel"
          value={formData.personalInfo.phone}
          required
          readOnly={true}
          placeholder="+1 (555) 123-4567"
          error={validationErrors.phone}
        />
        <FormField
          label="Address"
          type="text"
          value={formData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          onBlur={() => handleInputBlur('personalInfo', 'address')}
          required
          placeholder="City, State, Country"
          error={validationErrors.address}
        />
        <FormField
          label="Website"
          type="url"
          value={formData.personalInfo.website}
          onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
          placeholder="https://yourwebsite.com"
        />
        <FormField
          label="LinkedIn"
          type="url"
          value={formData.personalInfo.linkedin}
          onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/johndoe"
        />
        <FormField
          label="GitHub"
          type="url"
          value={formData.personalInfo.github}
          onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
          placeholder="https://github.com/johndoe"
        />
      </div>
    </div>
  );

  const renderWorkExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFresher"
              checked={formData.isFresher}
              onChange={(e) => {
                handleInputChange('root', 'isFresher', e.target.checked);
                // Clear work experience when toggling to fresher
                if (e.target.checked) {
                  handleInputChange('root', 'workExperience', []);
                }
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="isFresher" className="text-sm font-medium text-gray-700">
              I'm a fresher (no work experience)
            </label>
          </div>
          {!formData.isFresher && (
            <button
              onClick={() => addArrayItem('workExperience', {
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrentJob: false,
                description: '',
                achievements: []
              })}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
              Add Experience
            </button>
          )}
        </div>
      </div>
      
      {!formData.isFresher && formData.workExperience.map((job, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('workExperience', index)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title {!formData.isFresher && '*'}
              </label>
              <input
                type="text"
                required={!formData.isFresher}
                value={job.jobTitle}
                onChange={(e) => handleInputChange('workExperience', 'jobTitle', e.target.value, index)}
                onBlur={() => handleInputBlur('workExperience', 'jobTitle', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`workExperience_${index}_jobTitle`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Software Engineer"
              />
              {validationErrors[`workExperience_${index}_jobTitle`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`workExperience_${index}_jobTitle`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company {!formData.isFresher && '*'}
              </label>
              <input
                type="text"
                required={!formData.isFresher}
                value={job.company}
                onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                onBlur={() => handleInputBlur('workExperience', 'company', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`workExperience_${index}_company`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Tech Company Inc."
              />
              {validationErrors[`workExperience_${index}_company`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`workExperience_${index}_company`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={job.location}
                onChange={(e) => handleInputChange('workExperience', 'location', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date {!formData.isFresher && '*'}
              </label>
              <input
                type="date"
                required={!formData.isFresher}
                value={job.startDate}
                onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
                onBlur={() => handleInputBlur('workExperience', 'startDate', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`workExperience_${index}_startDate`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors[`workExperience_${index}_startDate`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`workExperience_${index}_startDate`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={job.endDate}
                disabled={job.isCurrentJob}
                onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                onBlur={() => handleInputBlur('workExperience', 'endDate', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  validationErrors[`workExperience_${index}_dateRange`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors[`workExperience_${index}_dateRange`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`workExperience_${index}_dateRange`]}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={job.isCurrentJob}
                onChange={(e) => {
                  handleInputChange('workExperience', 'isCurrentJob', e.target.checked, index);
                  if (e.target.checked) {
                    handleInputChange('workExperience', 'endDate', '', index);
                  }
                }}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Currently working here</label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <CKEditor
              value={job.description}
              onChange={(value) => handleInputChange('workExperience', 'description', value, index)}
              placeholder="Describe your role and responsibilities..."
            />
          </div>
        </div>
      ))}
      
      {formData.isFresher ? (
        <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-blue-900 mb-2">Fresher Status</h4>
          <p className="text-blue-700">You've indicated that you're a fresher with no work experience. You can proceed to the next step.</p>
        </div>
      ) : formData.workExperience.length === 0 && (
        <EmptyState
          icon={<svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>}
          message="No work experience added yet. Click 'Add Experience' to get started."
        />
      )}
      
      {validationErrors.workExperience && (
        <ErrorBanner message={validationErrors.workExperience} />
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Education</h3>
        <button
          onClick={() => addArrayItem('education', {
            degree: '',
            institution: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrentlyStudying: false,
            gpa: '',
            description: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Education
        </button>
      </div>
      
      {formData.education.map((edu, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('education', index)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree *
              </label>
              <input
                type="text"
                required
                value={edu.degree}
                onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                onBlur={() => handleInputBlur('education', 'degree', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`education_${index}_degree`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Bachelor of Science in Computer Science"
              />
              {validationErrors[`education_${index}_degree`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`education_${index}_degree`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution *
              </label>
              <input
                type="text"
                required
                value={edu.institution}
                onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                onBlur={() => handleInputBlur('education', 'institution', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`education_${index}_institution`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="University of California"
              />
              {validationErrors[`education_${index}_institution`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`education_${index}_institution`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={edu.location}
                onChange={(e) => handleInputChange('education', 'location', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Berkeley, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={edu.gpa}
                onChange={(e) => {
                  // Limit to 2 decimal places
                  const value = e.target.value;
                  if (value.includes('.') && value.split('.')[1]?.length > 2) {
                    return; // Don't update if more than 2 decimal places
                  }
                  handleInputChange('education', 'gpa', value, index);
                }}
                onBlur={() => handleInputBlur('education', 'gpa', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`education_${index}_gpa`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="8.50"
              />
              {validationErrors[`education_${index}_gpa`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`education_${index}_gpa`]}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={edu.startDate}
                onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                onBlur={() => handleInputBlur('education', 'startDate', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[`education_${index}_startDate`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors[`education_${index}_startDate`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`education_${index}_startDate`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={edu.endDate}
                disabled={edu.isCurrentlyStudying}
                onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)}
                onBlur={() => handleInputBlur('education', 'endDate', index)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  validationErrors[`education_${index}_dateRange`] 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors[`education_${index}_dateRange`] && (
                <p className="text-red-600 text-sm mt-1">{validationErrors[`education_${index}_dateRange`]}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={edu.isCurrentlyStudying}
              onChange={(e) => {
                handleInputChange('education', 'isCurrentlyStudying', e.target.checked, index);
                if (e.target.checked) {
                  handleInputChange('education', 'endDate', '', index);
                }
              }}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Currently studying here</label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <CKEditor
              value={edu.description}
              onChange={(value) => handleInputChange('education', 'description', value, index)}
              placeholder="Relevant coursework, honors, activities..."
            />
          </div>
        </div>
      ))}
      
      {formData.education.length === 0 && (
        <EmptyState
          icon={<svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>}
          message="No education added yet. Click 'Add Education' to get started."
        />
      )}
      
      {validationErrors.education && (
        <ErrorBanner message={validationErrors.education} />
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
        <button
          onClick={() => addArrayItem('skills', {
            category: '',
            items: []
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill Category
        </button>
      </div>
      
      {/* Quick Add Skills - Comma Separated */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Quick Add Skills</h4>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            Add multiple skills at once (comma-separated)
          </label>
          <input
            type="text"
            placeholder="React, Node.js, MongoDB, JavaScript, Python, AWS"
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                const skillsToAdd = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                
                if (skillsToAdd.length > 0) {
                  // Find or create a "General" category
                  let generalCategoryIndex = formData.skills.findIndex(cat => cat.category.toLowerCase() === 'general' || cat.category.toLowerCase() === 'technical skills');
                  
                  if (generalCategoryIndex === -1) {
                    // Create a new "Technical Skills" category
                    const newCategory = {
                      category: 'Technical Skills',
                      items: skillsToAdd.map(skill => ({ name: skill, level: 'intermediate' }))
                    };
                    setFormData(prev => ({ ...prev, skills: [...prev.skills, newCategory] }));
                  } else {
                    // Add to existing category
                    const newSkills = [...formData.skills];
                    skillsToAdd.forEach(skill => {
                      // Check if skill already exists
                      const existingSkill = newSkills[generalCategoryIndex].items.find(item => item.name.toLowerCase() === skill.toLowerCase());
                      if (!existingSkill) {
                        newSkills[generalCategoryIndex].items.push({ name: skill, level: 'intermediate' });
                      }
                    });
                    setFormData(prev => ({ ...prev, skills: newSkills }));
                  }
                  
                  e.target.value = '';
                }
              }
            }}
          />
          <p className="text-xs text-blue-600 mt-1">
            💡 Type your skills separated by commas, then press Enter to add them all at once
          </p>
        </div>
      </div>
      
      {formData.skills.map((skillCategory, categoryIndex) => (
        <div key={categoryIndex} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Skill Category #{categoryIndex + 1}</h4>
            <button
              onClick={() => removeArrayItem('skills', categoryIndex)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={skillCategory.category}
              onChange={(e) => {
                const newSkills = [...formData.skills];
                newSkills[categoryIndex].category = e.target.value;
                setFormData(prev => ({ ...prev, skills: newSkills }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Programming Languages, Tools, Frameworks"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add multiple skills: React, Node.js, MongoDB"
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      const skillsToAdd = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                      
                      if (skillsToAdd.length > 0) {
                        const newSkills = [...formData.skills];
                        skillsToAdd.forEach(skill => {
                          // Check if skill already exists
                          const existingSkill = newSkills[categoryIndex].items.find(item => item.name.toLowerCase() === skill.toLowerCase());
                          if (!existingSkill) {
                            newSkills[categoryIndex].items.push({ name: skill, level: 'intermediate' });
                          }
                        });
                        setFormData(prev => ({ ...prev, skills: newSkills }));
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const newSkills = [...formData.skills];
                    newSkills[categoryIndex].items.push({ name: '', level: 'intermediate' });
                    setFormData(prev => ({ ...prev, skills: newSkills }));
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add One
                </button>
              </div>
            </div>
            
            {skillCategory.items.map((skill, skillIndex) => (
              <div key={skillIndex} className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[categoryIndex].items[skillIndex].name = e.target.value;
                    setFormData(prev => ({ ...prev, skills: newSkills }));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Skill name"
                />
                <div className="flex gap-2">
                  <select
                    value={skill.level}
                    onChange={(e) => {
                      const newSkills = [...formData.skills];
                      newSkills[categoryIndex].items[skillIndex].level = e.target.value;
                      setFormData(prev => ({ ...prev, skills: newSkills }));
                    }}
                    className="flex-1 sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    onClick={() => {
                      const newSkills = [...formData.skills];
                      newSkills[categoryIndex].items.splice(skillIndex, 1);
                      setFormData(prev => ({ ...prev, skills: newSkills }));
                    }}
                    className="text-red-600 hover:text-red-700 p-2 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {formData.skills.length === 0 && (
        <EmptyState
          icon={<svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>}
          message="No skills added yet. Use the 'Quick Add' section above or click 'Add Skill Category' to get started."
        />
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
        <button
          onClick={() => addArrayItem('projects', {
            name: '',
            description: '',
            technologies: [],
            url: '',
            githubUrl: '',
            startDate: '',
            endDate: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>
      
      {formData.projects.map((project, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('projects', index)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={project.name}
                onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E-commerce Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={technologiesInput[index] || ''}
                onChange={(e) => {
                  setTechnologiesInput(prev => ({
                    ...prev,
                    [index]: e.target.value
                  }));
                }}
                onBlur={(e) => {
                  // Process technologies when user finishes typing
                  const techs = e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech);
                  handleInputChange('projects', 'technologies', techs, index);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL
              </label>
              <input
                type="url"
                value={project.url}
                onChange={(e) => handleInputChange('projects', 'url', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://myproject.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                value={project.githubUrl}
                onChange={(e) => handleInputChange('projects', 'githubUrl', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <CKEditor
              value={project.description}
              onChange={(value) => handleInputChange('projects', 'description', value, index)}
              placeholder="Describe the project, your role, and key features..."
            />
          </div>
        </div>
      ))}
      
      {formData.projects.length === 0 && (
        <EmptyState
          icon={<svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>}
          message="No projects added yet. Click 'Add Project' to get started."
        />
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Achievements & Awards</h3>
        <button
          onClick={() => addArrayItem('achievements', {
            title: '',
            description: '',
            date: '',
            issuer: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Achievement
        </button>
      </div>
      
      {formData.achievements.map((achievement, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Achievement #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('achievements', index)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={achievement.title}
                onChange={(e) => handleInputChange('achievements', 'title', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Employee of the Year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer
              </label>
              <input
                type="text"
                value={achievement.issuer}
                onChange={(e) => handleInputChange('achievements', 'issuer', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={achievement.date}
                onChange={(e) => handleInputChange('achievements', 'date', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <CKEditor
              value={achievement.description}
              onChange={(value) => handleInputChange('achievements', 'description', value, index)}
              placeholder="Describe the achievement..."
            />
          </div>
        </div>
      ))}
      
      {formData.achievements.length === 0 && (
        <EmptyState
          icon={<svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>}
          message="No achievements added yet. Click 'Add Achievement' to get started."
        />
      )}
    </div>
  );

  const renderCertificationsAndLanguages = () => (
    <div className="space-y-8">
      {/* Certifications */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
          <button
            onClick={() => addArrayItem('certifications', {
              name: '',
              issuer: '',
              date: '',
              expiryDate: '',
              credentialId: '',
              url: ''
            })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Certification
          </button>
        </div>
        
        {/* Certification Requirements Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Certification Requirements</h3>
              <p className="text-sm text-blue-700">
                If you add a certification, the <strong>Certification Name</strong> and <strong>Issuer</strong> are required fields. 
                Other fields like dates, credential ID, and verification URL are optional.
              </p>
            </div>
          </div>
        </div>
        
        {formData.certifications.map((cert, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Certification #{index + 1}</h4>
              <button
                onClick={() => removeArrayItem('certifications', index)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cert.name}
                  onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                  onBlur={() => handleInputBlur('certifications', 'name', index)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors[`certifications_${index}_name`] 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="AWS Certified Solutions Architect"
                />
                {validationErrors[`certifications_${index}_name`] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors[`certifications_${index}_name`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cert.issuer}
                  onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                  onBlur={() => handleInputBlur('certifications', 'issuer', index)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors[`certifications_${index}_issuer`] 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Amazon Web Services"
                />
                {validationErrors[`certifications_${index}_issuer`] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors[`certifications_${index}_issuer`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={cert.date}
                  onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => handleInputChange('certifications', 'expiryDate', e.target.value, index)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={cert.credentialId}
                  onChange={(e) => handleInputChange('certifications', 'credentialId', e.target.value, index)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC123XYZ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification URL
                </label>
                <input
                  type="url"
                  value={cert.url}
                  onChange={(e) => handleInputChange('certifications', 'url', e.target.value, index)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://verify.example.com"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Languages</h3>
          <button
            onClick={() => addArrayItem('languages', {
              name: '',
              proficiency: 'conversational'
            })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Language
          </button>
        </div>
        
        {formData.languages.map((lang, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                required
                value={lang.name}
                onChange={(e) => handleInputChange('languages', 'name', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Language name"
              />
            </div>
            <div className="w-48">
              <select
                value={lang.proficiency}
                onChange={(e) => handleInputChange('languages', 'proficiency', e.target.value, index)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="conversational">Conversational</option>
                <option value="fluent">Fluent</option>
                <option value="native">Native</option>
              </select>
            </div>
            <button
              onClick={() => removeArrayItem('languages', index)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const getStepTitle = () => {
    const titles = [
      'Basic Information',
      'Personal Details',
      'Work Experience',
      'Education',
      'Skills',
      'Projects',
      'Achievements',
      'Certifications & Languages'
    ];
    return titles[currentStep - 1];
  };

  const validateCurrentStep = () => {
    const errors = {};
    
    switch (currentStep) {
      case 1:
        if (!validators.required(formData.title)) {
          errors.title = 'Resume title is required';
        }
        break;
      case 2:
        // For read-only fields (fullName, email, phone), validate profile data availability in non-edit mode
        if (!isEditMode) {
          const profileErrors = validateProfileData();
          if (profileErrors.fullName) {
            errors.fullName = profileErrors.fullName;
          }
          if (profileErrors.email) {
            errors.email = profileErrors.email;
          }
          if (profileErrors.phone) {
            errors.phone = profileErrors.phone;
          }
        } else {
          // In edit mode, use normal validation for these fields
          if (!validators.required(formData.personalInfo.fullName)) {
            errors.fullName = 'Full name is required';
          }
          if (!validators.required(formData.personalInfo.email)) {
            errors.email = 'Email is required';
          } else if (!validators.email(formData.personalInfo.email)) {
            errors.email = 'Please enter a valid email';
          }
          if (!validators.required(formData.personalInfo.phone)) {
            errors.phone = 'Phone number is required';
          }
        }
        
        // Address is always editable and requires validation
        if (!validators.required(formData.personalInfo.address)) {
          errors.address = 'Address is required';
        }
        break;
      case 3:
        // Validate work experience - check if any experience has been started (skip if user is a fresher)
        if (!formData.isFresher) {
          formData.workExperience.forEach((exp, index) => {
            if (exp.jobTitle || exp.company || exp.startDate || exp.endDate || exp.description) {
              if (!validators.required(exp.jobTitle)) {
                errors[`workExperience_${index}_jobTitle`] = 'Job title is required';
              }
              if (!validators.required(exp.company)) {
              errors[`workExperience_${index}_company`] = 'Company name is required';
            }
            if (!validators.required(exp.startDate)) {
              errors[`workExperience_${index}_startDate`] = 'Start date is required';
            }
            if (exp.startDate && exp.endDate && !exp.isCurrentJob) {
              if (!validators.dateRange(exp.startDate, exp.endDate)) {
                errors[`workExperience_${index}_dateRange`] = 'End date must be after start date';
              }
            }
          }
        });
        
        // Check if at least one complete work experience is required for final submission
        let hasValidWorkExperience = false;
        formData.workExperience.forEach((exp) => {
          if (exp.jobTitle && exp.company && exp.startDate) {
            hasValidWorkExperience = true;
          }
        });
        if (!hasValidWorkExperience) {
          errors.workExperience = 'At least one work experience entry is required (Job Title, Company, and Start Date)';
        }
        }
        break;
      case 4:
        // Validate education - check if any education has been started
        formData.education.forEach((edu, index) => {
          if (edu.degree || edu.institution || edu.startDate || edu.endDate || edu.description) {
            if (!validators.required(edu.degree)) {
              errors[`education_${index}_degree`] = 'Degree is required';
            }
            if (!validators.required(edu.institution)) {
              errors[`education_${index}_institution`] = 'Institution is required';
            }
            if (!validators.required(edu.startDate)) {
              errors[`education_${index}_startDate`] = 'Start date is required';
            }
            if (edu.startDate && edu.endDate && !edu.isCurrentlyStudying) {
              if (!validators.dateRange(edu.startDate, edu.endDate)) {
                errors[`education_${index}_dateRange`] = 'End date must be after start date';
              }
            }
          }
        });
        
        // Check if at least one complete education is required for final submission
        let hasValidEducation = false;
        formData.education.forEach((edu) => {
          if (edu.degree && edu.institution && edu.startDate && edu.gpa) {
            hasValidEducation = true;
          }
        });
        if (!hasValidEducation) {
          errors.education = 'At least one education entry is required (Degree, Institution, Start Date, and GPA)';
        }
        break;
      default:
        // Other steps are optional
        break;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const isStepValid = () => {
    const validation = validateCurrentStep();
    
    // For step 1, only check step-specific validation (title)
    if (currentStep === 1) {
      return validation.isValid;
    }
    
    // For step 2 and later, check both step validation and profile data validation
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    
    return validation.isValid;
  };





  if (loading && isEditMode) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Resume Data...</h3>
          <p className="text-gray-600">Please wait while we load your resume for editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 relative">
      {/* Global Loader Overlay */}
      {uploadingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Resume</h3>
              <p className="text-gray-600 mb-4">Please wait while we extract and parse your resume content...</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto py-6 px-3 sm:py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => navigate('/resume-list')}
              className="text-gray-500 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm hover:text-blue-600"
              title="Back to resume list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                {isEditMode ? 'Edit Your Resume' : 'Create Your Resume'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg px-2 sm:px-0">
                {isEditMode ? 'Update your resume details' : 'Tell us about yourself and we\'ll help you create a professional resume'}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                {isEditMode && (
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editing Mode
                  </div>
                )}
                {lastSaved && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveDraft}
                className="text-gray-500 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm hover:text-blue-600"
                title="Save draft now"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save Draft</span>
              </button>
              <button
                onClick={clearFormData}
                className="text-gray-500 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm hover:text-red-600"
                title="Clear all form data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">{getStepTitle()}</h2>
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>

          {/* Required Fields Notice */}
          {currentStep === 1 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Required Fields</h3>
                  <p className="text-sm text-blue-700">
                    Fields marked with <span className="text-red-500 font-semibold">*</span> are required to complete your resume. 
                    You can save drafts at any time, but these fields must be filled before final submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="space-y-3 px-2 sm:px-0">
          {/* Step Indicators */}
          <div className="flex justify-center">
            <div className="flex space-x-1 sm:space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    i + 1 === currentStep
                      ? 'bg-blue-600'
                      : i + 1 < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-2 sm:gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-2 py-2 sm:px-6 sm:py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base min-w-0 flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid() || loading || uploadingResume}
              className={`px-2 py-2 sm:px-6 sm:py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base min-w-0 flex-shrink-0 ${
                !isStepValid() && Object.keys(validationErrors).length > 0
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {currentStep === totalSteps ? (
                loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{isEditMode ? 'Update Resume' : 'Save & Continue'}</span>
                    <span className="sm:hidden">{isEditMode ? 'Update' : 'Save'}</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Form Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear Form Data</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear all form data? This will permanently delete all the information you've entered and reset the form to step 1.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearFormData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeForm; 