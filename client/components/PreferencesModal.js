import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';

// Mock data for telegram channels
const TELEGRAM_CHANNELS = [
  { username: '@techjobs', name: 'Tech Jobs Global', channelId: '12345' },
  { username: '@devjobs', name: 'Developer Jobs', channelId: '67890' },
  { username: '@remotework', name: 'Remote Work Hub', channelId: '11223' },
  { username: '@startupjobs', name: 'Startup Jobs', channelId: '44556' }
];

// List of countries (abbreviated for brevity)
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 
  'Germany', 'France', 'India', 'Singapore', 'Japan'
].sort();

const PreferencesModal = ({ 
  isOpen, 
  onClose, 
  preferences = {}, 
  onSave 
}) => {
  const [sources, setSources] = useState({
    linkedin: true,
    indeed: true,
    glassdoor: true,
    google: true,
    ...preferences.sources
  });

  const [jobType, setJobType] = useState(preferences.jobType || 'fulltime');
  const [location, setLocation] = useState(preferences.location || '');
  const [workMode, setWorkMode] = useState(preferences.workMode || 'hybrid');
  const [includeTelegram, setIncludeTelegram] = useState(preferences.includeTelegram || false);
  const [telegramSearch, setTelegramSearch] = useState('');
  const [selectedChannels, setSelectedChannels] = useState(preferences.telegramChannels || []);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  const filteredChannels = TELEGRAM_CHANNELS.filter(channel => 
    channel.name.toLowerCase().includes(telegramSearch.toLowerCase()) ||
    channel.username.toLowerCase().includes(telegramSearch.toLowerCase())
  );

  const handleSearchChannel = async () => {
    if (!telegramSearch.trim()) return;

    setSearching(true);
    setSearchError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/search-telegram-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: telegramSearch })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search channel');
      }

      const data = await response.json();
      
      if (data.channel) {
        handleAddChannel(data.channel);
        setTelegramSearch('');
        setSearchError('');
      }
    } catch (error) {
      setSearchError(error.message || 'Channel not found. Please enter a valid channel username.');
    } finally {
      setSearching(false);
      setShowChannelDropdown(false);
    }
  };

  const handleSourceToggle = (source) => {
    setSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleAddChannel = (channel) => {
    if (!selectedChannels.find(ch => ch.channelId === channel.channelId)) {
      setSelectedChannels(prev => [...prev, channel]);
    }
  };

  const handleRemoveChannel = (channelId) => {
    setSelectedChannels(prev => prev.filter(ch => ch.channelId !== channelId));
  };

  const handleSave = () => {
    onSave({
      sources,
      jobType,
      location,
      workMode,
      includeTelegram,
      telegramChannels: selectedChannels
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Job Preferences</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sources Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Sources</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sources).map(([source, isSelected]) => (
              <button
                key={source}
                onClick={() => handleSourceToggle(source)}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  isSelected 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Job Type</h3>
          <div className="flex gap-2">
            {['fulltime', 'internship', 'contract'].map(type => (
              <button
                key={type}
                onClick={() => setJobType(type)}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  jobType === type 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Location</h3>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a country</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Work Mode Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Work Mode</h3>
          <div className="flex gap-2">
            {['remote', 'onsite', 'hybrid'].map(mode => (
              <button
                key={mode}
                onClick={() => setWorkMode(mode)}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  workMode === mode 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Telegram Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={includeTelegram}
              onChange={(e) => setIncludeTelegram(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label className="text-lg font-medium text-gray-700">
              Include Telegram Channels
            </label>
          </div>

          {includeTelegram && (
            <div className="space-y-3">
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={telegramSearch}
                    onChange={(e) => {
                      setTelegramSearch(e.target.value);
                      setSearchError('');
                    }}
                    placeholder="Enter Telegram channel username..."
                    className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button 
                    onClick={handleSearchChannel}
                    disabled={searching}
                    className={`px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                      searching ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {searching ? 'Searching...' : <Search size={18} />}
                  </button>
                </div>

                {searchError && (
                  <p className="text-red-500 text-sm mt-1">{searchError}</p>
                )}
              </div>

              {selectedChannels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Selected Channels:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChannels.map(channel => (
                      <div
                        key={channel.channelId}
                        className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-md"
                      >
                        {channel.icon && (
                          <img 
                            src={channel.icon} 
                            alt={channel.name} 
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span>{channel.name}</span>
                        <button
                          onClick={() => handleRemoveChannel(channel.channelId)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;