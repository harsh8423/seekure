// components/JobDetailsModal.js
import { X, ExternalLink, MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function JobDetailsModal({ isOpen, onClose, job }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-xl text-gray-700 mt-2 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-500" />
                {job.company}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <span>{job.job_type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-green-500" />
              <span>Posted {new Date(job.date_posted).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </div>

          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Apply on {job.source?.charAt(0).toUpperCase() + job.source?.slice(1)}
          </a>
        </div>
      </div>
    </div>
  );
}