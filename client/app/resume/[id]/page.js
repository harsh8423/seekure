// frontend/app/resume/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase } from 'lucide-react';
// import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function Resume() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Add new form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    job_titles: [],
    contact_details: {},
    projects: [],
    experience: [{ title: '', company: '', duration: '' }],
    education: [{ degree: '', institution: '', year: '' }]
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

  // Add new handlers
  const handleInputChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
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

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: newEducation
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
      const response = await fetch('http://localhost:5000/api/upload_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed.');
      }

      const data = await response.json();
      setParsedData(data);
      
      // Set form data from parsed response
      setFormData({
        name: data?.contact_details?.name || '',
        email: data?.contact_details?.email || '',
        phone: data?.contact_details?.phone || '',
        skills: Array.isArray(data?.skills) ? data.skills.join(', ') : '',
        job_titles: data?.job_titles || [],
        contact_details: data?.contact_details || {},
        projects: data?.projects || [],
        experience: data?.work_experience || [{ title: '', company: '', duration: '' }],
        education: data?.education || [{ degree: '', institution: '', year: '' }]
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
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
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
    <div>
      <div className="flex flex-col items-center max-w-3xl w-full">
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
                    <div className="flex items-center justify-between bg-gray-50/80 px-6 py-4 rounded-xl">
                      <div className="flex items-center gap-4">
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
                    {/* Display Parsed Data */}
                    {parsedData && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full overflow-auto max-h-96">
                        <h3 className="text-xl font-semibold mb-2">Parsed Resume Data:</h3>
                        <pre className="text-sm text-gray-800">
                          {JSON.stringify(parsedData, null, 2)}
                        </pre>
                      </div>
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
        <div className="mt-8 max-w-3xl w-full">
          <div className="space-y-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <h2 className="text-2xl font-semibold text-gray-800">Review Your Profile</h2>
            
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => handleInputChange(e, 'skills')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Separate skills with commas"
                />
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Experience</h3>
              {formData.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Education</h3>
              {formData.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleSubmit} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
