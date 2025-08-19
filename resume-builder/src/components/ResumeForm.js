import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resumeAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';
import { validators } from '../models/dataModels';
import { useFormScroll, useScrollToTop } from '../hooks/useAutoScroll';
import { 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Add after the imports and before the ResumeForm function
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // If it's already in YYYY-MM-DD format, return as is
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it's an ISO string, convert to YYYY-MM-DD
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return '';
  }
};

function ResumeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Add ref to prevent duplicate API calls during StrictMode
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
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    languages: []
  });

  // Store raw technologies input for better UX
  const [technologiesInput, setTechnologiesInput] = useState({});

  const totalSteps = 8;
  const FORM_STORAGE_KEY = 'resume_form_data';
  
  // Form scroll functionality
  const fieldOrder = [
    'title', 'fullName', 'email', 'phone', 'address',
    'workExperience_0_jobTitle', 'workExperience_0_company', 'workExperience_0_startDate',
    'education_0_degree', 'education_0_institution', 'education_0_startDate'
  ];
  
  const { scrollToFirstError } = useFormScroll(validationErrors, fieldOrder);
  const { scrollToTop } = useScrollToTop();

  // Helper function to format validation errors from API
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
        // For other fields, use the path as key
        formattedErrors[error.path] = error.msg;
      }
    });
    return formattedErrors;
  };

  // Helper function to validate required fields for draft saving (minimal requirements)
  const validateDraftFields = () => {
    const errors = {};
    
    // Check title
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Resume title is required';
    }
    
    // Check full name
    if (!formData.personalInfo.fullName || formData.personalInfo.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    
    // Check email
    if (!formData.personalInfo.email || formData.personalInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.personalInfo.email)) {
        errors.email = 'Please provide a valid email';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Helper function to validate required fields for final submission (comprehensive requirements)
  const validateRequiredFields = () => {
    const errors = {};
    
    // Check title
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Resume title is required';
    }
    
    // Check full name
    if (!formData.personalInfo.fullName || formData.personalInfo.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    
    // Check email
    if (!formData.personalInfo.email || formData.personalInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.personalInfo.email)) {
        errors.email = 'Please provide a valid email';
      }
    }

    // Check phone number
    if (!formData.personalInfo.phone || formData.personalInfo.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }

    // Check address
    if (!formData.personalInfo.address || formData.personalInfo.address.trim() === '') {
      errors.address = 'Address is required';
    }

    // Check work experience - at least one complete entry
    let hasValidWorkExperience = false;
    formData.workExperience.forEach((exp, index) => {
      if (exp.jobTitle && exp.company && exp.startDate) {
        hasValidWorkExperience = true;
      }
    });
    if (!hasValidWorkExperience) {
      errors.workExperience = 'At least one work experience entry is required (Job Title, Company, and Start Date)';
    }

    // Check education - at least one complete entry
    let hasValidEducation = false;
    formData.education.forEach((edu, index) => {
      if (edu.degree && edu.institution && edu.startDate && edu.gpa) {
        hasValidEducation = true;
      }
    });
    if (!hasValidEducation) {
      errors.education = 'At least one education entry is required (Degree, Institution, Start Date, and GPA)';
    }

    // Check certifications - only validate if user has actually started adding a certification
    formData.certifications.forEach((cert, index) => {
      // Check if user has started filling this certification entry
      const hasStartedCertification = cert.name || cert.issuer || cert.date || cert.expiryDate || cert.credentialId || cert.url;
      
      if (hasStartedCertification) {
        // If user has started adding a certification, validate required fields
        if (!validators.required(cert.name)) {
          errors[`certifications_${index}_name`] = 'Certification name is required';
        }
        if (!validators.required(cert.issuer)) {
          errors[`certifications_${index}_issuer`] = 'Issuer is required';
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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
              summary: resumeData.summary || '',
              workExperience: (resumeData.workExperience || []).map(exp => ({
                jobTitle: exp.jobTitle || '',
                company: exp.company || '',
                location: exp.location || '',
                startDate: formatDateForInput(exp.startDate),
                endDate: formatDateForInput(exp.endDate),
                isCurrentJob: exp.isCurrentJob || false,
                description: exp.description || '',
                achievements: exp.achievements || []
              })),
              education: (resumeData.education || []).map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
                location: edu.location || '',
                startDate: formatDateForInput(edu.startDate),
                endDate: formatDateForInput(edu.endDate),
                isCurrentlyStudying: edu.isCurrentlyStudying || false,
                gpa: edu.gpa || '',
                description: edu.description || ''
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
                description: proj.description || '',
                technologies: proj.technologies || [],
                url: proj.url || '',
                githubUrl: proj.githubUrl || '',
                startDate: formatDateForInput(proj.startDate),
                endDate: formatDateForInput(proj.endDate)
              })),
              achievements: (resumeData.achievements || []).map(ach => ({
                title: ach.title || '',
                description: ach.description || '',
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
            
            // Initialize technologies input state for edit mode
            const techInputState = {};
            (mappedFormData.projects || []).forEach((proj, index) => {
              techInputState[index] = proj.technologies?.join(', ') || '';
            });
            setTechnologiesInput(techInputState);
            
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
          const savedData = localStorage.getItem(FORM_STORAGE_KEY);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              setFormData(prev => parsedData.formData || prev);
              setCurrentStep(parsedData.currentStep || 1);
              toast.info('Your previous form data has been restored.');
            } catch (error) {
              console.error('Error loading saved form data:', error);
              localStorage.removeItem(FORM_STORAGE_KEY);
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
      }
    };

    checkEditMode();
  }, [location.state, navigate]); // Added navigate to dependencies to fix eslint warning

  // Manual save functionality
  const saveDraft = async () => {
    try {
      // Check if form has minimal required content for draft saving
      const validation = validateDraftFields();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.warning('Please add Title, Full Name and Email before saving a draft');
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
        return;
      }

      const response = await resumeAPI.autoSaveDraft(formData, editingResumeId);
      
      if (response.success) {
        // Update the editing resume ID if this is a new draft
        if (!editingResumeId && response.data.resumeId) {
          setEditingResumeId(response.data.resumeId);
        }
        setLastSaved(new Date());
        toast.success('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      
      // Handle subscription limit exceeded error
      if (error.response?.data?.limitReached) {
        const errorData = error.response.data;
        toast.error(errorData.error);
        
        // Navigate to subscription page if limit is reached
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
        return;
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
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

  // Save form data to localStorage (only when not in edit mode)
  const saveToLocalStorage = (stepOverride = null) => {
    if (isEditMode) return; // Don't save to localStorage in edit mode
    
    try {
      const dataToSave = {
        formData,
        currentStep: stepOverride || currentStep,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

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
      
      // Save to localStorage after state update (only when not in edit mode)
      if (!isEditMode) {
        setTimeout(() => {
          const dataToSave = {
            formData: newFormData,
            currentStep,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
        }, 0);
      }
      
      return newFormData;
    });
    
    // Clear validation errors for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      
      if (section === 'root') {
        delete newErrors[field];
      } else if (index !== null) {
        // Clear array field errors
        const errorKey = `${section}_${index}_${field}`;
        delete newErrors[errorKey];
        // Also clear date range errors if updating date fields
        if (field === 'startDate' || field === 'endDate') {
          delete newErrors[`${section}_${index}_dateRange`];
        }
      } else {
        // Clear object field errors
        delete newErrors[field];
      }
      
      return newErrors;
    });
  };

  const handleInputBlur = (section, field, index = null) => {
    // Validate the specific field on blur
    const errors = {};
    
    if (section === 'root') {
      if (field === 'title' && !validators.required(formData.title)) {
        errors.title = 'Resume title is required';
      }
    } else if (section === 'personalInfo') {
      if (field === 'fullName' && !validators.required(formData.personalInfo.fullName)) {
        errors.fullName = 'Full name is required';
      }
      if (field === 'email') {
        if (!validators.required(formData.personalInfo.email)) {
          errors.email = 'Email is required';
        } else if (!validators.email(formData.personalInfo.email)) {
          errors.email = 'Please enter a valid email';
        }
      }
      if (field === 'phone' && !validators.required(formData.personalInfo.phone)) {
        errors.phone = 'Phone number is required';
      }
      if (field === 'address' && !validators.required(formData.personalInfo.address)) {
        errors.address = 'Address is required';
      }
    } else if (index !== null) {
      // Validate array items - always validate required fields when blurred
      if (section === 'workExperience') {
        const exp = formData.workExperience[index];
        // Always validate required fields when they are blurred
        if (field === 'jobTitle' && !validators.required(exp.jobTitle)) {
          errors[`workExperience_${index}_jobTitle`] = 'Job title is required';
        }
        if (field === 'company' && !validators.required(exp.company)) {
          errors[`workExperience_${index}_company`] = 'Company name is required';
        }
        if (field === 'startDate' && !validators.required(exp.startDate)) {
          errors[`workExperience_${index}_startDate`] = 'Start date is required';
        }
        // Only validate date range if both dates are present and not current job
        if ((field === 'startDate' || field === 'endDate') && exp.startDate && exp.endDate && !exp.isCurrentJob) {
          if (!validators.dateRange(exp.startDate, exp.endDate)) {
            errors[`workExperience_${index}_dateRange`] = 'End date must be after start date';
          }
        }
      } else if (section === 'education') {
        const edu = formData.education[index];
        // Always validate required fields when they are blurred
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
            // Check if GPA has more than 2 decimal places
            const decimalPlaces = edu.gpa.toString().split('.')[1]?.length || 0;
            if (decimalPlaces > 2) {
              errors[`education_${index}_gpa`] = 'GPA can have maximum 2 decimal places';
            }
          }
        }
        // Only validate date range if both dates are present and not currently studying
        if ((field === 'startDate' || field === 'endDate') && edu.startDate && edu.endDate && !edu.isCurrentlyStudying) {
          if (!validators.dateRange(edu.startDate, edu.endDate)) {
            errors[`education_${index}_dateRange`] = 'End date must be after start date';
          }
        }
      } else if (section === 'certifications') {
        const cert = formData.certifications[index];
        // Check if user has started filling this certification entry
        const hasStartedCertification = cert.name || cert.issuer || cert.date || cert.expiryDate || cert.credentialId || cert.url;
        
        if (hasStartedCertification) {
          // Only validate if user has started adding a certification
          if (field === 'name' && !validators.required(cert.name)) {
            errors[`certifications_${index}_name`] = 'Certification name is required';
          }
          if (field === 'issuer' && !validators.required(cert.issuer)) {
            errors[`certifications_${index}_issuer`] = 'Issuer is required';
          }
        }
      }
    }
    
    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  const addArrayItem = (section, defaultItem) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [section]: [...prev[section], defaultItem]
      };
      
      // Initialize technologies input for new projects
      if (section === 'projects') {
        const newIndex = prev[section].length;
        setTechnologiesInput(prevTech => ({
          ...prevTech,
          [newIndex]: ''
        }));
      }
      
      // Save to localStorage after state update (only when not in edit mode)
      if (!isEditMode) {
        setTimeout(() => {
          const dataToSave = {
            formData: newFormData,
            currentStep,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
        }, 0);
      }
      
      return newFormData;
    });
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      };
      
      // Clean up technologies input for removed projects
      if (section === 'projects') {
        setTechnologiesInput(prevTech => {
          const newTech = { ...prevTech };
          delete newTech[index];
          
          // Re-index remaining items
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
      
      // Save to localStorage after state update (only when not in edit mode)
      if (!isEditMode) {
        setTimeout(() => {
          const dataToSave = {
            formData: newFormData,
            currentStep,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
        }, 0);
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form before submission with comprehensive requirements
      const validation = validateRequiredFields();
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

      if (isEditMode && editingResumeId) {
        // Update existing resume
        response = await resumeAPI.updateResume(editingResumeId, formData);
      } else {
        // Create new resume
        response = await resumeAPI.saveFormData(formData);
        resumeId = response.data.resumeId;
      }
      
      if (response.success) {
        // Mark resume as completed
        try {
          await resumeAPI.markAsCompleted(resumeId);
        } catch (error) {
          console.error('Failed to mark resume as completed:', error);
          
          // Handle subscription limit exceeded error
          if (error.response?.data?.limitReached) {
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
          localStorage.removeItem(FORM_STORAGE_KEY);
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
      
      // Also check if there are any existing validation errors
      if (Object.keys(validationErrors).length > 0) {
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
      saveToLocalStorage(newStep);
      
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
      saveToLocalStorage(newStep);
    }
  };

  const clearFormData = () => {
    setShowClearModal(true);
  };

  const confirmClearFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => handleInputChange('root', 'title', e.target.value)}
          onBlur={() => handleInputBlur('root', 'title')}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            validationErrors.title 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300'
          }`}
          placeholder="e.g., Senior Software Engineer Resume"
        />
        {validationErrors.title && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Summary
        </label>
        <textarea
          rows={4}
          value={formData.summary}
          onChange={(e) => handleInputChange('root', 'summary', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Write a brief summary of your professional background and key achievements..."
        />
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={formData.personalInfo.fullName}
            onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
            onBlur={() => handleInputBlur('personalInfo', 'fullName')}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.fullName 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {validationErrors.fullName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.fullName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            onBlur={() => handleInputBlur('personalInfo', 'email')}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.email 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="john.doe@email.com"
          />
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            onBlur={() => handleInputBlur('personalInfo', 'phone')}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.phone 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {validationErrors.phone && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.personalInfo.address}
            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
            onBlur={() => handleInputBlur('personalInfo', 'address')}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.address 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="City, State, Country"
          />
          {validationErrors.address && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.address}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.personalInfo.website}
            onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="https://yourwebsite.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.personalInfo.linkedin}
            onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub
          </label>
          <input
            type="url"
            value={formData.personalInfo.github}
            onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="https://github.com/johndoe"
          />
        </div>
      </div>
    </div>
  );

  const renderWorkExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Experience
        </button>
      </div>
      
      {formData.workExperience.map((job, index) => (
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
                Job Title *
              </label>
              <input
                type="text"
                required
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
                Company *
              </label>
              <input
                type="text"
                required
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
                Start Date *
              </label>
              <input
                type="date"
                required
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
            <textarea
              rows={3}
              value={job.description}
              onChange={(e) => handleInputChange('workExperience', 'description', e.target.value, index)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your role and responsibilities..."
            />
          </div>
        </div>
      ))}
      
      {formData.workExperience.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>No work experience added yet. Click "Add Experience" to get started.</p>
        </div>
      )}
      
      {validationErrors.workExperience && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm font-medium">{validationErrors.workExperience}</p>
          </div>
        </div>
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
            <textarea
              rows={2}
              value={edu.description}
              onChange={(e) => handleInputChange('education', 'description', e.target.value, index)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Relevant coursework, honors, activities..."
            />
          </div>
        </div>
      ))}
      
      {formData.education.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <p>No education added yet. Click "Add Education" to get started.</p>
        </div>
      )}
      
      {validationErrors.education && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm font-medium">{validationErrors.education}</p>
          </div>
        </div>
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
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>No skills added yet. Use the "Quick Add" section above or click "Add Skill Category" to get started.</p>
        </div>
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
            <textarea
              rows={3}
              value={project.description}
              onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe the project, your role, and key features..."
            />
          </div>
        </div>
      ))}
      
      {formData.projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No projects added yet. Click "Add Project" to get started.</p>
        </div>
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
            <textarea
              rows={2}
              value={achievement.description}
              onChange={(e) => handleInputChange('achievements', 'description', e.target.value, index)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe the achievement..."
            />
          </div>
        </div>
      ))}
      
      {formData.achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p>No achievements added yet. Click "Add Achievement" to get started.</p>
        </div>
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
        if (!validators.required(formData.personalInfo.address)) {
          errors.address = 'Address is required';
        }
        break;
      case 3:
        // Validate work experience - check if any experience has been started
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
    
    // Check if there are any validation errors
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
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto py-6 px-3 sm:py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => navigate('/resume-list')}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm"
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
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm"
                title="Save draft now"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save Draft</span>
              </button>
              <button
                onClick={clearFormData}
                className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs sm:text-sm"
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
              disabled={!isStepValid() || loading}
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