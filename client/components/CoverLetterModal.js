import { useState } from 'react';
import { X } from 'lucide-react';

const FORMATS = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Traditional, professional format suitable for most industries'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary style with bullet points and clear sections'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique, story-telling approach for creative industries'
  }
];

export default function CoverLetterModal({ isOpen, onClose, jobId, customJob, isCustomJob }) {
  const [format, setFormat] = useState('standard');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCoverLetter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const endpoint = isCustomJob ? '/api/jobs/generate-cover-letter-custom' : '/api/jobs/generate-cover-letter';
      
      const body = isCustomJob 
        ? { job: customJob, format } 
        : { jobId, format };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generate Cover Letter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMATS.map((fmt) => (
              <div
                key={fmt.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  format === fmt.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}
                onClick={() => setFormat(fmt.id)}
              >
                <h4 className="font-medium">{fmt.name}</h4>
                <p className="text-sm text-gray-600">{fmt.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCoverLetter}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
            loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Cover Letter Display */}
        {coverLetter && (
          <div className="mt-6">
            <div 
              className="prose max-w-none p-6 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: coverLetter }}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  const blob = new Blob([coverLetter], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cover-letter.html';
                  a.click();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download HTML
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coverLetter);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 