
import React, { useState, useEffect } from 'react';
import ProfileSidebar from './components/ProfileSidebar';
import ChatInterface from './components/ChatInterface';
import VoiceOverlay from './components/VoiceOverlay';
import SchemeComparator from './components/SchemeComparator';
import ProfilePage from './components/ProfilePage';
import AdminPanel from './components/AdminPanel';
import NewSchemesPage from './components/NewSchemesPage';
import AuthPage from './components/AuthPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { UserProfile, AppLanguage, AppView, Message } from './types';
import { SYSTEM_PROMPT, t } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    category: 'General',
    disability: false,
    fullName: '',
    location: 'Lucknow, Uttar Pradesh',
    email: '',
    phoneNumber: '',
    state: 'Uttar Pradesh',
    age: 28,
    income: '1-3 Lakhs',
    occupation: 'Citizen',
    citizenPoints: 1450,
    isAdmin: false
  });
  
  const [language, setLanguage] = useState<string>(AppLanguage.ENGLISH);
  const [isDark, setIsDark] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const [messages, setMessages] = useState<Message[]>([]);

  // 1. Initial Load: Check for active session
  useEffect(() => {
    const savedUser = localStorage.getItem('yojnagpt_active_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setProfile(parsedUser);
      setIsAuthenticated(true);
      
      const savedHistory = localStorage.getItem(`yojnagpt_history_${parsedUser.fullName}`);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }

      const setupDismissed = localStorage.getItem(`yojnagpt_setup_dismissed_${parsedUser.fullName}`);
      if (!setupDismissed && parsedUser.fullName && (!parsedUser.age || parsedUser.age === 28)) {
        setShowSetup(true);
      }
    }
    
    const savedTheme = localStorage.getItem('yojnagpt_theme');
    if (savedTheme === 'dark') setIsDark(true);
  }, []);

  // 2. Persistent Save: Sync messages to local storage
  useEffect(() => {
    if (isAuthenticated && profile.fullName) {
      localStorage.setItem(`yojnagpt_history_${profile.fullName}`, JSON.stringify(messages));
    }
  }, [messages, isAuthenticated, profile.fullName]);

  // 3. Welcome Message logic
  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      setMessages([{
        id: 'welcome-msg',
        role: 'assistant',
        content: t('chat_intro', language),
        timestamp: Date.now()
      }]);
    }
  }, [language, isAuthenticated, messages.length]);

  // 4. Dark Mode Handler
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yojnagpt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yojnagpt_theme', 'light');
    }
  }, [isDark]);

  const addMessage = (content: string, role: 'user' | 'assistant', isVoice: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: Date.now(),
      isVoice
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
      // Clear logic: Set to empty array, which will then trigger the Welcome Message effect
      setMessages([]);
      if (profile.fullName) {
        localStorage.removeItem(`yojnagpt_history_${profile.fullName}`);
      }
    }
  };

  const handleLogin = (data: any) => {
    const updatedProfile = { 
      ...profile, 
      ...data,
      citizenPoints: data.isDemo ? 5000 : (data.citizenPoints || 1450)
    };
    
    setProfile(updatedProfile);
    setIsAuthenticated(true);
    localStorage.setItem('yojnagpt_active_user', JSON.stringify(updatedProfile));
    
    const savedHistory = localStorage.getItem(`yojnagpt_history_${updatedProfile.fullName}`);
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      setMessages([]); 
    }

    const setupDismissed = localStorage.getItem(`yojnagpt_setup_dismissed_${updatedProfile.fullName}`);
    setShowSetup(!setupDismissed);
  };

  const handleSaveSetup = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setShowSetup(false);
    localStorage.setItem('yojnagpt_active_user', JSON.stringify(updatedProfile));
    localStorage.setItem(`yojnagpt_setup_dismissed_${updatedProfile.fullName}`, 'true');
    addMessage(`Profile updated successfully! I am now ready to provide personalized recommendations for ${updatedProfile.occupation} in ${updatedProfile.location}.`, 'assistant');
  };

  const handleSkipSetup = () => {
    setShowSetup(false);
    if (profile.fullName) {
      localStorage.setItem(`yojnagpt_setup_dismissed_${profile.fullName}`, 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('yojnagpt_active_user');
    setMessages([]);
    setCurrentView('chat');
    setShowSetup(false);
    setProfile(prev => ({ 
      ...prev, 
      fullName: '', 
      isAdmin: false, 
      isDemo: false,
      occupation: 'Citizen'
    }));
  };

  const getTier = (points: number) => {
    if (points >= 5000) return 'Gold Elite';
    if (points >= 2500) return 'Gold Explorer';
    if (points >= 1000) return 'Silver Citizen';
    return 'Bronze Citizen';
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
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
              <i className="fa-solid fa-code-compare text-xs"></i>
            </button>
            <button 
              onClick={() => setIsVoiceOverlayOpen(true)}
              className="p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full"
            >
              🎤
            </button>
          </div>
        </header>

        {currentView === 'profile' ? (
          <ProfilePage profile={profile} setProfile={setProfile} language={language} />
        ) : currentView === 'admin' ? (
          profile.isAdmin ? <AdminPanel language={language} /> : <ChatInterface 
            profile={profile}
            language={language}
            messages={messages}
            setMessages={setMessages}
            isVoiceActive={false}
            onToggleVoice={() => setIsVoiceOverlayOpen(true)}
            onClearHistory={handleClearHistory}
          />
        ) : currentView === 'discovery' ? (
          <NewSchemesPage language={language} />
        ) : (
          <ChatInterface 
            profile={profile}
            language={language}
            messages={messages}
            setMessages={setMessages}
            isVoiceActive={false}
            onToggleVoice={() => setIsVoiceOverlayOpen(true)}
            onClearHistory={handleClearHistory}
          />
        )}

        {showSetup && (
          <ProfileSetupModal 
            profile={profile} 
            onSave={handleSaveSetup} 
            onSkip={handleSkipSetup} 
          />
        )}

        {isVoiceOverlayOpen && (
          <VoiceOverlay 
            language={language}
            setLanguage={setLanguage}
            onClose={() => setIsVoiceOverlayOpen(false)}
            systemInstruction={SYSTEM_PROMPT}
            onAddMessage={addMessage}
          />
        )}

        {isComparatorOpen && (
          <SchemeComparator 
            language={language}
            onClose={() => setIsComparatorOpen(false)}
          />
        )}
      </main>

      {currentView === 'chat' && (
        <div className="hidden xl:flex fixed bottom-24 right-8 bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-2xl shadow-xl flex-col items-center gap-2 animate-bounce">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl shadow-inner">🏆</div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GPT Status</p>
            <p className="text-sm font-bold dark:text-white">{getTier(profile.citizenPoints || 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
