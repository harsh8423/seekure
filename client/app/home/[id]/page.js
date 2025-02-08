// frontend/app/home/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import PreferencesModal from '@/components/PreferencesModal';
import JobCard from '@/components/JobCard';
import TelegramMessageCard from '@/components/TelegramMessageCard';
import JobAnalysisTools from '@/components/JobAnalysisTools';
import { Wand2, Settings, Search } from 'lucide-react';

export default function HomePage() {

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [telegramMessages, setTelegramMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // New state for UI interactions
  const [aiQuery, setAIQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    jobType: [],
    workMode: [],
    experience: []
  });

  // Add sidebar filters
  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
  const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Executive'];

  const handleAISearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: aiQuery }),
      });
      
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  // Add filtered jobs calculation
  const filteredJobs = jobs.filter(job => {
    const typeMatch = activeFilters.jobType.length === 0 || 
      activeFilters.jobType.includes(job.type);
    const modeMatch = activeFilters.workMode.length === 0 || 
      activeFilters.workMode.includes(job.mode);
    const expMatch = activeFilters.experience.length === 0 || 
      activeFilters.experience.includes(job.experience);
    return typeMatch && modeMatch && expMatch;
  });



  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/user', {
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
// In your HomePage component

const fetchJobs = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/jobs/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    console.log(validJobs)
    setTelegramMessages(validMessages);
  } catch (error) {
    setError(error.message || 'Failed to load jobs. Please try again later.');
    console.error('Error fetching jobs:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSavePreferences = async (newPreferences) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/auth/preferences', {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <main className="flex gap-8 p-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-72 space-y-6 sticky top-20 ">
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
              </div>

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
          <div className="flex justify-between items-center mb-8">
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
            <div className="space-y-8">
              {/* Jobs Section */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  🔥 Matching Jobs
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {filteredJobs.length} results
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </section>

              {/* Telegram Messages Section */}
              {preferences?.includeTelegram && telegramMessages.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    📢 Telegram Updates
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {telegramMessages.length} new posts
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {telegramMessages.map((message, index) => (
                      <TelegramMessageCard key={index} message={message} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <PreferencesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          preferences={preferences}
          onSave={handleSavePreferences}
        />
      </main>
    </div>
  );
}