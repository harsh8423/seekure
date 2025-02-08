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
      <nav className="container mx-auto px-6 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Seekure</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Briefcase size={18} />
              Dashboard
            </Link>
          ) : (
            <div onClick={() => setIsOpen(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all"
            >
              Get Started
            </div>
          )}
        </div>
      </nav>
      <AuthModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />

      {/* Main Content */}
      <main className="container mx-auto py-4 px-6 flex flex-col items-center justify-center">
        <h2 className="text-6xl font-bold text-center mb-4">
          <span className="text-indigo-600">Seek</span> and{' '}
          <span className="text-purple-600">Secure</span>{' '}
          <span className="block mt-2 bg-clip-text">
            Your Dream Job
          </span>
        </h2>

        {/* Upload Section or Dashboard Button */}
        {isLoggedIn ? (
          <Link href={`/home/${id}`} className="mt-8 mb-2">
          <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)]">
            {/* Background animation */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-shimmer"></div>
            
            {/* Content */}
            <div className="relative flex items-center gap-2">
              <span className="text-lg">Go to Dashboard {">"}</span>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 opacity-20"></div>
          </button>
        </Link>
        ) : (
          <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)]"
            onClick={() => setIsOpen(true)}
          >
            {/* Background animation */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-shimmer"></div>
            
            {/* Content */}
            <div className="relative flex items-center gap-2">
              <span className="text-lg">Get Started {">"}</span>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 opacity-20"></div>
          </button>
        )}

        {/* 3D Character */}
        <div className="">
          <Image
            src="/3dcharacter.png"
            alt="Happy professional"
            className=""
            width={400}
            height={200}
          />
        </div>

        {/* Platform Logos Section */}
        <div className="w-auto bg-[#0A1121] rounded-xl px-12 py-8 mt-12">
          <div className="container mx-auto">
            <div className="flex flex-col items-center">
              <p className="text-gray-400 mb-8 text-lg">Trusted by 1M+ Business</p>
              <div className="flex justify-center items-center gap-16 flex-wrap">
              {[
              { name: 'LinkedIn', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
              // { name: 'Indeed', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.png' },
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
                  width={120}
                  height={48}
                  className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
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