import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TOOLS } from './constants';
import { ToolPage } from './pages/ToolPage';
import { AIToolPage } from './pages/AIToolPage';
import { Home } from './pages/Home';
import * as Icons from 'lucide-react';
import { cn } from './lib/utils';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth, googleProvider, signInWithPopup, signOut } from './firebase';

function MainApp() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const categories = Array.from(new Set(TOOLS.map(t => t.category)));

  const handleToolSelect = (id: string) => {
    setActiveTool(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button onClick={() => handleToolSelect('')} className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-fuchsia-600 p-1.5 rounded-lg flex items-center justify-center w-8 h-8 shadow-md">
              <span className="text-white font-black text-sm italic tracking-tighter">AZ</span>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">AZ <span className="text-fuchsia-600">PDF</span></span>
          </div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-10 -mt-1">One App—For Everything</span>
        </button>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
          {mobileMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-200 hidden md:flex flex-col items-start cursor-pointer" onClick={() => handleToolSelect('')}>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-fuchsia-600 p-1.5 rounded-lg flex items-center justify-center w-8 h-8 shadow-md">
              <span className="text-white font-black text-sm italic tracking-tighter">AZ</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">AZ <span className="text-fuchsia-600">PDF</span></h1>
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-10 mt-0.5">One App—For Everything</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-16 md:mt-0">
          <div className="space-y-1">
            <button
              onClick={() => handleToolSelect('')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                !activeTool ? "bg-fuchsia-50 text-fuchsia-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icons.Home size={18} className={!activeTool ? "text-fuchsia-600" : "text-gray-400"} />
              <span className="truncate">Home Dashboard</span>
            </button>
          </div>

          {categories.map(category => (
            <div key={category}>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">
                {category === 'ORGANIZE' ? 'Organize PDF' :
                 category === 'OPTIMIZE' ? 'Optimize PDF' :
                 category === 'CONVERT' ? 'Convert PDF' :
                 category === 'EDIT' ? 'Edit PDF' :
                 category === 'SECURITY' ? 'PDF Security' :
                 category === 'INTELLIGENCE' ? 'PDF Intelligence' :
                 category === 'WORKFLOWS' ? 'Workflows' : category}
              </h3>
              <div className="space-y-1">
                {TOOLS.filter(t => t.category === category).map(tool => {
                  const Icon = (Icons as any)[tool.icon] || Icons.File;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                        isActive ? "bg-fuchsia-50 text-fuchsia-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon size={18} className={isActive ? "text-fuchsia-600" : "text-gray-400"} />
                      <span className="truncate">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile / Auth */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Icons.User size={16} className="text-gray-500" /></div>
                )}
                <span className="text-sm font-bold text-gray-900 truncate">{user.displayName?.split(' ')[0] || 'User'}</span>
              </div>
              <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-fuchsia-600 transition-colors" title="Sign Out">
                <Icons.LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await signInWithPopup(auth, googleProvider);
                } catch (error: any) {
                  if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                    console.log('Sign-in popup closed by user.');
                  } else {
                    console.error('Sign-in error:', error);
                  }
                }
              }} 
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-fuchsia-600 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto">
          {activeTool ? (
            activeTool.startsWith('ai-') ? (
              <AIToolPage toolId={activeTool} />
            ) : (
              <ToolPage toolId={activeTool} />
            )
          ) : (
            <Home onToolSelect={handleToolSelect} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
