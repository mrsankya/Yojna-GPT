
import React from 'react';
import { UserProfile, AppView } from '../types';
import { INDIAN_LANGUAGES, t } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  language: string;
  setLanguage: (l: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  onOpenComparator: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<Props> = ({ 
  isOpen,
  onClose,
  profile, 
  setProfile, 
  language, 
  setLanguage, 
  isDark, 
  toggleDark, 
  onOpenComparator,
  currentView,
  onViewChange,
  onLogout
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const NavButton = ({ view, icon, label }: { view: AppView, icon: string, label: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
        currentView === view 
          ? 'bg-orange-600 text-white shadow-md' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-[85vw] sm:w-80 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
      lg:static lg:translate-x-0 lg:shadow-none lg:w-80 lg:z-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-orange-600">YojnaGPT</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
          {t('nav_header', language)}
        </h3>
        <NavButton view="chat" icon="💬" label={t('nav_chat', language)} />
        <NavButton view="discovery" icon="✨" label={t('nav_discovery', language)} />
        <NavButton view="profile" icon="👤" label={t('nav_profile', language)} />
        <NavButton view="admin" icon="🛡️" label={t('nav_admin', language)} />
      </div>

      <hr className="dark:border-slate-800" />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-400">
            {t('lang_label', language)}
          </label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 rounded-lg border bg-white text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none focus:border-orange-500 transition-colors"
          >
            {INDIAN_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <button 
          onClick={onOpenComparator}
          className="w-full flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 rounded-xl border border-orange-200 dark:border-orange-800 font-bold hover:bg-orange-100 dark:hover:bg-orange-900 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
          {t('btn_compare', language)}
        </button>

        <hr className="dark:border-slate-800" />

        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
          {t('eligibility_header', language)}
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1 dark:text-slate-400">
              {t('label_occupation', language)}
            </label>
            <input 
              name="occupation"
              value={profile.occupation || ''}
              onChange={handleChange}
              placeholder="e.g. Farmer, Student"
              className="w-full p-2 rounded-lg border bg-white text-slate-900 text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 dark:text-slate-400">
              {t('label_income', language)}
            </label>
            <select 
              name="income"
              value={profile.income || ''}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-white text-slate-900 text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Select Range</option>
              <option value="Below 1 Lakh">Below 1 Lakh</option>
              <option value="1-3 Lakhs">1-3 Lakhs</option>
              <option value="3-8 Lakhs">3-8 Lakhs</option>
              <option value="Above 8 Lakhs">Above 8 Lakhs</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input 
              id="disability-toggle"
              type="checkbox"
              name="disability"
              checked={profile.disability || false}
              onChange={handleChange}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="disability-toggle" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              {t('label_disability', language)}
            </label>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-all font-bold"
        >
          <span>🚪</span> Logout
        </button>
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-xl border border-orange-100 dark:border-orange-800">
          <p className="text-[10px] text-orange-800 dark:text-orange-400 leading-relaxed italic">
            Profile accuracy increases scheme matching precision by up to 95%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
