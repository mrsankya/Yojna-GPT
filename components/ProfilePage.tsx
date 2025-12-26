
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { t } from '../constants';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  language: string;
}

const ProfilePage: React.FC<Props> = ({ profile, setProfile, language }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const points = profile.citizenPoints || 0;

  const completionPercentage = useMemo(() => {
    const fields: (keyof UserProfile)[] = ['fullName', 'email', 'phoneNumber', 'location', 'age', 'occupation', 'category'];
    const filled = fields.filter(f => !!profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const getTierName = (pts: number) => {
    if (pts >= 5000) return 'Gold Elite';
    if (pts >= 2500) return 'Gold Explorer';
    if (pts >= 1000) return 'Silver Citizen';
    return 'Bronze Starter';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        
        {/* Header Profile Card */}
        <div className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border dark:border-slate-700">
          <div className="absolute top-6 right-6 flex gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all text-sm group"
              >
                <i className="fa-solid fa-pen-to-square group-hover:rotate-12 transition-transform"></i>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                 <button 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-4xl border-4 border-white dark:border-slate-700 shadow-lg">
                🇮🇳
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-white text-[10px]">
                <i className="fa-solid fa-check"></i>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.fullName || 'Citizen User'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                  <i className="fa-solid fa-location-dot text-orange-500"></i> {profile.location || 'Location not set'}
                </p>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden md:block"></span>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                  <i className="fa-solid fa-briefcase text-orange-500"></i> {profile.occupation || 'Occupation not set'}
                </p>
              </div>
            </div>

            <div className="md:text-right space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citizen Trust Score</p>
              <div className="flex items-center md:justify-end gap-2">
                <span className="text-3xl font-black text-orange-600">{points.toLocaleString()}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded">{getTierName(points)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
               <div className="flex justify-between items-center mb-2">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Strength</p>
                 <p className="text-xs font-black text-orange-600">{completionPercentage}%</p>
               </div>
               <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
               </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              {points >= 5000 ? "Amazing! You have maxed out your citizen profile. All exclusive features are unlocked." : "Complete your profile to unlock high-tier schemes and faster AI verifications."}
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 md:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <i className="fa-solid fa-gift text-9xl"></i>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              💎 Citizen Trust Perks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">📱</div>
                  <h4 className="font-bold">WhatsApp Sync</h4>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">Receive personalized scheme alerts directly on your WhatsApp. (1,000 pts)</p>
                <div className={`mt-3 flex items-center gap-2 text-[10px] font-bold ${points >= 1000 ? 'text-green-300' : 'text-orange-200'}`}>
                  {points >= 1000 ? <><i className="fa-solid fa-circle-check"></i> UNLOCKED</> : <><i className="fa-solid fa-lock"></i> LOCKED</>}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">🤖</div>
                  <h4 className="font-bold">AI Doc Pre-Check</h4>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">Our AI scans your documents for rejection risks. (2,500 pts)</p>
                <div className={`mt-3 flex items-center gap-2 text-[10px] font-bold ${points >= 2500 ? 'text-green-300' : 'text-orange-200'}`}>
                  {points >= 2500 ? <><i className="fa-solid fa-circle-check"></i> UNLOCKED</> : <><i className="fa-solid fa-lock"></i> {2500 - points} PTS NEEDED</>}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">⚡</div>
                  <h4 className="font-bold">Elite DigiLocker Sync</h4>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">Automated document fetching from state servers. (5,000 pts)</p>
                <div className={`mt-3 flex items-center gap-2 text-[10px] font-bold ${points >= 5000 ? 'text-green-300' : 'text-orange-200'}`}>
                  {points >= 5000 ? <><i className="fa-solid fa-circle-check"></i> UNLOCKED</> : <><i className="fa-solid fa-lock"></i> {5000 - points} PTS NEEDED</>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <i className="fa-solid fa-id-card text-orange-500"></i> {t('profile_details', language)}
                </h3>
                {isEditing && (
                  <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded animate-pulse">EDITING MODE</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: tempProfile.fullName || '', name: 'fullName', type: 'text' },
                  { label: 'Email Address', value: tempProfile.email || '', name: 'email', type: 'email' },
                  { label: 'Phone Number', value: tempProfile.phoneNumber || '', name: 'phoneNumber', type: 'tel' },
                  { label: 'Location/State', value: tempProfile.location || '', name: 'location', type: 'text' },
                  { label: 'Age', value: tempProfile.age || '', name: 'age', type: 'number' },
                  { label: 'Occupation', value: tempProfile.occupation || '', name: 'occupation', type: 'text' },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all ${
                    isEditing 
                      ? 'bg-orange-50/30 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800' 
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                  }`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                    <input 
                      type={item.type}
                      name={item.name}
                      value={item.value}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent font-semibold text-slate-900 dark:text-slate-200 outline-none ${
                        !isEditing ? 'cursor-default' : 'cursor-text'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-8 pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                   <button 
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-8 py-2.5 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                  >
                    Save All
                  </button>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Points Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Profile Completion</span>
                  <span className="font-bold text-green-600">+500 pts</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Identity Verified</span>
                  <span className="font-bold text-green-600">+450 pts</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Activity Level</span>
                  <span className="font-bold text-green-600">{points > 1000 ? `+${points - 950}` : '+50'} pts</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
