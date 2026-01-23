
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onSkip: () => void;
}

const ProfileSetupModal: React.FC<Props> = ({ profile, onSave, onSkip }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [locStatus, setLocStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [detectedLocation, setDetectedLocation] = useState<string>('');

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      return;
    }

    setLocStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const address = data.address;
          const city = address.city || address.town || address.village || address.suburb || 'Unknown City';
          const state = address.state || 'India';
          const locationString = `${city}, ${state}`;
          
          setDetectedLocation(locationString);
          setFormData(prev => ({
            ...prev,
            location: locationString,
            state: state
          }));
          setLocStatus('success');
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          setLocStatus('error');
        }
      },
      () => {
        setLocStatus('error');
      },
      { timeout: 10000 }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl border dark:border-slate-700 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🇮🇳
            </div>
            <h2 className="text-2xl font-bold dark:text-white">Complete Your Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Help us find the perfect schemes for you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age</label>
                <input 
                  type="number" 
                  name="age"
                  required
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. 25"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Occupation</label>
                <input 
                  type="text" 
                  name="occupation"
                  required
                  value={formData.occupation || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. Farmer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Education</label>
                <select 
                  name="education"
                  value={formData.education || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="" disabled>Select</option>
                  <option value="Primary">Primary</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Diploma/ITI">Diploma/ITI</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Annual Income</label>
              <select 
                name="income"
                value={formData.income}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="Below 1 Lakh">Below 1 Lakh</option>
                <option value="1-3 Lakhs">1-3 Lakhs</option>
                <option value="3-5 Lakhs">3-5 Lakhs</option>
                <option value="5-8 Lakhs">5-8 Lakhs</option>
                <option value="Above 8 Lakhs">Above 8 Lakhs</option>
              </select>
            </div>

            <div className="pt-2">
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                locStatus === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{locStatus === 'success' ? '📍' : '🗺️'}</span>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] font-bold dark:text-slate-300">LOCATION ACCESS</p>
                    <p className="text-[9px] text-slate-500 truncate max-w-[180px]">
                      {locStatus === 'fetching' ? 'Detecting City/State...' : 
                       locStatus === 'success' ? detectedLocation : 
                       'Permission requested'}
                    </p>
                  </div>
                </div>
                {locStatus !== 'success' && (
                  <button type="button" onClick={fetchLocation} className="text-[10px] font-bold text-orange-600 hover:underline shrink-0">RETRY</button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                type="submit"
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all active:scale-95"
              >
                Save & Start Exploring
              </button>
              <button 
                type="button"
                onClick={onSkip}
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-xs transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
