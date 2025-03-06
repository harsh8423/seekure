import { useState } from 'react';
import { Building2, MapPin, Calendar, Send, ExternalLink, Briefcase } from 'lucide-react';
import JobDetailsModal from './JobDetailsModal';
import CoverLetterModal from './CoverLetterModal';
import ATSAnalysisModal from './ATSAnalysisModal';
import { formatDistanceToNow } from 'date-fns';

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

  // Format the date to show relative time (e.g., "2 days ago")
  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Date unavailable';
    }
  };

  return (
    <div 
      className="w-full bg-white rounded-xl hover:shadow-lg md:hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer"
      
    >
      <div className="p-4 md:p-6 relative" onClick={() => setIsDetailsOpen(true)}>
        {job.site && SOURCE_ICONS[job.site] && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full p-1 shadow-sm">
            <img 
              src={SOURCE_ICONS[job.site]} 
              alt={job.site} 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start gap-3 md:gap-4">
            {job.company_logo && (
              <div className="relative min-w-12 w-12 h-12 md:min-w-16 md:w-16 md:h-16 rounded-lg overflow-hidden border border-gray-100 bg-white p-1 md:p-2 shadow-sm flex-shrink-0">
                <img 
                  src={job.company_logo} 
                  alt={job.company} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-1 min-w-0">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 truncate">{job.title}</h3>
              <p className="text-gray-700 font-medium flex items-center gap-1 md:gap-2 text-sm md:text-base truncate">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                {job.company}
              </p>
              <div className="flex items-center gap-1 md:gap-2 text-gray-500 truncate">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                <span className="text-xs md:text-sm">{job.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full bg-purple-100 text-purple-700 items-center">
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1" /> {job.job_type}
            </span>
            {job.job_level && (
              <span className="inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                {job.job_level}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-gray-100">
        <div className="text-xs md:text-sm text-gray-500 flex items-center gap-1 flex-shrink-0">
          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <span>{formatRelativeDate(job.date_posted)}</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              setIsATSOpen(true);
            }}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-xs md:text-sm flex items-center gap-1"
            aria-label="Open ATS analysis"
          >
            <Send className="w-3 h-3 md:w-4 md:h-4" /> Analysis
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              setIsCoverLetterOpen(true);
            }}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs md:text-sm flex items-center gap-1"
            aria-label="Generate cover letter"
          >
            Cover Letter
          </button>
          <a 
            href={job.job_url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent card click
            className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs md:text-sm flex items-center gap-1"
            aria-label="Apply for this job"
          >
            <ExternalLink className="w-3 h-3 md:w-4 md:h-4" /> Apply
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