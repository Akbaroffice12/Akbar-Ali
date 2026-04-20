import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth, googleProvider, signInWithPopup, signOut } from '../../firebase';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-fuchsia-600 p-1.5 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">
              AR TOOLS<span className="text-fuchsia-600"> PDF</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-fuchsia-600 transition-colors">ALL PDF TOOLS</Link>
            <Link to="/tool/merge" className="text-sm font-semibold text-gray-600 hover:text-fuchsia-600 transition-colors">MERGE</Link>
            <Link to="/tool/split" className="text-sm font-semibold text-gray-600 hover:text-fuchsia-600 transition-colors">SPLIT</Link>
            <Link to="/tool/compress" className="text-sm font-semibold text-gray-600 hover:text-fuchsia-600 transition-colors">COMPRESS</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={16} className="text-gray-400" />
                  )}
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="hidden sm:block text-sm font-bold px-6 py-2.5 rounded-full bg-gray-900 text-white hover:bg-fuchsia-600 transition-all shadow-lg shadow-gray-200"
              >
                Login
              </button>
            )}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4">
          <Link to="/" className="block text-base font-semibold text-gray-600">ALL PDF TOOLS</Link>
          <Link to="/tool/merge" className="block text-base font-semibold text-gray-600">MERGE</Link>
          <Link to="/tool/split" className="block text-base font-semibold text-gray-600">SPLIT</Link>
          <Link to="/tool/compress" className="block text-base font-semibold text-gray-600">COMPRESS</Link>
          {!user && (
            <button 
              onClick={handleLogin}
              className="w-full text-left text-base font-semibold text-fuchsia-600"
            >
              LOGIN
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
