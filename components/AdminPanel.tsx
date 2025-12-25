
import React, { useState, useEffect } from 'react';
import { t } from '../constants';

interface Props {
  language: string;
}

// Fixed: Removed the local 'declare global' for Window['aistudio'] because it conflicts 
// with the existing global definition of 'AIStudio' in the execution environment.

const AdminPanel: React.FC<Props> = ({ language }) => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      // Fixed: Accessing aistudio through (window as any) to bypass local type conflicts 
      // while maintaining compatibility with the pre-configured 'AIStudio' object.
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.warn("AI Studio key manager not available in this environment.");
    }
  };

  const handleUpdateKey = async () => {
    try {
      // Fixed: Accessing aistudio through (window as any) to avoid identical modifier and type mismatch errors.
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const stats = [
    { label: t('admin_queries', language), value: '12,842', trend: '+12%', color: 'blue' },
    { label: t('admin_success', language), value: '8,421', trend: '+8%', color: 'green' },
    { label: 'Avg Session Time', value: '4m 12s', trend: '-2%', color: 'orange' },
    { label: 'Top Language', value: 'Hindi', trend: 'Steady', color: 'purple' },
  ];

  const feedback = [
    { user: 'Rahul S.', status: 'Positive', query: 'PM Kisan Eligibility', date: '10m ago' },
    { user: 'Anita M.', status: 'Neutral', query: 'Documents for PMAY', date: '25m ago' },
    { user: 'Suresh K.', status: 'Positive', query: 'Education Loans', date: '1h ago' },
    { user: 'Priya R.', status: 'Frustrated', query: 'Portal Link Dead', date: '2h ago' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Monitoring YojnaGPT Performance</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-bold dark:text-slate-300">Export PDF</button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">System Status: OK</button>
          </div>
        </header>

        {/* API Management Section */}
        <section className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center text-2xl">
                🔑
              </div>
              <div>
                <h3 className="font-bold text-orange-900 dark:text-orange-200">API Key Management</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {hasKey 
                    ? "A custom API key is currently active. You can update it if you encounter limits." 
                    : "Using default system API key. Switch to a custom key for higher limits."}
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] font-bold underline text-orange-600 hover:text-orange-700 mt-1 block"
                >
                  Learn about Gemini API billing & limits
                </a>
              </div>
            </div>
            <button 
              onClick={handleUpdateKey}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <span>⚙️</span> Update API Key
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black dark:text-white">{s.value}</span>
                <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {s.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b dark:border-slate-700">
              <h3 className="font-bold dark:text-white">Recent Citizen Interactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Query</th>
                    <th className="px-6 py-4">Sentiment</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {feedback.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm dark:text-slate-200">{f.user}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{f.query}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          f.status === 'Positive' ? 'bg-green-100 text-green-700' : 
                          f.status === 'Neutral' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
            <h3 className="font-bold mb-4 dark:text-white">System Alerts</h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-xl">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">CRITICAL</p>
                <p className="text-sm dark:text-slate-300">API usage spiking in Maharashtra region.</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 rounded-r-xl">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">WARNING</p>
                <p className="text-sm dark:text-slate-300">Latency increased by 150ms for Tamil queries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
