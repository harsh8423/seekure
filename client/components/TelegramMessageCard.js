import { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Send } from 'lucide-react';
import TelegramMessageDetailModal from './TelegramMessageDetailModal';

export default function TelegramMessageCard({ message }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Send className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{message.channel}</h3>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(message.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none text-sm line-clamp-3 mb-3">
            <div dangerouslySetInnerHTML={{ __html: message.message.replace(/\n/g, '<br/>') }} />
          </div>
          
          {message.url && (
            <a 
              href={message.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors text-xs font-medium"
              onClick={(e) => e.stopPropagation()} // Prevent card click
            >
              View in Telegram
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <TelegramMessageDetailModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        message={message}
      />
    </>
  );
}