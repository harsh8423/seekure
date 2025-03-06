'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import PreferencesModal from '@/components/PreferencesModal';
import JobAnalysisTools from '@/components/JobAnalysisTools';
import MixedContentCard from '@/components/MixedContentCard';
import { 
  Wand2, Settings, Search, Filter, X, Home, 
  ListFilter, Sparkles, ArrowUp
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [telegramMessages, setTelegramMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Mobile navigation state
  const [activeTab, setActiveTab] = useState('home');
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [showFloatingFilters, setShowFloatingFilters] = useState(false);
  const [showFloatingTools, setShowFloatingTools] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // New state for UI interactions
  const [aiQuery, setAIQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    jobType: [],
    workMode: [],
    experience: [],
    location: '',
    datePosted: ''
  });

  // Add sidebar filters
  const JOB_TYPES = ['fulltime', 'part-time', 'internship'];
  const WORK_MODES = ['remote', 'hybrid', 'on-site'];
  const EXPERIENCE_LEVELS = ['entry', 'mid-senior'];

  // Add date posted options
  const DATE_POSTED_OPTIONS = [
    { value: 'today', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: 'all', label: 'All time' }
  ];

  // Add a new state for mixed content
  const [mixedContent, setMixedContent] = useState([]);

  // Scroll position tracking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAISearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://seekure.onrender.com/api/jobs/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: aiQuery }),
      });
      
      const data = await response.json();
      setJobs(data.jobs);
      setShowFloatingSearch(false);
      setActiveTab('home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      // Make sure we're working with arrays for these categories
      if (['jobType', 'workMode', 'experience'].includes(category)) {
        const currentValues = prev[category] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value];
        
        return {
          ...prev,
          [category]: newValues
        };
      }
      
      // For non-array filters (location, datePosted)
      return {
          ...prev,
          [category]: value
      };
    });
  };

  // Remove the local filtering logic since we're now using backend filtering
  // The jobs state will already contain the filtered results from the backend
  const filteredJobs = jobs; // Direct assignment since backend handles filtering

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('https://seekure.onrender.com/api/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setPreferences(userData.preferences);
          if (!userData.preferences) {
            setIsModalOpen(true);
          } else {
            // Fetch jobs only if user has preferences
            fetchJobs();
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare filter parameters
      const filterParams = {
        jobType: activeFilters.jobType,
        workMode: activeFilters.workMode,
        experience: activeFilters.experience,
        location: activeFilters.location,
        datePosted: activeFilters.datePosted
      };

      const response = await fetch('https://seekure.onrender.com/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filterParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }

      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid response format from server');
      }

      // Validate and transform job data
      const validJobs = data.jobs?.map(job => ({
        ...job,
        date_posted: job.date_posted || '',
        score: typeof job.score === 'number' ? job.score : 0
      })) || [];

      // Validate and transform telegram messages
      const validMessages = data.telegram_messages?.map(msg => ({
        ...msg,
        date: msg.date || '',
        score: typeof msg.score === 'number' ? msg.score : 0
      })) || [];

      setJobs(validJobs);
      setTelegramMessages(validMessages);
    } catch (error) {
      setError(error.message || 'Failed to load jobs');
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect to handle filter changes
  useEffect(() => {
    if (preferences) {
      fetchJobs();
    }
  }, [activeFilters, preferences]);

  // Use useMemo to create mixed content only when jobs or telegramMessages change
  useEffect(() => {
    if (!loading && preferences) {
      // Only include telegram messages if user preferences allow
      const telegramToInclude = preferences?.includeTelegram ? telegramMessages : [];
      
      // Create a combined array with type information
      const jobItems = jobs.map(job => ({ item: job, type: 'job' }));
      const telegramItems = telegramToInclude.map(msg => ({ item: msg, type: 'telegram' }));
      
      // Combine both arrays
      const combined = [...jobItems, ...telegramItems];
      
      // Shuffle the combined array
      const shuffled = [...combined].sort(() => Math.random() - 0.5);
      
      setMixedContent(shuffled);
    }
  }, [jobs, telegramMessages, preferences, loading]);

  const handleSavePreferences = async (newPreferences) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://seekure.onrender.com/api/auth/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPreferences)
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      // Fetch jobs after updating preferences
      fetchJobs();
      setActiveTab('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchJobs();
    setShowFloatingFilters(false);
    setActiveTab('home');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Reset all floating panels
    setShowFloatingSearch(false);
    setShowFloatingFilters(false);
    setShowFloatingTools(false);
    
    // Show appropriate panel based on tab
    if (tab === 'aiSearch') {
      setShowFloatingSearch(true);
    } else if (tab === 'quickTools') {
      setShowFloatingTools(true);
    } else if (tab === 'preferences') {
      setIsModalOpen(true);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // NavButton Component for Bottom Navigation
  const NavButton = ({ icon, label, isActive, onClick }) => {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center w-16 transition-colors duration-200"
      >
        <div className={`${isActive ? 'text-purple-600' : 'text-gray-500'} transform transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <span className={`text-xs mt-1 ${isActive ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 md:pb-0">
      <Navigation />
      
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe rounded-t-3xl shadow-lg md:hidden z-50">
        <div className="flex justify-center items-center h-16 gap-12">
          <NavButton 
            icon={<Home size={22} />} 
            label="Home" 
            isActive={activeTab === 'home'}
            onClick={() => handleTabChange('home')}
          />
          <div className="relative -mt-8">
            <button 
              onClick={() => handleTabChange('aiSearch')}
              className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 
                flex items-center justify-center shadow-xl transform transition-all duration-200
                border-8 border-gray-100 hover:scale-105
                ${activeTab === 'aiSearch' ? 'from-purple-600 to-purple-800 shadow-inner' : ''}
                relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black opacity-10 rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                <Wand2 size={18} className="text-white" />
                <span className="text-white text-xs opacity-90 mt-1">AI Search</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
            </button>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"></div>
          </div>
          <NavButton 
            icon={<Settings size={22} />} 
            label="Preferences" 
            isActive={activeTab === 'preferences'}
            onClick={() => handleTabChange('preferences')}
          />
        </div>
      </div>

      {/* Floating Search Panel - Mobile Only */}
      {showFloatingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wand2 size={20} className="text-purple-600" />
                AI Job Search
              </h3>
              <button 
                onClick={() => setShowFloatingSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Ask for jobs like 'React roles in NYC...'"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={aiQuery}
                onChange={(e) => setAIQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleAISearch}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl
                      hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search Jobs
            </button>
          </div>
        </div>
      )}

      {/* Floating Filter Panel - Mobile Only */}
      {showFloatingFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden flex items-start justify-center pt-16 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-lg mb-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ListFilter size={20} className="text-purple-600" />
                Filter Jobs
              </h3>
              <button 
                onClick={() => setShowFloatingFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Job Type</h4>
                {JOB_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.jobType.includes(type)}
                      onChange={() => toggleFilter('jobType', type)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Location</h4>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={activeFilters.location}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Date Posted</h4>
                <select
                  value={activeFilters.datePosted}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    datePosted: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All time</option>
                  {DATE_POSTED_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Work Mode</h4>
                {WORK_MODES.map(mode => (
                  <label key={mode} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.workMode.includes(mode)}
                      onChange={() => toggleFilter('workMode', mode)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{mode}</span>
                  </label>
                ))}
              </div> */}

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Experience</h4>
                {EXPERIENCE_LEVELS.map(level => (
                  <label key={level} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.experience.includes(level)}
                      onChange={() => toggleFilter('experience', level)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={applyFilters}
              className="w-full py-3 mt-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl
                      hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center justify-center gap-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Floating Quick Tools Panel - Mobile Only */}
      {showFloatingTools && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-purple-600" />
                Quick Tools
              </h3>
              <button 
                onClick={() => setShowFloatingTools(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="py-2">
              <JobAnalysisTools />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter FAB */}
      <button 
        onClick={() => setShowFloatingFilters(true)}
        className="fixed right-4 bottom-20 z-30 md:hidden bg-white p-3 rounded-full shadow-lg border border-gray-200"
      >
        <Filter size={24} className="text-purple-600" />
      </button>

      {/* Mobile Quick Tools FAB */}
      <button 
        onClick={() => handleTabChange('quickTools')}
        className="fixed right-4 bottom-36 z-30 md:hidden bg-white p-3 rounded-full shadow-lg border border-gray-200"
      >
        <Sparkles size={24} className="text-purple-600" />
      </button>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-52 z-30 md:hidden bg-white p-3 rounded-full shadow-lg border border-gray-200"
        >
          <ArrowUp size={24} className="text-purple-600" />
        </button>
      )}

      <main className="flex flex-col md:flex-row gap-8 p-3 md:p-6 max-w-7xl mx-auto">
        {/* Sidebar - Hidden on mobile, visible on md and up */}
        <div className="hidden md:block w-72 space-y-6 sticky top-20">
          {/* AI Search */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Wand2 size={20} className="text-purple-600" />
              AI Job Search
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask for jobs like 'React roles in NYC...'"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl pr-12 
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={aiQuery}
                onChange={(e) => setAIQuery(e.target.value)}
              />
              <button
                onClick={handleAISearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-100 hover:bg-purple-200 
                        rounded-lg transition-colors"
              >
                <Search size={18} className="text-purple-600" />
              </button>
            </div>
          </div>
          
          <JobAnalysisTools />

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-3">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Job Type</h4>
                {JOB_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.jobType.includes(type)}
                      onChange={() => toggleFilter('jobType', type)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Location</h4>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={activeFilters.location}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Date Posted</h4>
                <select
                  value={activeFilters.datePosted}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    datePosted: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All time</option>
                  {DATE_POSTED_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Work Mode</h4>
                {WORK_MODES.map(mode => (
                  <label key={mode} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.workMode.includes(mode)}
                      onChange={() => toggleFilter('workMode', mode)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{mode}</span>
                  </label>
                ))}
              </div> */}

              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-600">Experience</h4>
                {EXPERIENCE_LEVELS.map(level => (
                  <label key={level} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={activeFilters.experience.includes(level)}
                      onChange={() => toggleFilter('experience', level)}
                      className="w-4 h-4 text-purple-500 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Your personalized job matches are here</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm
                       border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Settings size={18} className="text-gray-600" />
              Edit Preferences
            </button>
          </div>

          {/* Mobile Header */}
          <div className="flex flex-col mb-6 md:hidden">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user.name}!</h1>
            <p className="text-sm text-gray-600">Your personalized job matches are here</p>
          </div>

          {loading ? (
            <div className="text-center py-8 space-y-4">
              <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-full mx-auto"></div>
              <p className="text-gray-600">Finding your dream jobs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-xl text-red-700 text-center">
              ⚠️ {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🔥 Recommended For You
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {mixedContent.length} results
                  </span>
                </h2>
              </div>
              
              {/* Mixed content feed */}
              <div className="grid grid-cols-1 gap-4">
                {mixedContent.map((content, index) => (
                  <div key={`${content.type}-${index}`} className="w-full">
                    <MixedContentCard item={content.item} type={content.type} />
                  </div>
                ))}
              </div>
              
              {mixedContent.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No matching content found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <PreferencesModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveTab('home');
          }}
          onSave={handleSavePreferences}
          initialPreferences={preferences}
        />
      </main>
    </div>
  );
}