import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResumeEditor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    workExperience: [
      {
        jobTitle: '',
        company: '',
        dates: '',
        description: ''
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        dates: ''
      }
    ],
    skills: [''],
    achievements: [''],
    customFields: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperience = [...formData.workExperience];
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      workExperience: updatedWorkExperience
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        jobTitle: '',
        company: '',
        dates: '',
        description: ''
      }]
    }));
  };

  const removeWorkExperience = (index) => {
    if (formData.workExperience.length > 1) {
      const updatedWorkExperience = formData.workExperience.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        workExperience: updatedWorkExperience
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        dates: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const updatedEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        education: updatedEducation
      }));
    }
  };

  const handleSkillsChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    if (formData.skills.length > 1) {
      const updatedSkills = formData.skills.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
    }
  };

  const handleAchievementsChange = (index, value) => {
    const updatedAchievements = [...formData.achievements];
    updatedAchievements[index] = value;
    setFormData(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index) => {
    if (formData.achievements.length > 1) {
      const updatedAchievements = formData.achievements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        achievements: updatedAchievements
      }));
    }
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, {
        title: '',
        content: ''
      }]
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...formData.customFields];
    updatedCustomFields[index] = {
      ...updatedCustomFields[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      customFields: updatedCustomFields
    }));
  };

  const removeCustomField = (index) => {
    const updatedCustomFields = formData.customFields.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      customFields: updatedCustomFields
    }));
  };

  const handleSave = () => {
    console.log('Saving resume data:', formData);
    // Add save logic here
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <div 
            className="text-[#111818] flex size-12 shrink-0 items-center cursor-pointer" 
            onClick={handleBack}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </div>
          <h2 className="text-[#111818] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Resume Editor</h2>
        </div>
        <div className="pb-3">
          <div className="flex border-b border-[#dbe6e6] px-4 gap-8">
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'edit' 
                  ? 'border-b-[#111818] text-[#111818]' 
                  : 'border-b-transparent text-[#608a8a]'
              }`}
              onClick={() => setActiveTab('edit')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'edit' ? 'text-[#111818]' : 'text-[#608a8a]'
              }`}>Edit</p>
            </button>
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'preview' 
                  ? 'border-b-[#111818] text-[#111818]' 
                  : 'border-b-transparent text-[#608a8a]'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'preview' ? 'text-[#111818]' : 'text-[#608a8a]'
              }`}>Preview</p>
            </button>
          </div>
        </div>
        
        {activeTab === 'edit' && (
          <div className="overflow-y-auto pb-20">
            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Personal Information</h2>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111818] text-base font-medium leading-normal pb-2">Full Name</p>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                  placeholder="Enter your full name"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111818] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                  placeholder="Enter your email"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111818] text-base font-medium leading-normal pb-2">Phone</p>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                  placeholder="Enter your phone number"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111818] text-base font-medium leading-normal pb-2">Address</p>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                  placeholder="Enter your address"
                />
              </label>
            </div>

            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Work Experience</h2>
            {formData.workExperience.map((work, index) => (
              <div key={index} className="border border-[#dbe6e6] rounded-xl p-4 mx-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[#111818] text-lg font-semibold">Experience {index + 1}</h3>
                  {formData.workExperience.length > 1 && (
                    <button
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Job Title</p>
                    <input
                      type="text"
                      value={work.jobTitle}
                      onChange={(e) => handleWorkExperienceChange(index, 'jobTitle', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="Enter job title"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Company</p>
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="Enter company name"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Dates</p>
                    <input
                      type="text"
                      value={work.dates}
                      onChange={(e) => handleWorkExperienceChange(index, 'dates', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="e.g., 2020 - Present"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Description</p>
                    <textarea
                      value={work.description}
                      onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none min-h-36 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="Describe your responsibilities and achievements"
                    ></textarea>
                  </label>
                </div>
              </div>
            ))}
            <div className="px-4 mb-4">
              <button
                onClick={addWorkExperience}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[#608a8a] rounded-xl text-[#608a8a] hover:border-[#111818] hover:text-[#111818] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Work Experience
              </button>
            </div>

            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-[#dbe6e6] rounded-xl p-4 mx-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[#111818] text-lg font-semibold">Education {index + 1}</h3>
                  {formData.education.length > 1 && (
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Degree</p>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="e.g., Bachelor of Science"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Institution</p>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="Enter institution name"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Dates</p>
                    <input
                      type="text"
                      value={edu.dates}
                      onChange={(e) => handleEducationChange(index, 'dates', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="e.g., 2016 - 2020"
                    />
                  </label>
                </div>
              </div>
            ))}
            <div className="px-4 mb-4">
              <button
                onClick={addEducation}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[#608a8a] rounded-xl text-[#608a8a] hover:border-[#111818] hover:text-[#111818] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Education
              </button>
            </div>

            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Skills</h2>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex max-w-[480px] items-center gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#111818] text-base font-medium leading-normal pb-2">Skill {index + 1}</p>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillsChange(index, e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </label>
                {formData.skills.length > 1 && (
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium mt-8"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div className="px-4 mb-4">
              <button
                onClick={addSkill}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[#608a8a] rounded-xl text-[#608a8a] hover:border-[#111818] hover:text-[#111818] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Skill
              </button>
            </div>

            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Achievements</h2>
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex max-w-[480px] items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#111818] text-base font-medium leading-normal pb-2">Achievement {index + 1}</p>
                  <textarea
                    value={achievement}
                    onChange={(e) => handleAchievementsChange(index, e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none min-h-20 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                    placeholder="Describe your achievement"
                  ></textarea>
                </label>
                {formData.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium mb-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div className="px-4 mb-4">
              <button
                onClick={addAchievement}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[#608a8a] rounded-xl text-[#608a8a] hover:border-[#111818] hover:text-[#111818] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Achievement
              </button>
            </div>

            <h2 className="text-[#111818] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Custom Fields</h2>
            {formData.customFields.map((field, index) => (
              <div key={index} className="border border-[#dbe6e6] rounded-xl p-4 mx-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[#111818] text-lg font-semibold">Custom Field {index + 1}</h3>
                  <button
                    onClick={() => removeCustomField(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Field Title</p>
                    <input
                      type="text"
                      value={field.title}
                      onChange={(e) => handleCustomFieldChange(index, 'title', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none h-14 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="e.g., Certifications, Languages, Projects"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111818] text-base font-medium leading-normal pb-2">Content</p>
                    <textarea
                      value={field.content}
                      onChange={(e) => handleCustomFieldChange(index, 'content', e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111818] focus:outline-0 focus:ring-0 border-none bg-[#f0f5f5] focus:border-none min-h-20 placeholder:text-[#608a8a] p-4 text-base font-normal leading-normal"
                      placeholder="Enter the content for this field"
                    ></textarea>
                  </label>
                </div>
              </div>
            ))}
            <div className="px-4 mb-4">
              <button
                onClick={addCustomField}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[#608a8a] rounded-xl text-[#608a8a] hover:border-[#111818] hover:text-[#111818] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Custom Field
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div className="px-4 py-5 overflow-y-auto pb-20">
            {/* Notice about preview type */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-[480px] mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-blue-800 font-semibold">Simple Preview</h3>
              </div>
              <p className="text-blue-700 text-sm">
                This is a basic preview of your form data. For the full template preview with proper formatting, save your resume and view it from the Resume List.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-[480px] mx-auto">
              <h1 className="text-2xl font-bold text-[#111818] mb-4">{formData.fullName || 'Your Name'}</h1>
              <p className="text-[#608a8a] mb-4">{formData.email || 'email@example.com'} | {formData.phone || 'Phone'} | {formData.address || 'Address'}</p>
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111818] mb-2">Work Experience</h2>
                {formData.workExperience.map((work, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="font-semibold text-[#111818]">{work.jobTitle || 'Job Title'}</h3>
                    <p className="text-[#608a8a]">{work.company || 'Company'} | {work.dates || 'Dates'}</p>
                    <p className="text-sm mt-1">{work.description || 'Description'}</p>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111818] mb-2">Education</h2>
                {formData.education.map((edu, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="font-semibold text-[#111818]">{edu.degree || 'Degree'}</h3>
                    <p className="text-[#608a8a]">{edu.institution || 'Institution'} | {edu.dates || 'Dates'}</p>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#111818] mb-2">Skills</h2>
                <p className="text-sm">{formData.skills.filter(skill => skill.trim()).join(', ') || 'Skills'}</p>
              </div>

              {formData.achievements.some(achievement => achievement.trim()) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#111818] mb-2">Achievements</h2>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {formData.achievements.filter(achievement => achievement.trim()).map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.customFields.map((field, index) => (
                <div key={index} className="mb-6">
                  <h2 className="text-lg font-bold text-[#111818] mb-2">{field.title || 'Custom Field'}</h2>
                  <p className="text-sm">{field.content || 'Content'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={handleSave}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#0cf2f2] text-[#111818] text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Save</span>
          </button>
        </div>
        <div className="h-5 bg-white"></div>
      </div>
    </div>
  );
}

export default ResumeEditor;
