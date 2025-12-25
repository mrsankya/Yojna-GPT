
import React, { useState, useEffect } from 'react';
import ProfileSidebar from './components/ProfileSidebar';
import ChatInterface from './components/ChatInterface';
import VoiceOverlay from './components/VoiceOverlay';
import SchemeComparator from './components/SchemeComparator';
import ProfilePage from './components/ProfilePage';
import AdminPanel from './components/AdminPanel';
import NewSchemesPage from './components/NewSchemesPage';
import AuthPage from './components/AuthPage';
import { UserProfile, AppLanguage, AppView } from './types';
import { SYSTEM_PROMPT } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    category: 'General',
    disability: false,
    fullName: 'Arjun Sharma',
    location: 'Lucknow, Uttar Pradesh',
    email: 'arjun.sharma@example.in',
    phoneNumber: '+91 98765 43210',
    state: 'Uttar Pradesh',
    age: 28,
    income: '1-3 Lakhs',
    occupation: 'Farmer'
  });
  const [language, setLanguage] = useState<string>(AppLanguage.ENGLISH);
  const [isDark, setIsDark] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (!isAuthenticated) {
    return <AuthPage onLogin={(data) => {
      setProfile(prev => ({ ...prev, ...data }));
      setIsAuthenticated(true);
    }} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return <ProfilePage profile={profile} setProfile={setProfile} language={language} />;
      case 'admin':
        return <AdminPanel language={language} />;
      case 'discovery':
        return <NewSchemesPage language={language} />;
      case 'chat':
      default:
        return (
          <ChatInterface 
            profile={profile}
            language={language}
            isVoiceActive={false}
            onToggleVoice={() => setIsVoiceOverlayOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar with Drawer functionality on mobile */}
      <ProfileSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile} 
        setProfile={setProfile}
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        toggleDark={() => setIsDark(!isDark)}
        onOpenComparator={() => setIsComparatorOpen(true)}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false); // Close on mobile navigation
        }}
        onLogout={() => setIsAuthenticated(false)}
      />
      
      {/* Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-900 p-4 border-b dark:border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-orange-600">YojnaGPT</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsComparatorOpen(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
            </button>
            <button 
              onClick={() => setIsVoiceOverlayOpen(true)}
              className="p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full"
            >
              🎤
            </button>
          </div>
        </header>

        {renderView()}

        {isVoiceOverlayOpen && (
          <VoiceOverlay 
            language={language}
            setLanguage={setLanguage}
            onClose={() => setIsVoiceOverlayOpen(false)}
            systemInstruction={SYSTEM_PROMPT}
          />
        )}

        {isComparatorOpen && (
          <SchemeComparator 
            language={language}
            onClose={() => setIsComparatorOpen(false)}
          />
        )}
      </main>

      {/* Floating Gamification - Only show on chat */}
      {currentView === 'chat' && (
        <div className="hidden xl:flex fixed bottom-24 right-8 bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-2xl shadow-xl flex-col items-center gap-2 animate-bounce">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl shadow-inner">🏆</div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GPT Level</p>
            <p className="text-sm font-bold dark:text-white">Silver Explorer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
