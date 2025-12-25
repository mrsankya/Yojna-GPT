
import React from 'react';
import { UserProfile } from '../types';
import { t } from '../constants';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  language: string;
}

const ProfilePage: React.FC<Props> = ({ profile, setProfile, language }) => {
  const completion = 75; // Simulated completion percentage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border dark:border-slate-700">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-4xl border-4 border-white dark:border-slate-700 shadow-lg">
              🇮🇳
            </div>
            <div>
              <input 
                name="fullName"
                value={profile.fullName || ''}
                onChange={handleChange}
                className="text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-orange-500 outline-none"
              />
              <p className="text-slate-500 dark:text-slate-400 mt-1">{profile.location || 'Location not set'}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">Verified User</span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800">Active Explorer</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Profile Completion</p>
            <div className="w-48 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${completion}%` }}></div>
            </div>
            <p className="text-sm font-bold text-orange-600">{completion}% Complete</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                📝 {t('profile_details', language)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: profile.fullName || '', name: 'fullName', type: 'text' },
                  { label: 'Email Address', value: profile.email || '', name: 'email', type: 'email' },
                  { label: 'Phone Number', value: profile.phoneNumber || '', name: 'phoneNumber', type: 'tel' },
                  { label: 'Location/State', value: profile.location || '', name: 'location', type: 'text' },
                  { label: 'Age', value: profile.age || '', name: 'age', type: 'number' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700 focus-within:border-orange-500 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                    <input 
                      type={item.type}
                      name={item.name}
                      value={item.value}
                      onChange={handleChange}
                      className="w-full bg-transparent font-semibold text-slate-900 dark:text-slate-200 outline-none"
                    />
                  </div>
                ))}
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700 focus-within:border-orange-500 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Category</p>
                  <select 
                    name="category"
                    value={profile.category || 'General'}
                    onChange={handleChange}
                    className="w-full bg-transparent font-semibold text-slate-900 dark:text-slate-200 outline-none"
                  >
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                {t('profile_docs', language)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Aadhaar Card', 'Ration Card', 'Income Certificate'].map((doc, idx) => (
                  <div key={idx} className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer transition-colors">
                    <span className="text-2xl">📄</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{doc}</p>
                    <span className="text-[10px] text-green-600 font-bold">● Verified</span>
                  </div>
                ))}
                <div className="p-4 border-2 border-dashed border-orange-200 dark:border-orange-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 bg-orange-50/30 dark:bg-orange-900/5 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer transition-colors group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                    <p className="text-xs font-bold text-orange-600">Upload New</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-orange-600 text-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">{t('profile_points', language)}</h3>
              <div className="text-center py-4">
                <span className="text-5xl font-black">1,450</span>
                <p className="text-orange-200 text-sm mt-2">Level 3: Active Citizen</p>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{t('profile_saved', language)}</h3>
              <div className="space-y-3">
                {[
                  { name: 'PM-Kisan Samman', date: '2 days ago' },
                  { name: 'Ayushman Bharat', date: '1 week ago' },
                  { name: 'Jan Dhan Yojana', date: 'Just now' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:border-orange-500 border border-transparent transition-all cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.date}</p>
                    </div>
                    <span className="text-orange-600">➡️</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
