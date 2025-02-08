import { useState } from 'react';
import CoverLetterModal from './CoverLetterModal';
import ATSAnalysisModal from './ATSAnalysisModal';
import JobDescriptionModal from './JobDescriptionModal';
import { PenLine, Wand2, CheckCheck } from 'lucide-react';

export default function JobAnalysisTools() {
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isJobDescModalOpen, setIsJobDescModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleJobDescriptionSubmit = (description) => {
    setJobDescription(description);
    setIsJobDescModalOpen(false);
    
    if (modalType === 'coverLetter') {
      setIsCoverLetterModalOpen(true);
    } else if (modalType === 'ats') {
      setIsATSModalOpen(true);
    }
  };

  const handleToolSelect = (type) => {
    setModalType(type);
    setIsJobDescModalOpen(true);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
    <Wand2 className="w-4 h-4 text-purple-500" />
    Quick Tools
  </h3>
  
  <div className="space-y-2">
    <button
      onClick={() => handleToolSelect('coverLetter')}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:border-purple-200 hover:-translate-y-0.5"
    >
      <div className="p-1.5 bg-green-100 rounded-md">
        <PenLine className="w-4 h-4 text-green-600" />
      </div>
      <div className="text-left">
        <p className="font-medium text-gray-700">Cover Letter</p>
        <p className="text-xs text-gray-500">AI-generated letters</p>
      </div>
    </button>

    <button
      onClick={() => handleToolSelect('ats')}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:border-purple-200 hover:-translate-y-0.5"
    >
      <div className="p-1.5 bg-amber-100 rounded-md">
        <CheckCheck className="w-4 h-4 text-amber-600" />
      </div>
      <div className="text-left">
        <p className="font-medium text-gray-700">ATS Check</p>
        <p className="text-xs text-gray-500">Resume analysis</p>
      </div>
    </button>
  </div>

      <JobDescriptionModal
        isOpen={isJobDescModalOpen}
        onClose={() => setIsJobDescModalOpen(false)}
        onSubmit={handleJobDescriptionSubmit}
        type={modalType}
      />
      
      <CoverLetterModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
        customJob={{
          description: jobDescription
        }}
        isCustomJob={true}
      />
      
      <ATSAnalysisModal
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
        customJob={{
          description: jobDescription
        }}
        isCustomJob={true}
      />
    </div>
  );
} 