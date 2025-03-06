'use client';
import { Upload, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/utils/auth';
import AuthModal from '@/components/AuthModal';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setid] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          setid(session)
          console.log(session)
          setIsLoggedIn(true);
          router.push(`/home/${session}`);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Seekure</h1>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" 
              className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Briefcase size={16} className="hidden sm:inline" />
              Dashboard
            </Link>
          ) : (
            <div 
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Get Started
            </div>
          )}
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 z-50 md:hidden flex flex-col gap-4">
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 py-2 transition-colors">Blog</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 py-2 transition-colors">Contact</Link>
            {isLoggedIn ? (
              <Link href="/dashboard" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Briefcase size={16} />
                Dashboard
              </Link>
            ) : (
              <div 
                onClick={() => {
                  setIsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all text-center cursor-pointer"
              >
                Get Started
              </div>
            )}
          </div>
        )}
      </nav>
      <AuthModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />

      {/* Main Content */}
      <main className="container mx-auto py-4 px-4 sm:px-6 flex flex-col items-center justify-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 mt-4 sm:mt-8">
          <span className="text-indigo-600">Seek</span> and{' '}
          <span className="text-purple-600">Secure</span>{' '}
          <span className="block mt-2 bg-clip-text">
            Your Dream Job
          </span>
        </h2>

        {/* Upload Section or Dashboard Button */}
        {isLoggedIn ? (
  <Link href={`/home/${id}`} className="mt-6 sm:mt-8 mb-2">
    <button className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-bold tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)]">
      {/* Background animation */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-shimmer"></div>
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        <span className="text-base sm:text-lg">Go to Dashboard {">"}</span>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 opacity-20"></div>
    </button>
  </Link>
) : (
  <button 
    className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-bold tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] mt-6 sm:mt-8"
    onClick={() => setIsOpen(true)}
  >
    {/* Background animation */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-shimmer"></div>
    
    {/* Content */}
    <div className="relative flex items-center gap-2">
      <span className="text-base sm:text-lg">Get Started {">"}</span>
    </div>
    
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 opacity-20"></div>
  </button>
)}

        {/* 3D Character */}
        <div className="mt-6 sm:mt-8">
          <Image
            src="/3dcharacter.png"
            alt="Happy professional"
            className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md"
            width={400}
            height={200}
            priority
          />
        </div>

        {/* Platform Logos Section */}
        <div className="w-full sm:w-auto bg-[#0A1121] rounded-xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 mt-8 sm:mt-12">
          <div className="container mx-auto">
            <div className="flex flex-col items-center">
              <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg text-center">Trusted by 1M+ Business</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 justify-items-center">
                {[
                  { name: 'LinkedIn', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
                  { name: 'Glassdoor', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg' },
                  { name: 'Google', url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' },
                  { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
                  { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                  { name: 'Telegram', url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg' }
                ].map((company) => (
                  <div key={company.name} className="flex-shrink-0">
                    <Image
                      src={company.url}
                      alt={`${company.name} logo`}
                      width={80}
                      height={30}
                      className="h-6 sm:h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}