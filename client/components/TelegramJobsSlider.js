import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function TelegramJobsSlider({ messages }) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 focus:outline-none"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 focus:outline-none"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-4 py-2 px-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex-none w-[600px] bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-300"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <Link 
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  <img 
                    src="/icons/telegram.png" 
                    alt="Telegram" 
                    className="w-5 h-5"
                  />
                  {message.channel}
                </Link>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(message.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Message Content */}
              <div className="mt-2">
                <p className="text-gray-700 text-sm line-clamp-2">
                  {message.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}