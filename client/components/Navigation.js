// components/Navigation.js
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 backdrop-blur-lg bg-gradient-to-b from-white/90 to-white/50 border-b border-white/20 z-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Link href="/home" className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Seekure
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative group">
              <Link 
                href="/home" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline-block">Home</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-purple-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} className="relative group">
              <Link 
                href="/profile" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline-block">Profile</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-purple-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} className="relative group">
              <Link 
                href="/settings" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline-block">Settings</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-purple-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} className="relative group">
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline-block">Sign Out</span>
              </button>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}