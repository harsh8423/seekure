import { useState } from 'react';
import { X } from 'lucide-react';

export default function JobDescriptionModal({ isOpen, onClose, onSubmit, type }) {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onSubmit(jobDescription);
      setJobDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {type === 'coverLetter' ? 'Generate Cover Letter' : 'ATS Analysis'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border rounded-lg h-64 focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste the complete job description here including company name, job title, requirements, etc..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            {type === 'coverLetter' ? 'Generate Cover Letter' : 'Analyze Resume'}
          </button>
        </form>
      </div>
    </div>
  );
} 