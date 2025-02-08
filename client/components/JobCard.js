import { useState } from 'react';
import { Building2, MapPin, Calendar, Send, ExternalLink, Briefcase } from 'lucide-react';
import JobDetailsModal from './JobDetailsModal';
import CoverLetterModal from './CoverLetterModal';
import ATSAnalysisModal from './ATSAnalysisModal';

const SOURCE_ICONS = {
  indeed: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.svg',
  linkedin: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  glassdoor: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg',
  monster: 'https://www.monster.com/favicon.ico',
  telegram: '/icons/telegram.png'
};

export default function JobCard({ job }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isATSOpen, setIsATSOpen] = useState(false);

  return (
    <div className="w-full bg-white rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
      <div className="p-6 relative">
        {job.site && SOURCE_ICONS[job.site] && (
          <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full p-1 shadow-sm">
            <img 
              src={SOURCE_ICONS[job.site]} 
              alt={job.source} 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {job.company_logo && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-white p-2 shadow-sm">
                <img 
                  src={job.company_logo} 
                  alt={job.company} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
              <p className="text-gray-700 font-medium flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                {job.company}
              </p>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-sm">{job.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700">
              <Briefcase className="w-4 h-4 mr-1" /> {job.job_type}
            </span>
            {job.job_level && (
              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                {job.job_level}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-green-500" />
          <span>Posted {new Date(job.date_posted).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-1"
          >
            View Details
          </button>
          <button
            onClick={() => setIsATSOpen(true)}
            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> Analysis
          </button>
          <button
            onClick={() => setIsCoverLetterOpen(true)}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm flex items-center gap-1"
          >
            Cover Letter
          </button>
          <a 
            href={job.job_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" /> Apply
          </a>
        </div>
      </div>

      <JobDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={job}
      />
      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        jobId={job.id}
      />
      <ATSAnalysisModal
        isOpen={isATSOpen}
        onClose={() => setIsATSOpen(false)}
        jobId={job.id}
      />
    </div>
  );
}


