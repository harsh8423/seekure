import { X, Calendar, MapPin, ExternalLink, Send } from 'lucide-react';

export default function TelegramMessageDetailModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  // Add event handler for background click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{message.channel}</h2>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(message.date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="prose max-w-none mb-6 text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: message.message.replace(/\n/g, '<br/>') }} />
          </div>

          {message.url && (
            <a
              href={message.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View in Telegram
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 