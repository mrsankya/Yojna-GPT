
import React, { useState } from 'react';
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
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const points = profile.citizenPoints || 0;

  // Improved calculation: Show progress relative to the CURRENT tier range
  const getTierInfo = (pts: number) => {
    if (pts >= 5000) {
      return { label: 'Gold Elite', next: 'MAX', percent: 100, icon: '🌟', color: 'from-yellow-400 to-orange-500' };
    }
    if (pts >= 2500) {
      const tierProgress = ((pts - 2500) / (5000 - 2500)) * 100;
      return { label: 'Gold Explorer', next: '5,000', percent: tierProgress, icon: '🥇', color: 'from-orange-400 to-yellow-500' };
    }
    if (pts >= 1000) {
      const tierProgress = ((pts - 1000) / (2500 - 1000)) * 100;
      return { label: 'Silver Citizen', next: '2,500', percent: tierProgress, icon: '🥈', color: 'from-slate-300 to-slate-100' };
    }
    const tierProgress = (pts / 1000) * 100;
    return { label: 'Bronze Starter', next: '1,000', percent: tierProgress, icon: '🥉', color: 'from-orange-700 to-orange-500' };
  };

  const tier = getTierInfo(points);

  const NavButton = ({ view, icon, label, badge }: { view: AppView, icon: string, label: string, badge?: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-medium group ${
        currentView === view 
          ? 'bg-orange-600 text-white shadow-lg' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
          currentView === view ? 'bg-orange-400 text-white' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-[85vw] sm:w-80 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-full overflow-y-auto p-5 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
      lg:static lg:translate-x-0 lg:shadow-none lg:w-80 lg:z-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">Y</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">YojnaGPT</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 lg:hidden">
            <i className="fa-solid fa-xmark text-slate-400"></i>
          </button>
        </div>
      </div>

      {/* User Progress Card - Stabilized Height and Fixed Indicator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-5 rounded-3xl shadow-xl border border-slate-700/50 relative overflow-hidden min-h-[140px] flex flex-col justify-center">
        <button 
          onClick={() => setShowPointsInfo(!showPointsInfo)}
          className="absolute top-4 right-4 text-slate-500 hover:text-orange-400 transition-colors z-10"
        >
          <i className="fa-solid fa-circle-info text-xs"></i>
        </button>

        {showPointsInfo ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h4 className="text-[10px] font-bold text-orange-500 uppercase mb-3">Tier Perks</h4>
            <ul className="text-[10px] text-slate-300 space-y-2">
              <li className="flex items-center gap-2">
                {points >= 1000 ? <span className="text-green-500">✅</span> : <span className="text-slate-600">🔒</span>} 
                <span className={points >= 1000 ? 'text-white font-medium' : 'text-slate-500'}>WhatsApp Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                {points >= 2500 ? <span className="text-green-500">✅</span> : <span className="text-slate-600">🔒</span>} 
                <span className={points >= 2500 ? 'text-white font-medium' : 'text-slate-500'}>AI Doc Checker</span>
              </li>
              <li className="flex items-center gap-2">
                {points >= 5000 ? <span className="text-green-500">✅</span> : <span className="text-slate-600">🔒</span>} 
                <span className={points >= 5000 ? 'text-white font-medium' : 'text-slate-500'}>DigiLocker Link</span>
              </li>
            </ul>
            <button onClick={() => setShowPointsInfo(false)} className="text-[9px] text-orange-400 font-bold mt-4 hover:underline uppercase tracking-tighter">Back to progress</button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-sm border border-white/5">{tier.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none mb-1">{tier.label}</p>
                <h3 className="text-white font-bold text-lg leading-none">{profile.fullName?.split(' ')[0]}</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{tier.next === 'MAX' ? 'Max Level Reached' : `Next: ${tier.next} pts`}</span>
                <span className="text-white">{points.toLocaleString()} <span className="text-slate-500">pts</span></span>
              </div>
              <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(249,115,22,0.3)]`} 
                  style={{ width: `${Math.max(tier.percent, 5)}%` }} // Minimum 5% width to make it visible
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="space-y-1">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Main Menu</h3>
        <NavButton view="chat" icon="💬" label={t('nav_chat', language)} />
        <NavButton view="discovery" icon="✨" label={t('nav_discovery', language)} badge="NEW" />
        <NavButton view="profile" icon="👤" label={t('nav_profile', language)} />
        <NavButton view="admin" icon="🛡️" label={t('nav_admin', language)} />
      </nav>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Govt. Toolkit</h3>
        <button 
          onClick={onOpenComparator}
          className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-code-compare text-xs"></i>
          </div>
          <span className="text-sm">{t('btn_compare', language)}</span>
        </button>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border dark:border-slate-800">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">App Language</label>
          <div className="relative">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 text-xs font-bold rounded-lg p-2 outline-none appearance-none cursor-pointer"
            >
              {INDIAN_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Integrations Hub</h3>
        <div className="space-y-3">
          <div className={`flex items-center justify-between group ${points >= 5000 ? 'cursor-pointer' : 'cursor-help'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${points >= 5000 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <i className="fa-solid fa-folder-open text-xs"></i>
              </div>
              <p className={`text-[11px] font-bold ${points >= 5000 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400'}`}>DigiLocker</p>
            </div>
            {points >= 5000 ? (
               <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black uppercase">Sync</span>
            ) : (
               <i className="fa-solid fa-lock text-[8px] text-slate-400"></i>
            )}
          </div>
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => onViewChange('discovery')}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600`}>
                <i className="fa-brands fa-whatsapp text-xs"></i>
              </div>
              <p className="text-[11px] font-bold dark:text-slate-200">WA Alerts</p>
            </div>
            {points >= 1000 ? (
               <span className="text-[8px] px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded font-black uppercase">Active</span>
            ) : (
               <i className="fa-solid fa-lock text-[8px] text-slate-400"></i>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t dark:border-slate-800 space-y-2">
        <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-2">
          <i className="fa-solid fa-circle-question"></i> Help & Support
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold text-sm mt-2"
        >
          <i className="fa-solid fa-power-off"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
