'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase, User, Mail, Phone, MapPin, GraduationCap, Code, Github, Linkedin, Globe, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Resume() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    skills: true,
    experience: true,
    education: true,
    projects: true
  });

  // Add new form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: { city: '', state: '', country: '' },
    github_link: '',
    linkedin_link: '',
    portfolio_link: '',
    skills: '',
    job_titles: [],
    contact_details: {},
    projects: [],
    experience: [{ title: '', company: '', duration_in_months: '', responsibilities: [''] }],
    education: [{ degree: '', institute: '', graduation_year: '', grade: '' }]
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      setUploadError(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      setUploadError(null);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add new handlers
  const handleInputChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleLocationChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: e.target.value
      }
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index][field] = value;
    setFormData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleResponsibilityChange = (expIndex, respIndex, value) => {
    const newExperience = [...formData.experience];
    if (!newExperience[expIndex].responsibilities) {
      newExperience[expIndex].responsibilities = [];
    }
    newExperience[expIndex].responsibilities[respIndex] = value;
    setFormData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const addResponsibility = (expIndex) => {
    const newExperience = [...formData.experience];
    if (!newExperience[expIndex].responsibilities) {
      newExperience[expIndex].responsibilities = [];
    }
    newExperience[expIndex].responsibilities.push('');
    setFormData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const removeResponsibility = (expIndex, respIndex) => {
    const newExperience = [...formData.experience];
    newExperience[expIndex].responsibilities.splice(respIndex, 1);
    setFormData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const handleProjectTechChange = (projIndex, techIndex, value) => {
    const newProjects = [...formData.projects];
    if (!newProjects[projIndex].technologies) {
      newProjects[projIndex].technologies = [];
    }
    newProjects[projIndex].technologies[techIndex] = value;
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const addProjectTech = (projIndex) => {
    const newProjects = [...formData.projects];
    if (!newProjects[projIndex].technologies) {
      newProjects[projIndex].technologies = [];
    }
    newProjects[projIndex].technologies.push('');
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const removeProjectTech = (projIndex, techIndex) => {
    const newProjects = [...formData.projects];
    newProjects[projIndex].technologies.splice(techIndex, 1);
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration_in_months: '', responsibilities: [''] }]
    }));
  };

  const removeExperience = (index) => {
    const newExperience = [...formData.experience];
    newExperience.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      experience: newExperience.length ? newExperience : [{ title: '', company: '', duration_in_months: '', responsibilities: [''] }]
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institute: '', graduation_year: '', grade: '' }]
    }));
  };

  const removeEducation = (index) => {
    const newEducation = [...formData.education];
    newEducation.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      education: newEducation.length ? newEducation : [{ degree: '', institute: '', graduation_year: '', grade: '' }]
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: [''], links: [''] }]
    }));
  };

  const removeProject = (index) => {
    const newProjects = [...formData.projects];
    newProjects.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const handleProjectLinkChange = (projIndex, linkIndex, value) => {
    const newProjects = [...formData.projects];
    if (!newProjects[projIndex].links) {
      newProjects[projIndex].links = [];
    }
    newProjects[projIndex].links[linkIndex] = value;
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const addProjectLink = (projIndex) => {
    const newProjects = [...formData.projects];
    if (!newProjects[projIndex].links) {
      newProjects[projIndex].links = [];
    }
    newProjects[projIndex].links.push('');
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const removeProjectLink = (projIndex, linkIndex) => {
    const newProjects = [...formData.projects];
    newProjects[projIndex].links.splice(linkIndex, 1);
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://seekure.onrender.com/api/upload_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed.');
      }

      const data = await response.json();
      console.log(data);
      setParsedData(data);
      
      // Set form data from parsed response
      setFormData({
        name: data?.contact_details?.name || '',
        email: data?.contact_details?.email || '',
        phone: data?.contact_details?.phone || '',
        location: data?.contact_details?.location || { city: '', state: '', country: '' },
        github_link: data?.contact_details?.github_link || '',
        linkedin_link: data?.contact_details?.linkedin_link || '',
        portfolio_link: data?.contact_details?.portfolio_link || '',
        skills: Array.isArray(data?.skills) ? data.skills.join(', ') : '',
        job_titles: data?.job_titles || [],
        contact_details: data?.contact_details || {},
        projects: data?.projects || [],
        experience: data?.work_experience?.length ? data.work_experience : [{ title: '', company: '', duration_in_months: '', responsibilities: [''] }],
        education: data?.education?.length ? data.education : [{ degree: '', institute: '', graduation_year: '', grade: '' }]
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://seekure.onrender.com/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/home/${data.userId}`);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Resume Parser</h1>
      
      <div className="flex flex-col items-center w-full">
        <div 
          className={`w-full bg-white/80 backdrop-blur-md rounded-2xl p-6
            shadow-[0_4px_20px_rgba(0,0,0,0.05)]
            transition-all duration-300
            hover:shadow-[0_4px_24px_rgba(79,70,229,0.15)]
            ${dragActive ? 'border-2 border-indigo-400 bg-indigo-50/50' : 'border border-gray-100'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="resume-upload"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center">
            {selectedFile ? (
              <div className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50/80 px-4 md:px-6 py-4 rounded-xl">
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Upload size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleUpload}
                      className={`bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium
                        hover:bg-indigo-700 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button 
                      onClick={() => { setSelectedFile(null); setParsedData(null); setUploadError(null); }}
                      className="text-gray-500 hover:text-red-500 transition-colors px-2 py-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {/* Display Upload Error */}
                {uploadError && (
                  <p className="text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            ) : (
              <label
                htmlFor="resume-upload"
                className="w-full cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-8 px-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Upload your resume to find the most relevant jobs
                    </h3>
                    <p className="text-sm text-gray-500">
                      Drag and drop or click to browse (PDF only)
                    </p>
                  </div>
                  <div className="relative">
                    <div className="bg-indigo-50 group-hover:bg-indigo-100 rounded-xl p-3 transition-colors">
                      <Upload 
                        size={22} 
                        className="text-indigo-600 group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Add form UI after parsedData */}
      {parsedData && (
        <div className="mt-8 w-full">
          <div className="space-y-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Review Your Profile</h2>
              <button onClick={handleSubmit} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Save Profile
              </button>
            </div>
            
            {/* Basic Information Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer"
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-800">Basic Information</h3>
                </div>
                {expandedSections.basic ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              {expandedSections.basic && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange(e, 'name')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange(e, 'email')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => handleInputChange(e, 'phone')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.github_link}
                          onChange={(e) => handleInputChange(e, 'github_link')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.linkedin_link}
                          onChange={(e) => handleInputChange(e, 'linkedin_link')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.portfolio_link}
                          onChange={(e) => handleInputChange(e, 'portfolio_link')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.location?.city || ''}
                          onChange={(e) => handleLocationChange(e, 'city')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.location?.state || ''}
                        onChange={(e) => handleLocationChange(e, 'state')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.location?.country || ''}
                        onChange={(e) => handleLocationChange(e, 'country')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer"
                onClick={() => toggleSection('skills')}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-800">Skills</h3>
                </div>
                {expandedSections.skills ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              {expandedSections.skills && (
                <div className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => handleInputChange(e, 'skills')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="JavaScript, React, Node.js, etc."
                  />
                </div>
              )}
            </div>

            {/* Experience Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer"
                onClick={() => toggleSection('experience')}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-800">Work Experience</h3>
                </div>
                {expandedSections.experience ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              {expandedSections.experience && (
                <div className="p-4 space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                      <button 
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        aria-label="Remove experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                        <input
                          type="number"
                          value={exp.duration_in_months}
                          onChange={(e) => handleExperienceChange(index, 'duration_in_months', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                        {exp.responsibilities && exp.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={resp}
                              onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button 
                              onClick={() => removeResponsibility(index, respIndex)}
                              className="text-red-500 hover:text-red-700"
                              disabled={exp.responsibilities.length <= 1}
                              aria-label="Remove responsibility"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addResponsibility(index)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Responsibility
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addExperience}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer"
                onClick={() => toggleSection('education')}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-800">Education</h3>
                </div>
                {expandedSections.education ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              {expandedSections.education && (
                <div className="p-4 space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                      <button 
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        aria-label="Remove education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                          <input
                            type="text"
                            value={edu.institute}
                            onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                          <input
                            type="text"
                            value={edu.graduation_year}
                            onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grade/GPA</label>
                          <input
                            type="text"
                            value={edu.grade}
                            onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addEducation}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Education
                  </button>
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer"
                onClick={() => toggleSection('projects')}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-800">Projects</h3>
                </div>
                {expandedSections.projects ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              {expandedSections.projects && (
                <div className="p-4 space-y-6">
                  {formData.projects && formData.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                      <button 
                        onClick={() => removeProject(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        aria-label="Remove project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={project.name || ''}
                          onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={project.description || ''}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[80px]"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                        {project.technologies && project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={tech || ''}
                              onChange={(e) => handleProjectTechChange(index, techIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="React, Node.js, etc."
                            />
                            <button 
                              onClick={() => removeProjectTech(index, techIndex)}
                              className="text-red-500 hover:text-red-700"
                              disabled={!project.technologies || project.technologies.length <= 1}
                              aria-label="Remove technology"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addProjectTech(index)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Technology
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Links</label>
                        {project.links && project.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={link || ''}
                              onChange={(e) => handleProjectLinkChange(index, linkIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="https://github.com/username/project"
                            />
                            <button 
                              onClick={() => removeProjectLink(index, linkIndex)}
                              className="text-red-500 hover:text-red-700"
                              disabled={!project.links || project.links.length <= 1}
                              aria-label="Remove link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addProjectLink(index)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Link
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addProject}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              )}
            </div>
            
            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSubmit} 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Save Profile & Find Jobs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button 
          onClick={() => router.push('/home')}
          className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}